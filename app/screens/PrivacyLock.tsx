import { useEffect } from 'react'
import { AppState, BackHandler } from 'react-native'
import { useLocalAuthContext } from '../contexts/LocalAuthContext'

export function PrivacyLock (): JSX.Element | null {
  const localAuth = useLocalAuthContext()

  useEffect(() => {
    AppState.addEventListener('change', nextState => {
      if (localAuth.isPrivacyLock === true) {
        if (nextState === 'active') {
          const backHandler = BackHandler.addEventListener('hardwareBackPress', () => null)
          localAuth.privacyLock()
            .catch(e => BackHandler.exitApp())
            .finally(() => backHandler.remove())
        }
      }
    })
  }, [localAuth.isPrivacyLock])

  return null // simplified, not "hiding" UI when authenticating
}
