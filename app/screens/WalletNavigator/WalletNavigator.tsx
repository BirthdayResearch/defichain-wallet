import { LinkingOptions, NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as Linking from 'expo-linking'
import * as React from 'react'
import { HeaderFont } from '../../components/Text'
import { DeFiChainTheme } from '../../constants/Theme'
import { translate } from '../../translations'
import { CreateMnemonicWallet } from './screens/CreateWallet/CreateMnemonicWallet'
import { CreateWalletGuidelines } from './screens/CreateWallet/CreateWalletGuidelines'
import { GuidelinesRecoveryWords } from './screens/CreateWallet/GuidelinesRecoveryWords'
import { VerifyMnemonicWallet } from './screens/CreateWallet/VerifyMnemonicWallet'
import { WalletMnemonicRestore } from './screens/WalletMnemonicRestore'
import { WalletOnboarding } from './screens/WalletOnboarding'
import { PinCreation } from './screens/PinCreationScreen'
import { PinConfirmation } from './screens/PinConfirmation'

export interface WalletParamList {
  WalletOnboardingScreen: undefined
  CreateMnemonicWallet: undefined
  VerifyMnemonicWallet: {
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
      CreateMnemonicWallet: 'wallet/mnemonic/create',
      CreateWalletGuidelines: 'wallet/onboarding/guidelines',
      GuidelinesRecoveryWords: 'wallet/onboarding/guidelines/recovery',
      VerifyMnemonicWallet: 'wallet/mnemonic/create/verify',
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
            headerShown: false
          }}
        />
        <WalletStack.Screen
          name='CreateWalletGuidelines'
          component={CreateWalletGuidelines}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Guidelines'),
            headerBackTitleVisible: false
          }}
        />
        <WalletStack.Screen
          name='GuidelinesRecoveryWords'
          component={GuidelinesRecoveryWords}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Learn More'),
            headerBackTitleVisible: false
          }}
        />
        <WalletStack.Screen
          name='CreateMnemonicWallet'
          component={CreateMnemonicWallet}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Display recovery words'),
            headerBackTitleVisible: false
          }}
        />
        <WalletStack.Screen
          name='VerifyMnemonicWallet'
          component={VerifyMnemonicWallet}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Verify words'),
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
