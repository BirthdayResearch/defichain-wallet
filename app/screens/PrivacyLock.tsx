import { Logging } from '@api'
import { SimplifiedAppStateStatus, useAppStateContext } from '@contexts/AppStateContext'
import { PrivacyLockContextI, usePrivacyLockContext } from '@contexts/LocalAuthContext'
import { AppLastActiveTimestamp } from 'api/app_last_active'
import { useCallback, useEffect } from 'react'
import { BackHandler } from 'react-native'

export function PrivacyLock (): JSX.Element | null {
  const privacyLock = usePrivacyLockContext()
  const appState = useAppStateContext()

  const handler = useCallback((nextState: SimplifiedAppStateStatus) => {
    if (nextState === 'background') {
      AppLastActiveTimestamp.set()
        .then()
        .catch(error => Logging.error(error))
    } else if (privacyLock.isEnabled) {
      AppLastActiveTimestamp.shouldReauthenticate()
        .then(async authReq => {
          if (authReq) {
            authenticateOrExit(privacyLock)
          }
        })
        .catch(error => Logging.error(error))
    }
  }, [privacyLock.isEnabled])

  // authenticate once during cold start
  useEffect(() => {
    const id = appState.addListener(handler)
    return () => appState.removeListener(id)
  }, [handler])

  // this run only ONCE on fresh start
  // isPrivacyLock change in-app should not retrigger9
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
        await AppLastActiveTimestamp.removeForceAuth()
      } catch (e) { /* value not found in secure-store, unable to delete */
      }
    })
    .catch(async () => {
      await AppLastActiveTimestamp.forceRequireReauthenticate()
      BackHandler.exitApp()
    })
    .finally(() => backHandler.remove())
}
