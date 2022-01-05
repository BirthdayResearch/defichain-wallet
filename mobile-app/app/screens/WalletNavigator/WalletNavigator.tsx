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
import { CreateWalletGuidelines } from './screens/CreateWallet/CreateWalletGuidelines'
import { RecoveryWordsFaq } from './screens/CreateWallet/RecoveryWordsFaq'
import { PinConfirmation } from './screens/CreateWallet/PinConfirmation'
import { PinCreation } from './screens/CreateWallet/PinCreation'
import { VerifyMnemonicWallet } from './screens/CreateWallet/VerifyMnemonicWallet'
import { OnboardingNetworkSelectScreen } from './screens/CreateWallet/OnboardingNetworkSelectScreen'
import { Onboarding } from './screens/Onboarding'
import { RestoreMnemonicWallet } from './screens/RestoreWallet/RestoreMnemonicWallet'
import { PasscodeFaq } from './screens/CreateWallet/PasscodeFaq'
import { NetworkDetails } from '@screens/AppNavigator/screens/Settings/screens/NetworkDetails'

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
  const headerContainerTestId = 'wallet_header_container'

  const goToNetworkSelect = (): void => {
    // @ts-expect-error
    // TODO(kyleleow) update typings
    navigationRef.current?.navigate({ name: 'OnboardingNetworkSelectScreen' })
  }

  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      ref={navigationRef}
      theme={DeFiChainTheme}
    >
      <WalletStack.Navigator
        initialRouteName='Onboarding'
        screenOptions={{ headerTitleStyle: HeaderFont, headerTitleAlign: 'center' }}
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
    </NavigationContainer>
  )
}
