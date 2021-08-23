import { useEffect } from 'react'
import { AppState, BackHandler } from 'react-native'
import { Logging } from '../api'
import { AppLastActiveTimestamp } from '../api/app_last_active'
import { useLocalAuthContext } from '../contexts/LocalAuthContext'

export function PrivacyLock (): JSX.Element | null {
  const localAuth = useLocalAuthContext()

  useEffect(() => {
    AppState.addEventListener('change', nextState => {
      if (nextState === 'background' || nextState === 'inactive') {
        AppLastActiveTimestamp.set()
          .then()
          .catch(error => Logging.error(error))
      } else {
        if (nextState === 'active' && localAuth.isPrivacyLock === true) {
          AppLastActiveTimestamp.shouldReauthenticate()
            .then(async authReq => {
              if (authReq) {
                const backHandler = BackHandler.addEventListener('hardwareBackPress', () => null)
                localAuth.privacyLock()
                  .catch(e => BackHandler.exitApp())
                  .finally(() => backHandler.remove())
              }
            })
            .catch(error => Logging.error(error))
        }
      }
    })
  }, [localAuth.isPrivacyLock])

  return null // simplified, not "hiding" UI when authenticating
}
