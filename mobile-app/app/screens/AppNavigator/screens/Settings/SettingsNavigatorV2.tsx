import { createStackNavigator } from '@react-navigation/stack'
import { translate } from '@translations'
import { AboutScreen } from './screens/AboutScreen'
import { CommunityScreen } from './screens/CommunityScreen'
import { LanguageSelectionScreen } from './screens/LanguageSelectionScreen'
import { NetworkDetails } from './screens/NetworkDetails'
import { SettingsScreenV2 } from './SettingsScreenV2'
import { KnowledgeBaseScreenV2 } from './screens/KnowledgeBaseScreenV2'
import { FeatureFlagScreen } from './screens/FeatureFlagScreen'
import { ServiceProviderScreenV2 } from './screens/ServiceProviderScreenV2'
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
import { ChangePinScreenV2 } from '@screens/AppNavigator/screens/Settings/screens/ChangePinScreenV2'
import { ConfirmPinScreenV2 } from '@screens/AppNavigator/screens/Settings/screens/ConfirmPinScreenV2'
import { RecoveryWordsScreenV2 } from './screens/RecoveryWordsScreenV2'
import { AddressBookScreenV2 } from '../Portfolio/screens/AddressBookScreenV2'
import { LocalAddress } from '@store/userPreferences'
import { AddOrEditAddressBookScreenV2 } from '../Portfolio/screens/AddOrEditAddressBookScreenV2'
import { NetworkSelectionScreenV2 } from '@screens/AppNavigator/screens/Settings/screens/NetworkSelectionScreenV2'

export interface SettingsParamList {
  SettingsScreen: undefined
  CommunityScreen: undefined
  RecoveryWordsScreen: { words: string[] }
  ChangePinScreen: { pinLength: number, words: string[] }
  ConfirmPinScreen: { pin: string, words: string[] }
  NetworkDetails: undefined
  ServiceProviderScreen: {}
  AddressBookScreen: {
    selectedAddress?: string
    onAddressSelect?: (address: string) => void
  }
  AddOrEditAddressBookScreen: {
    title: string
    onSaveButtonPress: (address?: string) => void
    addressLabel?: LocalAddress
    address?: string
    isAddNew: boolean
  }

  [key: string]: undefined | object
}

const SettingsStack = createStackNavigator<SettingsParamList>()

export function SettingsNavigatorV2 (): JSX.Element {
  const navigationV2 = useNavigation<NavigationProp<SettingsParamList>>()

  const goToNetworkSelect = (): void => {
    navigationV2.navigate('NetworkSelectionScreen')
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
        component={RecoveryWordsScreenV2}
        name='RecoveryWordsScreen'
        options={{
          headerTitle: translate('screens/Settings', 'Recovery Words')
        }}
      />

      <SettingsStack.Screen
        component={ServiceProviderScreenV2}
        name='ServiceProviderScreen'
        options={{
          headerTitle: translate('screens/ServiceProviderScreen', 'Provider')
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
        component={ChangePinScreenV2}
        name='ChangePinScreen'
        options={{
          headerTitle: translate('screens/WalletNavigator', 'Create Passcode'),
          headerRight: undefined
        }}
      />

      <SettingsStack.Screen
        component={ConfirmPinScreenV2}
        name='ConfirmPinScreen'
        options={{
          headerTitle: translate('screens/WalletNavigator', 'Verify Passcode'),
          headerRight: undefined
        }}
      />

      <SettingsStack.Screen
        component={NetworkSelectionScreenV2}
        name='NetworkSelectionScreen'
        options={{
          headerTitle: translate('screens/NetworkSelectionScreen', 'Network'),
          headerRight: undefined
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
        component={AddressBookScreenV2}
        name='AddressBookScreen'
        options={{
          headerTitle: translate('screens/Settings', 'Address Book')
        }}
      />

      <SettingsStack.Screen
        component={AddOrEditAddressBookScreenV2}
        name='AddOrEditAddressBookScreen'
        options={{
          headerTitle: translate('screens/AddOrEditAddressBookScreen', 'Add Address')
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
          headerTitle: translate('components/PasscodeFaq', 'About Passcode')
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
          headerTitle: translate('components/RecoveryWordFaq', 'About Recovery Words')
        }}
      />

      <SettingsStack.Screen
        component={DexFaqV2}
        name='DexFaq'
        options={{
          headerTitle: translate('components/DexFaq', 'About DEX')
        }}
      />

      <SettingsStack.Screen
        component={LiquidityMiningFaqV2}
        name='LiquidityMiningFaq'
        options={{
          headerTitle: translate('components/LiquidityMiningFaq', 'About Liquidity Mining')
        }}
      />

      <SettingsStack.Screen
        component={TokensVsUtxoFaqV2}
        name='TokensVsUtxo'
        options={{
          headerTitle: translate('components/UtxoVsTokenFaq', 'About UTXO And Tokens')
        }}
      />

    </SettingsStack.Navigator>
  )
}
