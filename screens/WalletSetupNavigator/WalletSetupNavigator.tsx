import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { translate } from '../../translations'
import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { WalletSetupScreen } from './screens/WalletSetupScreen'

export interface WalletParamList {
  Setup: undefined

  [key: string]: undefined | object
}

const WalletStack = createStackNavigator<WalletParamList>()

export function WalletSetupNavigator (): JSX.Element {
  return (
    <NavigationContainer linking={LinkingConfiguration}>
      <WalletStack.Navigator initialRouteName='Setup'>
        <WalletStack.Screen
          name='Setup'
          component={WalletSetupScreen}
          options={{ headerTitle: translate('screens/WalletSetupScreen', 'Wallet') }}
        />
      </WalletStack.Navigator>
    </NavigationContainer>
  )
}

const LinkingConfiguration: LinkingOptions = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Setup: 'setup'
    }
  }
}
