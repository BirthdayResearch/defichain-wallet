import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { LinkingOptions, NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { translate } from '../../translations'
import { WalletOnboarding } from './screens/WalletOnboarding'
import { DeFiChainTheme } from '../../constants/Theme'

export interface WalletParamList {
  WalletOnboarding: undefined

  [key: string]: undefined | object
}

const WalletStack = createStackNavigator<WalletParamList>()

const LinkingConfiguration: LinkingOptions = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      WalletOnboarding: 'wallet/onboarding'
    }
  }
}

export function WalletNavigator (): JSX.Element {
  const navigationRef = React.useRef<NavigationContainerRef>(null)

  return (
    <NavigationContainer linking={LinkingConfiguration} ref={navigationRef} theme={DeFiChainTheme}>
      <WalletStack.Navigator initialRouteName='Setup'>
        <WalletStack.Screen
          name='WalletOnboarding'
          component={WalletOnboarding}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Wallets')
          }}
        />
      </WalletStack.Navigator>
    </NavigationContainer>
  )
}
