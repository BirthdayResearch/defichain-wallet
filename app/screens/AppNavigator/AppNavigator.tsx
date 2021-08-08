import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as Linking from 'expo-linking'
import * as React from 'react'
import { DeFiChainTheme } from '../../constants/Theme'
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
