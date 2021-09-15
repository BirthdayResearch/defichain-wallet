import { SimplifiedAppStateStatus, useAppStateContext } from '@contexts/AppStateContext'
import { PrivacyLockContextI, usePrivacyLockContext } from '@contexts/LocalAuthContext'
import { EnvironmentName, getEnvironment } from '@environment'
import { useEffect } from 'react'
import { BackHandler } from 'react-native'

const APP_LAST_ACTIVE: { force: boolean, timestamp?: number } = {
  force: false
}

function shouldReauthenticate (): boolean {
  if (APP_LAST_ACTIVE.force) {
    return true
  }

  const lastActive = APP_LAST_ACTIVE.timestamp
  if (lastActive === undefined) {
    return false
  }

  const env = getEnvironment()
  const timeout = env.name === EnvironmentName.Development ? 3000 : 60000
  return lastActive + timeout < Date.now()
}

export function PrivacyLock (): JSX.Element | null {
  const privacyLock = usePrivacyLockContext()
  const appState = useAppStateContext()

  const handler = (nextState: SimplifiedAppStateStatus): void => {
    if (nextState === 'background') {
      APP_LAST_ACTIVE.timestamp = Date.now()
    } else if (privacyLock.isEnabled) {
      if (shouldReauthenticate()) {
        authenticateOrExit(privacyLock)
      }
    }
  }

  // authenticate once during cold start
  useEffect(() => {
    const id = appState.addListener(handler)
    return () => appState.removeListener(id)
  }, [handler])

  // this run only ONCE on fresh start
  // isPrivacyLock change in-app should not re-triggered
  useEffect(() => {
    if (privacyLock.isEnabled) {
      authenticateOrExit(privacyLock)
    }
  }, [])

  return null // simplified, not "hiding" UI when authenticating
}

function authenticateOrExit (privacyLockContext: PrivacyLockContextI): void {
  const backHandler = BackHandler.addEventListener('hardwareBackPress', () => null)
  privacyLockContext.prompt()
    .then(async () => {
      try {
        APP_LAST_ACTIVE.force = false
      } catch (e) { /* value not found in secure-store, unable to delete */
      }
    })
    .catch(async () => {
      APP_LAST_ACTIVE.force = true
      BackHandler.exitApp()
    })
    .finally(() => backHandler.remove())
}
