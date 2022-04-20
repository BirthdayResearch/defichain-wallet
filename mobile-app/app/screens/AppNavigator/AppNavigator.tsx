import { useState } from 'react'
import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { Theme } from '@react-navigation/native/lib/typescript/src/types'
import { createStackNavigator } from '@react-navigation/stack'
import * as Linking from 'expo-linking'
import { getDefaultTheme } from '@constants/Theme'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { PlaygroundNavigator } from '../PlaygroundNavigator/PlaygroundNavigator'
import { AppLinking, BottomTabNavigator } from './BottomTabNavigator'
import { LegacyNavigator } from './screens/Legacy/LegacyNavigator'

const App = createStackNavigator<AppParamList>()

export interface AppParamList {
  App: undefined
  Playground: undefined
  Legacy: undefined
  NotFound: undefined

  [key: string]: undefined | object
}

export function AppNavigator (): JSX.Element {
  const { isLight } = useThemeContext()
  const DeFiChainTheme: Theme = getDefaultTheme(isLight)
  const [isLegacy] = useState(true)
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={DeFiChainTheme}
    >
      <App.Navigator screenOptions={{ headerShown: false }}>
        {isLegacy
        ? (
          <App.Screen
            component={LegacyNavigator}
            name='Legacy'
          />
        )
        : (
          <App.Screen
            component={BottomTabNavigator}
            name='App'
          />
        )}
        <App.Screen
          component={PlaygroundNavigator}
          name='Playground'
        />
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
