import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as Linking from 'expo-linking'
import React, { useEffect, useState } from 'react'
import { AppState, BackHandler } from 'react-native'
import { Logging } from '../../api'
import { BiometricProtectedPasscode } from '../../api/wallet/biometric_protected_passcode'
import { DeFiChainTheme } from '../../constants/Theme'
import { PlaygroundNavigator } from '../PlaygroundNavigator/PlaygroundNavigator'
import { AppLinking, BottomTabNavigator } from './BottomTabNavigator'
import * as LocalAuthentication from 'expo-local-authentication'

const App = createStackNavigator<AppParamList>()

export interface AppParamList {
  App: undefined
  Playground: undefined
  NotFound: undefined

  [key: string]: undefined | object
}

export function AppNavigator (): JSX.Element {
  const [isDeviceProtected, setIsDeviceProtected] = useState(false)

  useEffect(() => {
    AppState.addEventListener('change', nextState => {
      if (isDeviceProtected && nextState === 'active') {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => null)
        LocalAuthentication.authenticateAsync()
          .catch(e => BackHandler.exitApp())
          .finally(() => backHandler.remove())
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
