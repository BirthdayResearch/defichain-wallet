import { createStackNavigator } from '@react-navigation/stack'
import { translate } from '@translations'
import { AboutScreen } from './screens/AboutScreen'
import { CommunityScreen } from './screens/CommunityScreen'
import { LanguageSelectionScreen } from './screens/LanguageSelectionScreen'
import { NetworkDetails } from './screens/NetworkDetails'
import { SettingsScreen } from './SettingsScreen'
import { KnowledgeBaseScreen } from './screens/KnowledgeBaseScreen'
import { FeatureFlagScreen } from './screens/FeatureFlagScreen'
import { ServiceProviderScreen } from './screens/ServiceProviderScreen'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useNavigatorScreenOptions } from '@hooks/useNavigatorScreenOptions'
import { HeaderNetworkStatus } from '@components/HeaderNetworkStatus'
import { AuctionsFaq } from '../Auctions/screens/AuctionsFaq'
import { PasscodeFaq } from '@screens/WalletNavigator/screens/CreateWallet/PasscodeFaq'
import { LoansFaq } from '../Loans/screens/LoansFaq'
import { RecoveryWordsFaq } from '@screens/WalletNavigator/screens/CreateWallet/RecoveryWordsFaq'
import { DexFaq } from '@screens/WalletNavigator/screens/CreateWallet/DexFaq'
import { LiquidityMiningFaq } from '@screens/WalletNavigator/screens/CreateWallet/LiquidityMiningFaq'
import { TokensVsUtxoFaq } from '../Portfolio/screens/TokensVsUtxoFaq'
import { ChangePinScreen } from '@screens/AppNavigator/screens/Settings/screens/ChangePinScreen'
import { ConfirmPinScreen } from '@screens/AppNavigator/screens/Settings/screens/ConfirmPinScreen'
import { RecoveryWordsScreen } from './screens/RecoveryWordsScreen'
import { AddressBookScreen } from '../Portfolio/screens/AddressBookScreen'
import { LocalAddress } from '@store/userPreferences'
import { AddOrEditAddressBookScreen } from '../Portfolio/screens/AddOrEditAddressBookScreen'
import { NetworkSelectionScreen } from '@screens/AppNavigator/screens/Settings/screens/NetworkSelectionScreen'

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

export function SettingsNavigator (): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>()

  const goToNetworkSelect = (): void => {
    navigation.navigate('NetworkSelectionScreen')
  }
  const screenOptions = useNavigatorScreenOptions()

  return (
    <SettingsStack.Navigator
      initialRouteName='SettingsScreen'
      screenOptions={{
      ...screenOptions,
      headerRight: () => (
        <HeaderNetworkStatus onPress={goToNetworkSelect} testID='header_change_network' />
      )
    }}
    >
      <SettingsStack.Screen
        component={SettingsScreen}
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
        component={ChangePinScreen}
        name='ChangePinScreen'
        options={{
          headerTitle: translate('screens/WalletNavigator', 'Create Passcode'),
          headerRight: undefined
        }}
      />

      <SettingsStack.Screen
        component={ConfirmPinScreen}
        name='ConfirmPinScreen'
        options={{
          headerTitle: translate('screens/WalletNavigator', 'Verify Passcode'),
          headerRight: undefined
        }}
      />

      <SettingsStack.Screen
        component={NetworkSelectionScreen}
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
        component={AddressBookScreen}
        name='AddressBookScreen'
        options={{
          headerTitle: translate('screens/Settings', 'Address Book')
        }}
      />

      <SettingsStack.Screen
        component={AddOrEditAddressBookScreen}
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
        component={KnowledgeBaseScreen}
        name='KnowledgeBaseScreen'
        options={{
          headerTitle: translate('screens/AboutScreen', 'FAQ')
        }}
      />

      <SettingsStack.Screen
        component={PasscodeFaq}
        name='PasscodeFaq'
        options={{
          headerTitle: translate('components/PasscodeFaq', 'About Passcode')
        }}
      />

      <SettingsStack.Screen
        component={LoansFaq}
        name='LoansFaq'
        options={{
          headerTitle: translate('components/LoansFaq', 'About Loans')
        }}
      />

      <SettingsStack.Screen
        component={AuctionsFaq}
        name='AuctionsFaq'
        options={{
          headerTitle: translate('components/AuctionsFaq', 'About Auctions')
        }}
      />

      <SettingsStack.Screen
        component={RecoveryWordsFaq}
        name='RecoveryWordsFaq'
        options={{
          headerTitle: translate('components/RecoveryWordFaq', 'About Recovery Words')
        }}
      />

      <SettingsStack.Screen
        component={DexFaq}
        name='DexFaq'
        options={{
          headerTitle: translate('components/DexFaq', 'About DEX')
        }}
      />

      <SettingsStack.Screen
        component={LiquidityMiningFaq}
        name='LiquidityMiningFaq'
        options={{
          headerTitle: translate('components/LiquidityMiningFaq', 'About Liquidity Mining')
        }}
      />

      <SettingsStack.Screen
        component={TokensVsUtxoFaq}
        name='TokensVsUtxo'
        options={{
          headerTitle: translate('components/UtxoVsTokenFaq', 'About UTXO And Tokens')
        }}
      />

    </SettingsStack.Navigator>
  )
}
