import { createStackNavigator } from '@react-navigation/stack'
import { HeaderFont } from '@components/Text'
import { HeaderTitle } from '@components/HeaderTitle'
import { translate } from '@translations'
import { AboutScreen } from './screens/AboutScreen'
import { ChangePinScreen } from './screens/ChangePinScreen'
import { CommunityScreen } from './screens/CommunityScreen'
import { ConfirmPinScreen } from './screens/ConfirmPinScreen'
import { LanguageSelectionScreen } from './screens/LanguageSelectionScreen'
import { NetworkDetails } from './screens/NetworkDetails'
import { NetworkSelectionScreen } from './screens/NetworkSelectionScreen'
import { RecoveryWordsScreen } from './screens/RecoveryWordsScreen'
import { SettingsScreen } from './SettingsScreen'
import { PasscodeFaq } from '@screens/WalletNavigator/screens/CreateWallet/PasscodeFaq'
import { KnowledgeBaseScreen } from './screens/KnowledgeBaseScreen'
import { RecoveryWordsFaq } from '@screens/WalletNavigator/screens/CreateWallet/RecoveryWordsFaq'
import { TokensVsUtxoScreen } from '../Balances/screens/TokensVsUtxoScreen'
import { DexFaq } from '@screens/WalletNavigator/screens/CreateWallet/DexFaq'
import { LiquidityMiningFaq } from '@screens/WalletNavigator/screens/CreateWallet/LiquidityMiningFaq'
import { FeatureFlagScreen } from './screens/FeatureFlagScreen'
import { LoansFaq } from '@screens/AppNavigator/screens/Loans/screens/LoansFaq'
import { AuctionsFaq } from '../Auctions/screens/AuctionsFaq'

export interface SettingsParamList {
  SettingsScreen: undefined
  CommunityScreen: undefined
  RecoveryWordsScreen: { words: string[] }
  ChangePinScreen: { pinLength: number, words: string[] }
  ConfirmPinScreen: { pin: string, words: string[] }

  [key: string]: undefined | object
}

const SettingsStack = createStackNavigator<SettingsParamList>()

export function SettingsNavigator (): JSX.Element {
  const headerContainerTestId = 'setting_header_container'
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerTitleStyle: HeaderFont,
        headerBackTitleVisible: false,
        headerTitleAlign: 'center'
      }}
    >
      <SettingsStack.Screen
        component={SettingsScreen}
        name='SettingsScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/SettingsNavigator', 'Settings')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <SettingsStack.Screen
        component={KnowledgeBaseScreen}
        name='KnowledgeBaseScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/AboutScreen', 'Knowledge base')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={CommunityScreen}
        name='CommunityScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/CommunityScreen', 'Community')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={RecoveryWordsScreen}
        name='RecoveryWordsScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/Settings', 'Recovery Words')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={AboutScreen}
        name='AboutScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/AboutScreen', 'About')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={ChangePinScreen}
        name='ChangePinScreen'
        options={{
          headerTitle: translate('screens/AboutScreen', 'Create new passcode'),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={ConfirmPinScreen}
        name='ConfirmPinScreen'
        options={{
          headerTitle: translate('screens/ConfirmPinScreen', 'Verify passcode'),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={NetworkSelectionScreen}
        name='NetworkSelectionScreen'
        options={{
          headerTitle: translate('screens/NetworkSelectionScreen', 'Select network'),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={LanguageSelectionScreen}
        name='LanguageSelectionScreen'
        options={{
          headerTitle: translate('screens/LanguageSelectionScreen', 'Select language'),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={NetworkDetails}
        name='NetworkDetails'
        options={{
          headerTitle: translate('screens/NetworkDetails', 'Wallet Network'),
          headerBackTitleVisible: false,
          headerBackTestID: 'network_details_header_back'
        }}
      />

      <SettingsStack.Screen
        component={PasscodeFaq}
        name='PasscodeFaq'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/WalletNavigator', 'Passcode FAQ')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={LoansFaq}
        name='LoansFaq'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('components/LoansFaq', 'Loans FAQ')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={AuctionsFaq}
        name='AuctionsFaq'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('components/AuctionsFaq', 'Auctions FAQ')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={FeatureFlagScreen}
        name='FeatureFlagScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/FeatureFlagScreen', 'Beta Features')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={RecoveryWordsFaq}
        name='RecoveryWordsFaq'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/WalletNavigator', 'Recovery Words FAQ')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={DexFaq}
        name='DexFaq'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/WalletNavigator', 'DEX FAQ')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={LiquidityMiningFaq}
        name='LiquidityMiningFaq'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/WalletNavigator', 'Liquidity Mining FAQ')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <SettingsStack.Screen
        component={TokensVsUtxoScreen}
        name='TokensVsUtxo'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/ConvertScreen', 'UTXO vs Token')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

    </SettingsStack.Navigator>
  )
}
