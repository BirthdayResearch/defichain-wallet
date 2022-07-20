import { NavigationProp, useNavigation } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { WalletToken } from '@store/wallet'
import BigNumber from 'bignumber.js'
import { TouchableOpacity } from 'react-native'
import { BarCodeScanner } from '@components/BarCodeScanner'
import { HeaderTitle } from '@components/HeaderTitle'
import { ThemedIcon } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { SettingsNavigator } from '../Settings/SettingsNavigator'
import { NetworkDetails } from '../Settings/screens/NetworkDetails'
import { PortfolioScreen } from './PortfolioScreen'
import { ConvertConfirmationScreen } from './screens/ConvertConfirmationScreen'
import { ConversionMode, ConvertScreen } from './screens/ConvertScreen'
import { ReceiveScreen } from './screens/ReceiveScreen'
import { SendConfirmationScreen } from './screens/SendConfirmationScreen'
import { SendScreen } from './screens/SendScreen'
import { TokensVsUtxoScreen } from './screens/TokensVsUtxoScreen'
import { AddressControlScreen } from './components/AddressControlScreen'
import { AboutScreen } from '../Settings/screens/AboutScreen'
import { CompositeSwapScreen } from '../Dex/CompositeSwap/CompositeSwapScreen'
import { ConfirmCompositeSwapScreen } from '../Dex/CompositeSwap/ConfirmCompositeSwapScreen'
import { AddressBookScreen } from './screens/AddressBookScreen'
import { AddOrEditAddressBookScreen } from './screens/AddOrEditAddressBookScreen'
import { LocalAddress } from '@store/userPreferences'
import { FutureSwapData } from '@store/futureSwap'
import { FutureSwapScreen } from './screens/FutureSwapScreen'
import { ConfirmWithdrawFutureSwapScreen } from './screens/ConfirmWithdrawFutureSwapScreen'
import { WithdrawFutureSwapScreen } from './screens/WithdrawFutureSwapScreen'
import { AddLiquidityScreen } from '../Dex/DexAddLiquidity'
import { ConfirmAddLiquidityScreen } from '../Dex/DexConfirmAddLiquidity'
import { RemoveLiquidityScreen } from '../Dex/DexRemoveLiquidity'
import { RemoveLiquidityConfirmScreen } from '../Dex/DexConfirmRemoveLiquidity'
import { GetDFIScreen } from './screens/GetDFIScreen'
import { MarketplaceScreen } from './screens/MarketplaceScreen'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { SettingsNavigatorV2 } from '../Settings/SettingsNavigatorV2'
import { TransactionsScreen } from '@screens/AppNavigator/screens/Transactions/TransactionsScreen'
import { TransactionDetailScreen } from '@screens/AppNavigator/screens/Transactions/screens/TransactionDetailScreen'
import { VMTransaction } from '@screens/AppNavigator/screens/Transactions/screens/stateProcessor'
import { useNavigatorScreenOptions } from '@hooks/useNavigatorScreenOptions'
import { HeaderNetworkStatus } from '@components/HeaderNetworkStatus'
import { TokenDetailScreen } from './screens/TokenDetailScreen'

export interface PortfolioParamList {
  PortfolioScreen: undefined
  ReceiveScreen: undefined
  MarketplaceScreen: undefined
  SendScreen: { token?: WalletToken }
  SendConfirmationScreen: {
    token: WalletToken
    destination: string
    amount: BigNumber
    fee: BigNumber
    conversion?: ConversionParam
  }
  TokenDetailScreen: { token: WalletToken }
  ConvertScreen: { mode: ConversionMode }
  ConvertConfirmationScreen: {
    amount: BigNumber
    mode: ConversionMode
    sourceUnit: string
    sourceBalance: BigNumber
    targetUnit: string
    targetBalance: BigNumber
    fee: BigNumber
  }
  BarCodeScanner: { onQrScanned: (value: string) => void }
  TokenVsUtxoScreen: undefined
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
  FutureSwapScreen: undefined
  FutureSwapDetailScreen: {
    futureSwap: FutureSwapData
    executionBlock: number
  }
  WithdrawFutureSwapScreen: {
    futureSwap: FutureSwapData
    executionBlock: number
  }
  ConfirmWithdrawFutureSwapScreen: {
    source: {
      amountToWithdraw: BigNumber
      remainingAmount: BigNumber
      remainingAmountInUSD: BigNumber
      tokenId: string
      displaySymbol: string
      isLoanToken: boolean
    }
    destination: {
      tokenId: string
    }
    fee: BigNumber
    executionBlock: number
  }
  TransactionsScreen: undefined
  TransactionDetailScreen: {
    tx: VMTransaction
  }
  [key: string]: undefined | object
}

export interface ConversionParam {
  isConversionRequired: boolean
  conversionAmount: BigNumber
  DFIUtxo: WalletToken
  DFIToken: WalletToken
}

const PortfolioStack = createStackNavigator<PortfolioParamList>()

export function PortfolioNavigator (): JSX.Element {
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>()
  const headerContainerTestId = 'portfolio_header_container'
  const { isFeatureAvailable } = useFeatureFlagContext()

  const goToNetworkSelect = (): void => {
    navigation.navigate('NetworkDetails')
  }
  const screenOptions = useNavigatorScreenOptions()
  return (
    <PortfolioStack.Navigator
      initialRouteName='PortfolioScreen'
      screenOptions={{
        headerTitleAlign: 'center'
      }}
    >
      <PortfolioStack.Screen
        component={isFeatureAvailable('setting_v2') ? SettingsNavigatorV2 : SettingsNavigator}
        name={translate('PortfolioNavigator', 'Settings')}
        options={{
          headerShown: false
        }}
      />

      <PortfolioStack.Screen
        component={PortfolioScreen}
        name='PortfolioScreen'
        options={{
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              testID='header_settings'
            >
              <ThemedIcon
                iconType='MaterialIcons'
                name='settings'
                size={28}
                style={tailwind('ml-2')}
                light={tailwind('text-primary-500')}
                dark={tailwind('text-darkprimary-500')}
              />
            </TouchableOpacity>
          ),
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/PortfolioScreen', 'Portfolio')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <PortfolioStack.Screen
        component={ReceiveScreen}
        name='Receive'
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerBackTitleVisible: false,
          headerTitle: translate('screens/ReceiveScreen', 'Receive')
        }}
      />

      <PortfolioStack.Screen
        component={AddressControlScreen}
        name='AddressControlScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/AddressControlScreen', 'Wallet Address')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerRightContainerStyle: tailwind('px-2 py-2'),
          headerBackTitleVisible: false
        }}
      />

      <PortfolioStack.Screen
        component={GetDFIScreen}
        name='GetDFIScreen'
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerBackTitleVisible: false,
          headerTitle: translate('screens/ReceiveScreen', 'Get DFI')
        }}
      />

      <PortfolioStack.Screen
        component={MarketplaceScreen}
        name='MarketplaceScreen'
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerBackTitleVisible: false,
          headerTitle: translate('screens/MarketplaceScreen', 'Marketplace')
        }}
      />

      <PortfolioStack.Screen
        component={SendScreen}
        name='Send'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/SendScreen', 'Send')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <PortfolioStack.Screen
        component={SendConfirmationScreen}
        name='SendConfirmationScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/SendConfirmationScreen', 'Confirm Send')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <PortfolioStack.Screen
        component={TokenDetailScreen}
        name='Balance'
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate('screens/TokenDetailScreen', 'Balance')
        }}
      />

      <PortfolioStack.Screen
        component={ConvertScreen}
        name='Convert'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/ConvertScreen', 'Convert DFI')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <PortfolioStack.Screen
        component={ConvertConfirmationScreen}
        name='ConvertConfirmationScreen'
        options={{
          headerBackTitleVisible: false,
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/ConvertConfirmScreen', 'Confirm DFI Conversion')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <PortfolioStack.Screen
        component={BarCodeScanner}
        name='BarCodeScanner'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/ConvertScreen', 'Scan recipient QR')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <PortfolioStack.Screen
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

      <PortfolioStack.Screen
        component={NetworkDetails}
        name='NetworkDetails'
        options={{
          headerTitle: translate('screens/NetworkDetails', 'Wallet Network'),
          headerBackTitleVisible: false,
          headerBackTestID: 'network_details_header_back'
        }}
      />

      <PortfolioStack.Screen
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

      <PortfolioStack.Screen
        component={CompositeSwapScreen}
        name='CompositeSwap'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/DexScreen', 'Swap tokens')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <PortfolioStack.Screen
        component={ConfirmCompositeSwapScreen}
        name='ConfirmCompositeSwapScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/DexScreen', 'Confirm swap')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <PortfolioStack.Screen
        component={AddressBookScreen}
        name='AddressBookScreen'
        options={{
          headerBackTitleVisible: false,
          headerTitle: () => (
            <></>
          )
        }}
      />

      <PortfolioStack.Screen
        component={AddOrEditAddressBookScreen}
        name='AddOrEditAddressBookScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/AddOrEditAddressBookScreen', 'Add New Address')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <PortfolioStack.Screen
        component={AddLiquidityScreen}
        name='AddLiquidity'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/DexScreen', 'Add Liquidity')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <PortfolioStack.Screen
        component={ConfirmAddLiquidityScreen}
        name='ConfirmAddLiquidity'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/DexScreen', 'Confirm Add Liquidity')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <PortfolioStack.Screen
        component={WithdrawFutureSwapScreen}
        name='WithdrawFutureSwapScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/WithdrawFutureSwapScreen', 'Withdraw from future swap')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <PortfolioStack.Screen
        component={RemoveLiquidityScreen}
        name='RemoveLiquidity'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/DexScreen', 'Remove Liquidity')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <PortfolioStack.Screen
        component={FutureSwapScreen}
        name='FutureSwapScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/FutureSwapScreen', 'Future Swap')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <PortfolioStack.Screen
        component={ConfirmWithdrawFutureSwapScreen}
        name='ConfirmWithdrawFutureSwapScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/ConfirmWithdrawFutureSwapScreen', 'Confirm withdrawal')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <PortfolioStack.Screen
        component={RemoveLiquidityConfirmScreen}
        name='RemoveLiquidityConfirmScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/DexScreen', 'Confirm Removal')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <PortfolioStack.Screen
        component={TransactionsScreen}
        name='TransactionsScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/TransactionsScreen', 'Transactions')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <PortfolioStack.Screen
        component={TransactionDetailScreen}
        name='TransactionDetail'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/TransactionDetailScreen', 'Transaction')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />
    </PortfolioStack.Navigator>
  )
}
