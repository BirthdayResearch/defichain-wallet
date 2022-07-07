import { createStackNavigator } from '@react-navigation/stack'
import { translate } from '@translations'
import { AboutScreen } from './screens/AboutScreen'
import { ChangePinScreen } from './screens/ChangePinScreen'
import { CommunityScreen } from './screens/CommunityScreen'
import { ConfirmPinScreen } from './screens/ConfirmPinScreen'
import { LanguageSelectionScreen } from './screens/LanguageSelectionScreen'
import { NetworkDetails } from './screens/NetworkDetails'
import { NetworkSelectionScreen } from './screens/NetworkSelectionScreen'
import { RecoveryWordsScreen } from './screens/RecoveryWordsScreen'
import { SettingsScreenV2 } from './SettingsScreenV2'
import { KnowledgeBaseScreenV2 } from './screens/KnowledgeBaseScreenV2'
import { FeatureFlagScreen } from './screens/FeatureFlagScreen'
import { ServiceProviderScreen } from './screens/ServiceProviderScreen'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useNavigatorScreenOptions } from '@hooks/useNavigatorScreenOptions'
import { HeaderNetworkStatus } from '@components/HeaderNetworkStatus'
import { AuctionsFaqV2 } from '../Auctions/screens/AuctionsFaqV2'
import { PasscodeFaqV2 } from '@screens/WalletNavigator/screens/CreateWallet/PasscodeFaqV2'
import { LoansFaqV2 } from '../Loans/screens/LoansFaqV2'
import { RecoveryWordsFaqV2 } from '@screens/WalletNavigator/screens/CreateWallet/RecoveryWordsFaqV2'
import { DexFaqV2 } from '@screens/WalletNavigator/screens/CreateWallet/DexFaqV2'
import { LiquidityMiningFaqV2 } from '@screens/WalletNavigator/screens/CreateWallet/LiquidityMiningFaqV2'
import { TokensVsUtxoFaqV2 } from '../Portfolio/screens/TokensVsUtxoFaqV2'

export interface SettingsParamList {
  SettingsScreen: undefined
  CommunityScreen: undefined
  RecoveryWordsScreen: { words: string[] }
  ChangePinScreen: { pinLength: number, words: string[] }
  ConfirmPinScreen: { pin: string, words: string[] }
  NetworkDetails: undefined
  ServiceProviderScreen: {}

  [key: string]: undefined | object
}

const SettingsStack = createStackNavigator<SettingsParamList>()

export function SettingsNavigatorV2 (): JSX.Element {
  const navigationV2 = useNavigation<NavigationProp<SettingsParamList>>()

  const goToNetworkSelect = (): void => {
    navigationV2.navigate('NetworkDetails')
  }
  const screenOptions = useNavigatorScreenOptions()

  return (
    <SettingsStack.Navigator
      initialRouteName='SettingsScreen'
      screenOptions={{
      ...screenOptions,
      headerRight: () => (
        <HeaderNetworkStatus onPress={goToNetworkSelect} />
      )
    }}
    >
      <SettingsStack.Screen
        component={SettingsScreenV2}
        name='SettingsScreen'
        options={{
          headerTitle: translate('screens/SettingsNavigator', 'Settings')
        }}
      />

      <SettingsStack.Screen
        component={CommunityScreen}
        name='CommunityScreen'
        options={{
          headerTitle: translate('screens/CommunityScreen', 'Community')
        }}
      />

      <SettingsStack.Screen
        component={RecoveryWordsScreen}
        name='RecoveryWordsScreen'
        options={{
          headerTitle: translate('screens/Settings', 'Recovery Words')
        }}
      />

      <SettingsStack.Screen
        component={ServiceProviderScreen}
        name='ServiceProviderScreen'
        options={{
          headerTitle: translate('screens/ServiceProviderScreen', 'Service Provider')
        }}
      />

      <SettingsStack.Screen
        component={AboutScreen}
        name='AboutScreen'
        options={{
          headerTitle: translate('screens/AboutScreen', 'About')
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
          headerTitle: translate('screens/NetworkDetails', 'Network'),
          headerBackTestID: 'network_details_header_back'
        }}
      />

      <SettingsStack.Screen
        component={FeatureFlagScreen}
        name='FeatureFlagScreen'
        options={{
          headerTitle: translate('screens/FeatureFlagScreen', 'Beta Features')
        }}
      />

      <SettingsStack.Screen
        component={KnowledgeBaseScreenV2}
        name='KnowledgeBaseScreen'
        options={{
          headerTitle: translate('screens/AboutScreen', 'FAQ')
        }}
      />

      <SettingsStack.Screen
        component={PasscodeFaqV2}
        name='PasscodeFaq'
        options={{
          headerTitle: translate('screens/WalletNavigator', 'About Passcode')
        }}
      />

      <SettingsStack.Screen
        component={LoansFaqV2}
        name='LoansFaq'
        options={{
          headerTitle: translate('components/LoansFaq', 'About Loans')
        }}
      />

      <SettingsStack.Screen
        component={AuctionsFaqV2}
        name='AuctionsFaq'
        options={{
          headerTitle: translate('components/AuctionsFaq', 'About Auctions')
        }}
      />

      <SettingsStack.Screen
        component={RecoveryWordsFaqV2}
        name='RecoveryWordsFaq'
        options={{
          headerTitle: translate('screens/WalletNavigator', 'About Recovery Words')
        }}
      />

      <SettingsStack.Screen
        component={DexFaqV2}
        name='DexFaq'
        options={{
          headerTitle: translate('screens/WalletNavigator', 'About DEX')
        }}
      />

      <SettingsStack.Screen
        component={LiquidityMiningFaqV2}
        name='LiquidityMiningFaq'
        options={{
          headerTitle: translate('screens/WalletNavigator', 'About Liquidity Mining')
        }}
      />

      <SettingsStack.Screen
        component={TokensVsUtxoFaqV2}
        name='TokensVsUtxo'
        options={{
          headerTitle: translate('screens/ConvertScreen', 'About UTXO And Tokens')
        }}
      />

    </SettingsStack.Navigator>
  )
}
