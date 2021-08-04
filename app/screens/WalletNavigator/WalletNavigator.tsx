import { LinkingOptions, NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as Linking from 'expo-linking'
import * as React from 'react'
import { HeaderFont } from '../../components'
import { DeFiChainTheme } from '../../constants/Theme'
import { translate } from '../../translations'
import { CreateMnemonicWallet } from './screens/CreateWallet/CreateMnemonicWallet'
import { CreateWalletGuidelines } from './screens/CreateWallet/CreateWalletGuidelines'
import { GuidelinesRecoveryWords } from './screens/CreateWallet/GuidelinesRecoveryWords'
import { VerifyMnemonicWallet } from './screens/CreateWallet/VerifyMnemonicWallet'
import { Onboarding } from './screens/Onboarding'
import { RestoreMnemonicWallet } from './screens/RestoreWallet/RestoreMnemonicWallet'
import { PinCreation } from './screens/CreateWallet/PinCreation'
import { PinConfirmation } from './screens/CreateWallet/PinConfirmation'
import { EnrollBiometric } from './screens/CreateWallet/EnrollBiometric'
import { EncryptedProviderData } from '@defichain/jellyfish-wallet-encrypted'
import { WalletPersistenceData } from '../../api/wallet/persistence'

export interface WalletParamList {
  WalletOnboardingScreen: undefined
  CreateMnemonicWallet: undefined
  VerifyMnemonicWallet: {
    words: string[]
  }
  RestoreMnemonicWallet: undefined
  PinCreation: {
    pinLength: 4 | 6
    words: string[]
  }
  PinConfirmation: {
    pin: string
    words: string[]
  }
  EnrollBiometric: {
    pin: string
    encrypted: WalletPersistenceData<EncryptedProviderData>
  }

  [key: string]: undefined | object
}

const WalletStack = createStackNavigator<WalletParamList>()

const LinkingConfiguration: LinkingOptions = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Onboarding: 'wallet/onboarding',
      CreateMnemonicWallet: 'wallet/mnemonic/create',
      CreateWalletGuidelines: 'wallet/onboarding/guidelines',
      GuidelinesRecoveryWords: 'wallet/onboarding/guidelines/recovery',
      VerifyMnemonicWallet: 'wallet/mnemonic/create/verify',
      RestoreMnemonicWallet: 'wallet/mnemonic/restore',
      PinCreation: 'wallet/pin/create',
      PinConfirmation: 'wallet/pin/confirm'
    }
  }
}

export function WalletNavigator (): JSX.Element {
  const navigationRef = React.useRef<NavigationContainerRef>(null)

  return (
    <NavigationContainer linking={LinkingConfiguration} ref={navigationRef} theme={DeFiChainTheme}>
      <WalletStack.Navigator initialRouteName='Setup' screenOptions={{ headerTitleStyle: HeaderFont }}>
        <WalletStack.Screen
          name='Onboarding'
          component={Onboarding}
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
          name='RestoreMnemonicWallet'
          component={RestoreMnemonicWallet}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Restore Wallet'),
            headerBackTitleVisible: false
          }}
        />
        <WalletStack.Screen
          name='PinCreation'
          component={PinCreation}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Create a passcode'),
            headerBackTitleVisible: false
          }}
        />
        <WalletStack.Screen
          name='PinConfirmation'
          component={PinConfirmation}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Verify passcode'),
            headerBackTitleVisible: false
          }}
        />
        <WalletStack.Screen
          name='EnrollBiometric'
          component={EnrollBiometric}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Secure your wallet')
          }}
        />
      </WalletStack.Navigator>
    </NavigationContainer>
  )
}
