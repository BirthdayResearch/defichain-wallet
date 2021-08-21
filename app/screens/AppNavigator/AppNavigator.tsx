import { DarkTheme, DefaultTheme, LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { Theme } from '@react-navigation/native/lib/typescript/src/types'
import { createStackNavigator } from '@react-navigation/stack'
import * as Linking from 'expo-linking'
import * as React from 'react'
import { useThemeContext } from '../../contexts/ThemeProvider'
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
  const { theme } = useThemeContext()
  const isLight = theme === 'light'
  const defaultTheme = isLight ? DefaultTheme : DarkTheme
  const DeFiChainTheme: Theme = {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: isLight ? '#ff00af' : '#ff99df'
    }
  }
  return (
    <NavigationContainer linking={LinkingConfiguration} theme={DeFiChainTheme}>
      <App.Navigator screenOptions={{ headerShown: false }}>
        <App.Screen name='App' component={BottomTabNavigator} />
        <App.Screen name='Playground' component={PlaygroundNavigator} />
      </App.Navigator>
    </NavigationContainer>
  )
}

const LinkingConfiguration: LinkingOptions<ReactNavigation.RootParamList> = {
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
