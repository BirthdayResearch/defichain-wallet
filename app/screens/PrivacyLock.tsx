import React, { useEffect, useState } from 'react'
import { AppState, BackHandler } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import tailwind from 'tailwind-rn'
import { useLocalAuthContext } from '../contexts/LocalAuthContext'

export function PrivacyLock (): JSX.Element | null {
  const localAuth = useLocalAuthContext()
  const [authenticated, setAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    AppState.addEventListener('change', nextState => {
      if (localAuth.isPrivacyLock) {
        if (nextState === 'active') {
          const backHandler = BackHandler.addEventListener('hardwareBackPress', () => null)
          localAuth.privacyLock()
            .then(() => setAuthenticated(true))
            .catch(e => BackHandler.exitApp())
            .finally(() => backHandler.remove())
        } else {
          setAuthenticated(false)
        }
      } else {
        // no privacy lock enabled
        setAuthenticated(true)
      }
    })
  }, [localAuth.isPrivacyLock])

  if (authenticated) {
    return null
  }

  return (
    <SafeAreaView
      style={[
        tailwind('w-full h-full flex-col bg-white')
      ]}
    />
  )
}
