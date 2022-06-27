import * as Linking from 'expo-linking'
import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { Theme } from '@react-navigation/native/lib/typescript/src/types'
import { createStackNavigator } from '@react-navigation/stack'
import { getDefaultTheme } from '@constants/Theme'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { PlaygroundNavigator } from '../PlaygroundNavigator/PlaygroundNavigator'
import { AppLinking, BottomTabNavigator } from './BottomTabNavigator'
import { getDefaultThemeV2 } from '@constants/ThemeV2'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'

const App = createStackNavigator<AppParamList>()

export interface AppParamList {
  App: undefined
  Playground: undefined
  NotFound: undefined

  [key: string]: undefined | object
}

export function AppNavigator (): JSX.Element {
  const { isLight } = useThemeContext()
  const DeFiChainTheme: Theme = getDefaultTheme(isLight)
  const DeFiChainThemeV2: Theme = getDefaultThemeV2(isLight)
  const { isFeatureAvailable } = useFeatureFlagContext()

  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={isFeatureAvailable('onboarding_v2') ? DeFiChainThemeV2 : DeFiChainTheme}
    >
      <App.Navigator screenOptions={{ headerShown: false }}>
        <App.Screen
          component={BottomTabNavigator}
          name='App'
        />

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
