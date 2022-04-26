import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as Linking from 'expo-linking'
import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { Theme } from '@react-navigation/native/lib/typescript/src/types'
import { createStackNavigator } from '@react-navigation/stack'
import { getDefaultTheme } from '@constants/Theme'
import { RootState } from '@store'
import { fetchTokens } from '@store/wallet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
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
  const { isLight } = useThemeContext()
  const DeFiChainTheme: Theme = getDefaultTheme(isLight)
  const blockCount = useSelector((state: RootState) => state.block.count)
  const { address } = useWalletContext()
  const client = useWhaleApiClient()
  const { network } = useNetworkContext()
  const dispatch = useDispatch()

  /* Global polling based on blockCount, network and address */
  useEffect(() => {
    dispatch(fetchTokens({ client, address }))
  }, [blockCount, network, address])

  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={DeFiChainTheme}
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
