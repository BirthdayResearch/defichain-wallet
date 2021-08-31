import { Logging } from '@api'
import { SimplifiedAppStateStatus, useAppStateContext } from '@contexts/AppStateContext'
import { LocalAuthContext, useLocalAuthContext } from '@contexts/LocalAuthContext'
import { useCallback, useEffect } from 'react'
import { BackHandler } from 'react-native'
import { AppLastActiveTimestamp } from '../api/app_last_active'

export function PrivacyLock (): JSX.Element | null {
  const localAuth = useLocalAuthContext()
  const appState = useAppStateContext()

  const handler = useCallback((nextState: SimplifiedAppStateStatus) => {
    if (nextState === 'background') {
      AppLastActiveTimestamp.set()
        .then()
        .catch(error => Logging.error(error))
    } else if (localAuth.isPrivacyLock) {
      AppLastActiveTimestamp.shouldReauthenticate()
        .then(async authReq => {
          if (authReq) {
            authenticateOrExit(localAuth)
          }
        })
        .catch(error => Logging.error(error))
    }
  }, [localAuth.isPrivacyLock])

  // authenticate once during cold start
  useEffect(() => {
    const id = appState.addListener(handler)
    return () => appState.removeListener(id)
  }, [handler])

  // this run only ONCE on fresh start
  // isPrivacyLock change in-app should not retrigger9
  useEffect(() => {
    if (localAuth.isPrivacyLock) {
      authenticateOrExit(localAuth)
    }
  }, [])

  return null // simplified, not "hiding" UI when authenticating
}

function authenticateOrExit (localAuth: LocalAuthContext): void {
  const backHandler = BackHandler.addEventListener('hardwareBackPress', () => null)
  localAuth.privacyLock()
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
