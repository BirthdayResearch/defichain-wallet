import * as React from 'react'
import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import { NotFoundScreen } from './screens/NotFoundScreen'
import { WalletLinking, BottomTabNavigator } from './BottomTabNavigator'
import * as Linking from 'expo-linking'

const WalletStack = createStackNavigator<WalletParamList>()

export interface WalletParamList {
  Wallet: undefined
  NotFound: undefined

  [key: string]: undefined | object
}

export function WalletNavigator (): JSX.Element {
  return (
    <NavigationContainer linking={LinkingConfiguration}>
      <WalletStack.Navigator screenOptions={{ headerShown: false }}>
        <WalletStack.Screen name='Wallet' component={BottomTabNavigator} />
        <WalletStack.Screen name='NotFound' component={NotFoundScreen} options={{ title: 'Oops!' }} />
      </WalletStack.Navigator>
    </NavigationContainer>
  )
}

const LinkingConfiguration: LinkingOptions = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Wallet: {
        path: 'wallet',
        screens: WalletLinking
      },
      NotFound: '*'
    }
  }
}
