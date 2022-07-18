import { LinkingOptions, NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { Theme } from '@react-navigation/native/lib/typescript/src/types'
import { createStackNavigator } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import * as Linking from 'expo-linking'
import { useRef } from 'react'
import { getDefaultTheme } from '@constants/Theme'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { translate } from '@translations'
import { CreateMnemonicWalletV2 } from './screens/CreateWallet/CreateMnemonicWalletV2'
import { CreateWalletGuidelinesV2 } from './screens/CreateWallet/CreateWalletGuidelinesV2'
import { VerifyMnemonicWalletV2 } from './screens/CreateWallet/VerifyMnemonicWalletV2'
import { HeaderNetworkStatus } from '@components/HeaderNetworkStatus'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getDefaultThemeV2 } from '@constants/ThemeV2'
import { PinCreationV2 } from '@screens/WalletNavigator/screens/CreateWallet/PinCreationV2'
import { PinConfirmationV2 } from '@screens/WalletNavigator/screens/CreateWallet/PinConfirmationV2'
import { OnboardingNetworkSelectScreenV2 } from './screens/CreateWallet/OnboardingNetworkSelectScreenV2'
import { RecoveryWordsFaqV2 } from './screens/CreateWallet/RecoveryWordsFaqV2'
import { PasscodeFaqV2 } from './screens/CreateWallet/PasscodeFaqV2'
import { Onboarding } from '@screens/WalletNavigator/screens/Onboarding'
import { WalletCreateRestoreSuccess } from './screens/CreateWallet/WalletCreateRestoreSuccess'
import { WalletPersistenceDataI } from '@shared-contexts/WalletPersistenceContext'
import { EncryptedProviderData } from '@defichain/jellyfish-wallet-encrypted'
import { RestoreMnemonicWalletV2 } from './screens/RestoreWallet/RestoreMnemonicWalletV2'
import { Dimensions, Platform } from 'react-native'

type PinCreationType = 'create' | 'restore'

export interface WalletParamList {
  VerifyMnemonicWallet: {
    words: string[]
  }
  WalletCreateRestoreSuccess: {
    isWalletRestored: boolean
    data: WalletPersistenceDataI<EncryptedProviderData>
  }
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
  [key: string]: undefined | object
}

const WalletStack = createStackNavigator<WalletParamList>()

const LinkingConfiguration: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Onboarding: 'wallet/onboarding',
      OnboardingNetworkSelectScreen: 'wallet/mnemonic/network',
      CreateMnemonicWallet: 'wallet/mnemonic/create',
      CreateWalletGuidelines: 'wallet/onboarding/guidelines',
      RecoveryWordsFaq: 'wallet/onboarding/guidelines/recovery',
      VerifyMnemonicWallet: 'wallet/mnemonic/create/verify',
      RestoreMnemonicWallet: 'wallet/mnemonic/restore',
      PinCreation: 'wallet/pin/create',
      PinConfirmation: 'wallet/pin/confirm',
      PasscodeFaq: 'wallet/pin/faq'
    }
  }
}

export function WalletNavigator (): JSX.Element {
  const { isLight } = useThemeContext()
  const navigationRef = useRef<NavigationContainerRef<ReactNavigation.RootParamList>>(null)
  const DeFiChainTheme: Theme = getDefaultTheme(isLight)
  const DeFiChainThemeV2: Theme = getDefaultThemeV2(isLight)
  const { isFeatureAvailable } = useFeatureFlagContext()
  const insets = useSafeAreaInsets()

  const goToNetworkSelect = (): void => {
    // TODO(kyleleow) update typings
    // @ts-expect-error
    navigationRef.current?.navigate({ name: 'OnboardingNetworkSelectScreen' })
  }

  function WalletStacks (): JSX.Element {
    const { width } = Dimensions.get('window')

    return (
      <WalletStack.Navigator
        initialRouteName='Onboarding'
        screenOptions={{
          headerTitleStyle: tailwind('font-normal-v2 text-xl text-center'),
          headerTitleContainerStyle: { width: width - (Platform.OS === 'ios' ? 200 : 180) },
          headerTitleAlign: 'center',
          headerBackTitleVisible: false,
          headerRightContainerStyle: tailwind('pr-5 pb-2'),
          headerLeftContainerStyle: tailwind('pl-5 relative', { 'right-2': Platform.OS === 'ios', 'right-5': Platform.OS !== 'ios' }),
          headerStyle: [tailwind('rounded-b-2xl border-b', { 'bg-mono-light-v2-00 border-mono-light-v2-100': isLight, 'bg-mono-dark-v2-00 border-mono-dark-v2-100': !isLight }), { height: 76 + insets.top }],
          headerBackgroundContainerStyle: tailwind({ 'bg-mono-light-v2-100': isLight, 'bg-mono-dark-v2-100': !isLight }),
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          )
        }}
      >
        <WalletStack.Screen
          component={Onboarding}
          name='Onboarding'
          options={{
            headerShown: false
          }}
        />

        <WalletStack.Screen
          component={CreateWalletGuidelinesV2}
          name='CreateWalletGuidelines'
          options={{
            headerTitle: translate('screens/WalletNavigator', 'New Wallet')
          }}
        />

        <WalletStack.Screen
          component={CreateMnemonicWalletV2}
          name='CreateMnemonicWallet'
          options={{
            headerTitle: translate('screens/WalletNavigator', 'View Recovery Words'),
            headerRight: undefined
          }}
        />

        <WalletStack.Screen
          component={VerifyMnemonicWalletV2}
          name='VerifyMnemonicWallet'
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Verify Words'),
            headerRight: undefined
          }}
        />

        <WalletStack.Screen
          component={RestoreMnemonicWalletV2}
          name='RestoreMnemonicWallet'
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Restore Wallet')
          }}
        />

        <WalletStack.Screen
          component={WalletCreateRestoreSuccess}
          name='WalletCreateRestoreSuccess'
          options={{
            headerShown: false
          }}
        />

        <WalletStack.Screen
          component={OnboardingNetworkSelectScreenV2}
          name='OnboardingNetworkSelectScreen'
          options={{
            headerTitle: translate('screens/NetworkDetails', 'Network'),
            headerRight: undefined
          }}
        />

        <WalletStack.Screen
          component={RecoveryWordsFaqV2}
          name='RecoveryWordsFaq'
          options={{
            headerTitle: translate('screens/WalletNavigator', 'About Recovery Words'),
            headerRight: undefined
          }}
        />

        <WalletStack.Screen
          component={PasscodeFaqV2}
          name='PasscodeFaq'
          options={{
            headerTitle: translate('screens/WalletNavigator', 'About Passcode'),
            headerRight: undefined
          }}
        />

        <WalletStack.Screen
          component={PinCreationV2}
          name='PinCreation'
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Create Passcode'),
            headerRight: undefined
          }}
        />
        <WalletStack.Screen
          component={PinConfirmationV2}
          name='PinConfirmation'
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Verify Passcode'),
            headerRight: undefined
          }}
        />
      </WalletStack.Navigator>
    )
  }

  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      ref={navigationRef}
      theme={isFeatureAvailable('onboarding_v2') ? DeFiChainThemeV2 : DeFiChainTheme}
    >
      <WalletStacks />
    </NavigationContainer>
  )
}
