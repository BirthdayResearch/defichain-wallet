import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { translate } from '../../translations'
import { LinkingOptions, NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { WalletOnboarding } from './screens/WalletOnboarding'
import { Ionicons } from '@expo/vector-icons'
import { PrimaryColor } from '../../constants/Colors'
import { TouchableOpacity } from 'react-native'
import { WalletSetup } from './screens/WalletSetup'
import { WalletMnemonicCreate } from "./screens/WalletMnemonicCreate";
import { WalletMnemonicRestoreWord } from "./screens/WalletMnemonicRestoreWord";
import { WalletMnemonicRestore } from "./screens/WalletMnemonicRestore";
import { WalletMnemonicCreateVerifyWord } from "./screens/WalletMnemonicCreateVerifyWord";

export interface WalletParamList {
  WalletOnboardingScreen: undefined
  AddWallet: undefined
  WalletMnemonicCreate: undefined
  WalletMnemonicCreateVerifyWord: {
    words: {
      progress: string[]
      actual: string[]
    }
  }
  WalletMnemonicRestore: undefined
  WalletMnemonicRestoreWord: {
    words: string[]
  }

  [key: string]: undefined | object
}

const WalletStack = createStackNavigator<WalletParamList>()

const LinkingConfiguration: LinkingOptions = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      WalletOnboarding: 'wallet/onboarding',
      WalletSetup: 'wallet/setup',
      WalletMnemonicCreate: 'wallet/mnemonic/create',
      WalletMnemonicCreateVerifyWord: 'wallet/mnemonic/create/verify/word',
      WalletMnemonicRestore: 'wallet/mnemonic/restore',
      WalletMnemonicRestoreWord: 'wallet/mnemonic/restore/word',
    }
  }
}

export function WalletNavigator (): JSX.Element {
  const navigationRef = React.useRef<NavigationContainerRef>(null)

  return (
    <NavigationContainer linking={LinkingConfiguration} ref={navigationRef}>
      <WalletStack.Navigator initialRouteName='Setup'>
        <WalletStack.Screen
          name='WalletOnboarding'
          component={WalletOnboarding}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Wallets'),
            headerRight: (): JSX.Element => (
              <TouchableOpacity onPress={() => navigationRef.current?.navigate('WalletSetup')}>
                <Ionicons name='add' size={28} color={PrimaryColor} />
              </TouchableOpacity>
            ),
            headerRightContainerStyle: {
              paddingRight: 12
            }
          }}
        />
        <WalletStack.Screen
          name='WalletSetup'
          component={WalletSetup}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Add Wallet')
          }}
        />
        <WalletStack.Screen
          name='WalletMnemonicCreate'
          component={WalletMnemonicCreate}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Create Mnemonic Wallet')
          }}
        />
        <WalletStack.Screen
          name='WalletMnemonicCreateVerifyWord'
          component={WalletMnemonicCreateVerifyWord}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Verify Mnemonic Wallet')
          }}
        />
        <WalletStack.Screen
          name='WalletMnemonicRestore'
          component={WalletMnemonicRestore}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Restore Mnemonic Wallet')
          }}
        />
        <WalletStack.Screen
          name='WalletMnemonicRestoreWord'
          component={WalletMnemonicRestoreWord}
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Restore Mnemonic Wallet')
          }}
        />
      </WalletStack.Navigator>
    </NavigationContainer>
  )
}
