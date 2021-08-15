import { EncryptedProviderData } from '@defichain/jellyfish-wallet-encrypted'
import { LinkingOptions, NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as Linking from 'expo-linking'
import * as React from 'react'
import { WalletPersistenceData } from '../../api/wallet'
import { HeaderFont } from '../../components'
import { HeaderTitle } from '../../components/HeaderTitle'
import { DeFiChainTheme } from '../../constants/Theme'
import { translate } from '../../translations'
import { CreateMnemonicWallet } from './screens/CreateWallet/CreateMnemonicWallet'
import { CreateWalletGuidelines } from './screens/CreateWallet/CreateWalletGuidelines'
import { EnrollBiometric } from './screens/CreateWallet/EnrollBiometric'
import { GuidelinesRecoveryWords } from './screens/CreateWallet/GuidelinesRecoveryWords'
import { PinConfirmation } from './screens/CreateWallet/PinConfirmation'
import { PinCreation } from './screens/CreateWallet/PinCreation'
import { VerifyMnemonicWallet } from './screens/CreateWallet/VerifyMnemonicWallet'
import { Onboarding } from './screens/Onboarding'
import { RestoreMnemonicWallet } from './screens/RestoreWallet/RestoreMnemonicWallet'

type PinCreationType = 'create' | 'restore'

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
    type: PinCreationType
  }
  PinConfirmation: {
    pin: string
    words: string[]
    type: PinCreationType
  }
  EnrollBiometric: {
    pin: string
    encrypted: WalletPersistenceData<EncryptedProviderData>
    words: string[]
  }

  [key: string]: undefined | object
}

const WalletStack = createStackNavigator<WalletParamList>()

const LinkingConfiguration: LinkingOptions<ReactNavigation.RootParamList> = {
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
  const navigationRef = React.useRef<NavigationContainerRef<ReactNavigation.RootParamList>>(null)

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
            headerTitle: () => <HeaderTitle text={translate('screens/WalletNavigator', 'Guidelines')} />,
            headerBackTitleVisible: false
          }}
        />
        <WalletStack.Screen
          name='GuidelinesRecoveryWords'
          component={GuidelinesRecoveryWords}
          options={{
            headerTitle: () => <HeaderTitle text={translate('screens/WalletNavigator', 'Learn More')} />,
            headerBackTitleVisible: false
          }}
        />
        <WalletStack.Screen
          name='CreateMnemonicWallet'
          component={CreateMnemonicWallet}
          options={{
            headerTitle: () => <HeaderTitle text={translate('screens/WalletNavigator', 'Display recovery words')} />,
            headerBackTitleVisible: false
          }}
        />
        <WalletStack.Screen
          name='VerifyMnemonicWallet'
          component={VerifyMnemonicWallet}
          options={{
            headerTitle: () => <HeaderTitle text={translate('screens/WalletNavigator', 'Verify words')} />,
            headerBackTitleVisible: false
          }}
        />
        <WalletStack.Screen
          name='RestoreMnemonicWallet'
          component={RestoreMnemonicWallet}
          options={{
            headerTitle: () => <HeaderTitle text={translate('screens/WalletNavigator', 'Restore Wallet')} />,
            headerBackTitleVisible: false
          }}
        />
        <WalletStack.Screen
          name='PinCreation'
          component={PinCreation}
          options={{
            headerTitle: () => <HeaderTitle text={translate('screens/WalletNavigator', 'Create a passcode')} />,
            headerBackTitleVisible: false
          }}
        />
        <WalletStack.Screen
          name='PinConfirmation'
          component={PinConfirmation}
          options={{
            headerTitle: () => <HeaderTitle text={translate('screens/WalletNavigator', 'Verify passcode')} />,
            headerBackTitleVisible: false
          }}
        />
        <WalletStack.Screen
          name='EnrollBiometric'
          component={EnrollBiometric}
          options={{
            headerTitle: () => <HeaderTitle text={translate('screens/WalletNavigator', 'Wallet Created')} />
          }}
        />
      </WalletStack.Navigator>
    </NavigationContainer>
  )
}
