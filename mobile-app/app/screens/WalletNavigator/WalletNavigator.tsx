import { LinkingOptions, NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { Theme } from '@react-navigation/native/lib/typescript/src/types'
import { createStackNavigator } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import * as Linking from 'expo-linking'
import { useRef } from 'react'
import { HeaderFont } from '@components'
import { HeaderTitle } from '@components/HeaderTitle'
import { getDefaultTheme } from '@constants/Theme'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { translate } from '@translations'
import { CreateMnemonicWallet } from './screens/CreateWallet/CreateMnemonicWallet'
import { CreateMnemonicWallet as CreateMnemonicWalletV2 } from './screens/CreateWallet/CreateMnemonicWallet.v2'
import { CreateWalletGuidelines } from './screens/CreateWallet/CreateWalletGuidelines'
import { CreateWalletGuidelines as CreateWalletGuidelinesV2 } from './screens/CreateWallet/CreateWalletGuidelinesV2'
import { RecoveryWordsFaq } from './screens/CreateWallet/RecoveryWordsFaq'
import { PinConfirmation } from './screens/CreateWallet/PinConfirmation'
import { PinCreation } from './screens/CreateWallet/PinCreation'
import { VerifyMnemonicWallet } from './screens/CreateWallet/VerifyMnemonicWallet'
import { OnboardingNetworkSelectScreen } from './screens/CreateWallet/OnboardingNetworkSelectScreen'
import { Onboarding } from './screens/Onboarding'
import { RestoreMnemonicWallet } from './screens/RestoreWallet/RestoreMnemonicWallet'
import { PasscodeFaq } from './screens/CreateWallet/PasscodeFaq'
import { NetworkDetails } from '@screens/AppNavigator/screens/Settings/screens/NetworkDetails'
import { HeaderNetworkStatus } from '@components/HeaderNetworkStatus'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { OnboardingV2 } from '@screens/WalletNavigator/screens/OnboardingV2'

type PinCreationType = 'create' | 'restore'

export interface WalletParamList {
  WalletOnboardingScreen: undefined
  CreateMnemonicWallet: undefined
  WalletNetworkSelectScreen: undefined
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

  [key: string]: undefined | object
}

export interface WalletParamListV2 {
  WalletOnboardingScreen: undefined
  CreateWalletGuidelines: undefined
  [key: string]: undefined | object
}

const WalletStack = createStackNavigator<WalletParamList>()
const WalletStackV2 = createStackNavigator<WalletParamListV2>()

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
  const headerContainerTestId = 'wallet_header_container'
  const { isFeatureAvailable } = useFeatureFlagContext() // TODO: uncomment to test v2
  const insets = useSafeAreaInsets()
  const testV2 = false // TODO: temp flag to disable v2

  const goToNetworkSelect = (): void => {
    // @ts-expect-error
    // TODO(kyleleow) update typings
    navigationRef.current?.navigate({ name: 'OnboardingNetworkSelectScreen' })
  }

  function WalletStacks (): JSX.Element {
    return (
      <WalletStack.Navigator
        initialRouteName='Onboarding'
        screenOptions={{
          headerTitleStyle: HeaderFont,
          headerTitleAlign: 'center'
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
          component={CreateWalletGuidelines}
          name='CreateWalletGuidelines'
          options={{
            headerTitle: () => (
              <HeaderTitle
                text={translate('screens/WalletNavigator', 'Guidelines')}
                subHeadingType='NetworkSelect' onPress={goToNetworkSelect}
                containerTestID={headerContainerTestId}
              />
            ),
            headerBackTitleVisible: false
          }}
        />

        <WalletStack.Screen
          component={OnboardingNetworkSelectScreen}
          name='OnboardingNetworkSelectScreen'
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Select network'),
            headerBackTitleVisible: false
          }}
        />

        <WalletStack.Screen
          component={RecoveryWordsFaq}
          name='RecoveryWordsFaq'
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Recovery Words FAQ'),
            headerBackTitleVisible: false
          }}
        />

        <WalletStack.Screen
          component={CreateMnemonicWallet}
          name='CreateMnemonicWallet'
          options={{
            headerTitle: () => (
              <HeaderTitle
                text={translate('screens/WalletNavigator', 'Display recovery words')}
                containerTestID={headerContainerTestId}
              />
            ),
            headerRightContainerStyle: tailwind('px-2 py-2'),
            headerBackTitleVisible: false
          }}
        />

        <WalletStack.Screen
          component={VerifyMnemonicWallet}
          name='VerifyMnemonicWallet'
          options={{
            headerTitle: () => (
              <HeaderTitle
                text={translate('screens/WalletNavigator', 'Verify words')}
                containerTestID={headerContainerTestId}
              />
            ),
            headerBackTitleVisible: false
          }}
        />

        <WalletStack.Screen
          component={RestoreMnemonicWallet}
          name='RestoreMnemonicWallet'
          options={{
            headerTitle: () => (
              <HeaderTitle
                text={translate('screens/WalletNavigator', 'Restore Wallet')}
                subHeadingType='NetworkSelect' onPress={goToNetworkSelect}
                containerTestID={headerContainerTestId}
              />
            ),
            headerBackTitleVisible: false
          }}
        />

        <WalletStack.Screen
          component={PinCreation}
          name='PinCreation'
          options={{
            headerTitle: () => (
              <HeaderTitle
                text={translate('screens/WalletNavigator', 'Create a passcode')}
                containerTestID={headerContainerTestId}
              />
            ),
            headerBackTitleVisible: false
          }}
        />

        <WalletStack.Screen
          component={PinConfirmation}
          name='PinConfirmation'
          options={{
            headerTitle: () => (
              <HeaderTitle
                text={translate('screens/WalletNavigator', 'Verify passcode')}
                containerTestID={headerContainerTestId}
              />
            ),
            headerBackTitleVisible: false
          }}
        />

        <WalletStack.Screen
          component={PasscodeFaq}
          name='PasscodeFaq'
          options={{
            headerTitle: translate('screens/WalletNavigator', 'Passcode FAQ'),
            headerBackTitleVisible: false
          }}
        />

        <WalletStack.Screen
          component={NetworkDetails}
          name='NetworkDetails'
          options={{
            headerTitle: translate('screens/NetworkDetails', 'Wallet Network'),
            headerBackTitleVisible: false,
            headerBackTestID: 'network_details_header_back'
          }}
        />
      </WalletStack.Navigator>
    )
  }

  function WalletStacksV2 (): JSX.Element {
    return (
      <WalletStackV2.Navigator
        initialRouteName='OnboardingV2'
        screenOptions={{
          headerTitleStyle: tailwind('font-normal-v2 text-xl'),
          headerTitleAlign: 'center',
          headerBackTitleVisible: false,
          headerRightContainerStyle: tailwind('pr-4 py-2'),
          headerLeftContainerStyle: tailwind('pl-4'),
          headerStyle: [tailwind('h-28 rounded-b-2xl'), { height: 76 + insets.top }],
          headerBackgroundContainerStyle: tailwind(isLight ? 'bg-mono-light-v2-100' : 'bg-mono-dark-v2-100'),
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          )
        }}
      >
        <WalletStackV2.Screen
          component={OnboardingV2}
          name='OnboardingV2'
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
            headerRightContainerStyle: tailwind('px-2 py-2'),
            headerBackTitleVisible: false
          }}
        />

      </WalletStackV2.Navigator>
    )
  }

  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      ref={navigationRef}
      theme={DeFiChainTheme}
    >
      {/* {isFeatureAvailable('onboarding_v2') TODO: uncomment this condition to test v2 and when all onboarding screens are completed */}
      {isFeatureAvailable('onboarding_v2') && testV2
        ? (
          <WalletStacksV2 />
          )
        : (
          <WalletStacks />
        )}
    </NavigationContainer>
  )
}
