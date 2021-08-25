import { useCallback, useEffect, useRef } from 'react'
import { AppState, AppStateStatus, BackHandler } from 'react-native'
import { Logging } from '../api'
import { AppLastActiveTimestamp } from '../api/app_last_active'
import { useLocalAuthContext, LocalAuthContext } from '../contexts/LocalAuthContext'

export function PrivacyLock (): JSX.Element | null {
  const localAuth = useLocalAuthContext()

  /**
   * a dynamic event listener handling
   * array of max length 2
   * [0] get auto de-registered and spliced from the array when [1] pushed in
   * as handler itself is callback with dependency, unable to bind a single instance or any singleton pattern
   */
  const prevHandlerRef = useRef<Array<(s: AppStateStatus) => void>>([])

  const appStateHandler = useCallback((nextState: AppStateStatus) => {
    if (nextState === 'background' || nextState === 'inactive') {
      AppLastActiveTimestamp.set()
        .then()
        .catch(error => Logging.error(error))
    } else {
      if (nextState === 'active' && localAuth.isPrivacyLock === true) {
        AppLastActiveTimestamp.shouldReauthenticate()
          .then(async authReq => {
            if (authReq) authenticateOrExit(localAuth)
          })
          .catch(error => Logging.error(error))
      }
    }
  }, [localAuth.isPrivacyLock])

  useEffect(() => {
    console.log('appstate handler changed')
    AppState.addEventListener('change', appStateHandler)
    prevHandlerRef.current = [...prevHandlerRef.current, appStateHandler]
    return AppState.removeEventListener('change', appStateHandler)
  }, [appStateHandler])

  useEffect(() => {
    console.log('prev changed')
    if (prevHandlerRef.current.length > 1) {
      AppState.removeEventListener('change', prevHandlerRef.current[0])
      prevHandlerRef.current.splice(0, 1)
    }
  }, [prevHandlerRef.current])

  // authenticate once during cold start
  useEffect(() => {
    if (localAuth.isPrivacyLock === true) {
      authenticateOrExit(localAuth)
    }

    // add handler for first time
    AppState.addEventListener('change', appStateHandler)
    // remove handler on component un-mount is not needed, handler changed by state
  }, [])

  return null // simplified, not "hiding" UI when authenticating
}

function authenticateOrExit (localAuth: LocalAuthContext): void {
  const backHandler = BackHandler.addEventListener('hardwareBackPress', () => null)
  localAuth.privacyLock()
    .catch(e => BackHandler.exitApp())
    .finally(() => backHandler.remove())
}
