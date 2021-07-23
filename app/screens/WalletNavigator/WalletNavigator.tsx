import { LinkingOptions, NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as Linking from 'expo-linking'
import * as React from 'react'
import { HeaderFont } from '../../components/Text'
import { DeFiChainTheme } from '../../constants/Theme'
import { translate } from '../../translations'
import { WalletMnemonicCreate } from './screens/WalletMnemonicCreate'
import { WalletMnemonicCreateVerify } from './screens/WalletMnemonicCreateVerify'
import { WalletMnemonicRestore } from './screens/WalletMnemonicRestore'
import { WalletOnboarding } from './screens/WalletOnboarding'
import { PinCreation } from './screens/PinCreationScreen'
import { PinConfirmation } from './screens/PinConfirmation'

export interface WalletParamList {
  WalletOnboardingScreen: undefined
  WalletMnemonicCreate: undefined
  WalletMnemonicCreateVerify: {
    words: string[]
  }
  WalletMnemonicRestore: undefined
  PinCreation: {
    words: string[]
    pinLength: 4 | 6
  }
  PinConfirmation: {
    words: string[]
    pin: string
  }

  [key: string]: undefined | object
}

const WalletStack = createStackNavigator<WalletParamList>()

const LinkingConfiguration: LinkingOptions = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      WalletOnboarding: 'wallet/onboarding',
      WalletMnemonicCreate: 'wallet/mnemonic/create',
      WalletMnemonicCreateVerify: 'wallet/mnemonic/create/verify',
      WalletMnemonicRestore: 'wallet/mnemonic/restore'
    }
  }
}

export function WalletNavigator (): JSX.Element {
  const navigationRef = React.useRef<NavigationContainerRef>(null)

  return (
    <NavigationContainer linking={LinkingConfiguration} ref={navigationRef} theme={DeFiChainTheme}>
      <WalletStack.Navigator initialRouteName='Setup' screenOptions={{ headerTitleStyle: HeaderFont }}>
        <WalletStack.Screen
          name='WalletOnboarding'
          component={WalletOnboarding}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Wallets')
          }}
        />
        <WalletStack.Screen
          name='WalletMnemonicCreate'
          component={WalletMnemonicCreate}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Create Mnemonic Phrase'),
            headerBackTitleVisible: false
          }}
        />
        <WalletStack.Screen
          name='WalletMnemonicCreateVerify'
          component={WalletMnemonicCreateVerify}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Verify Mnemonic Phrase'),
            headerBackTitleVisible: false
          }}
        />
        <WalletStack.Screen
          name='WalletMnemonicRestore'
          component={WalletMnemonicRestore}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Restore Mnemonic Wallet'),
            headerBackTitleVisible: false
          }}
        />
        <WalletStack.Screen
          name='PinCreation'
          component={PinCreation}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Secure your wallet')
          }}
        />
        <WalletStack.Screen
          name='PinConfirmation'
          component={PinConfirmation}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Secure your wallet')
          }}
        />
      </WalletStack.Navigator>
    </NavigationContainer>
  )
}
