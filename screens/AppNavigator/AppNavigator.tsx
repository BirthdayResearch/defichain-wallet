import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { AppLinking, BottomTabNavigator } from './BottomTabNavigator'

const WalletStack = createStackNavigator<WalletParamList>()

export interface WalletParamList {
  Wallet: undefined
  NotFound: undefined

  [key: string]: undefined | object
}

export function AppNavigator (): JSX.Element {
  return (
    <NavigationContainer linking={LinkingConfiguration}>
      <WalletStack.Navigator screenOptions={{ headerShown: false }}>
        <WalletStack.Screen name='Wallet' component={BottomTabNavigator} />
      </WalletStack.Navigator>
    </NavigationContainer>
  )
}

const LinkingConfiguration: LinkingOptions = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Wallet: {
        path: 'app',
        screens: AppLinking
      }
    }
  }
}
