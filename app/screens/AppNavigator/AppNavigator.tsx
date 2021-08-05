import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as Linking from 'expo-linking'
import React, { useEffect, useState } from 'react'
import { AppState } from 'react-native'
import { useDispatch } from 'react-redux'
import { Logging } from '../../api'
import { BiometricProtectedPasscode } from '../../api/wallet/biometric_protected_passcode'
import { DeFiChainTheme } from '../../constants/Theme'
import { authentication } from '../../store/authentication'
import { translate } from '../../translations'
import { PlaygroundNavigator } from '../PlaygroundNavigator/PlaygroundNavigator'
import { AppLinking, BottomTabNavigator } from './BottomTabNavigator'

const App = createStackNavigator<AppParamList>()

export interface AppParamList {
  App: undefined
  Playground: undefined
  NotFound: undefined

  [key: string]: undefined | object
}

export function AppNavigator (): JSX.Element {
  const dispatch = useDispatch()
  const [isDeviceProtected, setIsDeviceProtected] = useState(false)

  useEffect(() => {
    AppState.addEventListener('change', nextState => {
      if (isDeviceProtected && nextState === 'active') {
        // privacy lock only applicable if biometric enrolled (even user chosen fallback to pin is fine)
        dispatch(authentication.actions.prompt({
          message: translate('screens/PrivacyLock', 'Welcome back, is it you? (FIXME: copy writing)'),
          consume: async () => true, // no action, not consuming retrieved passphrase
          onAuthenticated: async () => {} // no action, <TransactionAuthorization /> do auto dismissed
        }))
      }
    })
  }, [isDeviceProtected])

  useEffect(() => {
    BiometricProtectedPasscode.isEnrolled()
      .then(isEnrolled => setIsDeviceProtected(isEnrolled))
      .catch(e => Logging.error(e))
  }, [])

  return (
    <NavigationContainer linking={LinkingConfiguration} theme={DeFiChainTheme}>
      <App.Navigator screenOptions={{ headerShown: false }}>
        <App.Screen name='App' component={BottomTabNavigator} />
        <App.Screen name='Playground' component={PlaygroundNavigator} />
      </App.Navigator>
    </NavigationContainer>
  )
}

const LinkingConfiguration: LinkingOptions = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      App: {
        path: 'app',
        screens: AppLinking
      },
      Playground: {
        screens: {
          PlaygroundScreen: 'playground'
        }
      }
    }
  }
}
