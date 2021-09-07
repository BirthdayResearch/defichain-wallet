import { ThemedIcon } from '@components/themed'
import { WalletAlert } from '@components/WalletAlert'
import { useWalletMnemonicConext } from '@contexts/WalletMnemonic'
import { LinkingOptions, NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { Theme } from '@react-navigation/native/lib/typescript/src/types'
import { createStackNavigator } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import * as Linking from 'expo-linking'
import * as React from 'react'
import { TouchableOpacity } from 'react-native'
import { HeaderFont } from '../../components'
import { HeaderTitle } from '../../components/HeaderTitle'
import { getDefaultTheme } from '../../constants/Theme'
import { useThemeContext } from '../../contexts/ThemeProvider'
import { translate } from '../../translations'
import { CreateMnemonicWallet } from './screens/CreateWallet/CreateMnemonicWallet'
import { CreateWalletGuidelines } from './screens/CreateWallet/CreateWalletGuidelines'
import { GuidelinesRecoveryWords } from './screens/CreateWallet/GuidelinesRecoveryWords'
import { PinConfirmation } from './screens/CreateWallet/PinConfirmation'
import { PinCreation } from './screens/CreateWallet/PinCreation'
import { VerifyMnemonicWallet } from './screens/CreateWallet/VerifyMnemonicWallet'
import { OnboardingNetworkSelectScreen } from './screens/CreateWallet/OnboardingNetworkSelectScreen'
import { Onboarding } from './screens/Onboarding'
import { RestoreMnemonicWallet } from './screens/RestoreWallet/RestoreMnemonicWallet'

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
      GuidelinesRecoveryWords: 'wallet/onboarding/guidelines/recovery',
      VerifyMnemonicWallet: 'wallet/mnemonic/create/verify',
      RestoreMnemonicWallet: 'wallet/mnemonic/restore',
      PinCreation: 'wallet/pin/create',
      PinConfirmation: 'wallet/pin/confirm'
    }
  }
}

export function WalletNavigator (): JSX.Element {
  const { isLight } = useThemeContext()
  const navigationRef = React.useRef<NavigationContainerRef<ReactNavigation.RootParamList>>(null)
  const DeFiChainTheme: Theme = getDefaultTheme(isLight)
  const { updateMnemonicWords } = useWalletMnemonicConext()

  const goToNetworkSelect = (): void => {
    navigationRef.current?.navigate({ name: 'OnboardingNetworkSelectScreen' })
  }

  const resetRecoveryWord = (): void => {
    WalletAlert({
      title: translate('screens/WalletNavigator', 'Refresh recovery words'),
      message: translate(
        'screens/WalletNavigator', 'You are about to generate new set of recovery words. Continue?'),
      buttons: [
        {
          text: translate('screens/WalletNavigator', 'Cancel'),
          style: 'cancel'
        },
        {
          text: translate('screens/WalletNavigator', 'Refresh'),
          style: 'destructive',
          onPress: async () => {
            updateMnemonicWords()
          }
        }
      ]
    })
  }

  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      ref={navigationRef}
      theme={DeFiChainTheme}
    >
      <WalletStack.Navigator
        initialRouteName='Setup'
        screenOptions={{ headerTitleStyle: HeaderFont }}
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
            headerTitle: () => <HeaderTitle text={translate('screens/WalletNavigator', 'Guidelines')} subHeadingType='NetworkSelect' onPress={goToNetworkSelect} />,
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
          component={GuidelinesRecoveryWords}
          name='GuidelinesRecoveryWords'
          options={{
            headerTitle: () => <HeaderTitle text={translate('screens/WalletNavigator', 'Learn More')} />,
            headerBackTitleVisible: false
          }}
        />

        <WalletStack.Screen
          component={CreateMnemonicWallet}
          name='CreateMnemonicWallet'
          options={{
            headerTitle: () => <HeaderTitle text={translate('screens/WalletNavigator', 'Display recovery words')} />,
            headerRightContainerStyle: tailwind('px-2 py-2'),
            headerRight: (): JSX.Element => (
              <TouchableOpacity
                onPress={resetRecoveryWord}
                testID='reset_recovery_word_button'
              >
                <ThemedIcon
                  dark={tailwind('text-darkprimary-500')}
                  iconType='MaterialIcons'
                  light={tailwind('text-primary-500')}
                  name='refresh'
                  size={24}
                />
              </TouchableOpacity>
            ),
            headerBackTitleVisible: false
          }}
        />

        <WalletStack.Screen
          component={VerifyMnemonicWallet}
          name='VerifyMnemonicWallet'
          options={{
            headerTitle: () => <HeaderTitle text={translate('screens/WalletNavigator', 'Verify words')} />,
            headerBackTitleVisible: false
          }}
        />

        <WalletStack.Screen
          component={RestoreMnemonicWallet}
          name='RestoreMnemonicWallet'
          options={{
            headerTitle: () => <HeaderTitle text={translate('screens/WalletNavigator', 'Restore Wallet')} subHeadingType='NetworkSelect' onPress={goToNetworkSelect} />,
            headerBackTitleVisible: false
          }}
        />

        <WalletStack.Screen
          component={PinCreation}
          name='PinCreation'
          options={{
            headerTitle: () => <HeaderTitle text={translate('screens/WalletNavigator', 'Create a passcode')} />,
            headerBackTitleVisible: false
          }}
        />

        <WalletStack.Screen
          component={PinConfirmation}
          name='PinConfirmation'
          options={{
            headerTitle: () => <HeaderTitle text={translate('screens/WalletNavigator', 'Verify passcode')} />,
            headerBackTitleVisible: false
          }}
        />
      </WalletStack.Navigator>
    </NavigationContainer>
  )
}
