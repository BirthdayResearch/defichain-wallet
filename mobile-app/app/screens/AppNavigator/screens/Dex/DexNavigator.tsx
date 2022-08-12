import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { createStackNavigator } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import { HeaderFont } from '@components/Text'
import { HeaderTitle } from '@components/HeaderTitle'
import { PriceRateProps } from '@components/PricesSection'
import { translate } from '@translations'
import { NetworkDetails } from '../Settings/screens/NetworkDetails'
import { AddLiquidityScreen } from './DexAddLiquidity'
import { ConfirmAddLiquidityScreen } from './DexConfirmAddLiquidity'
import { RemoveLiquidityConfirmScreen } from './DexConfirmRemoveLiquidity'
import { RemoveLiquidityScreen } from './DexRemoveLiquidity'
import { DexScreen } from './DexScreen'
import { CompositeSwapScreen, OwnedTokenState, TokenState } from './CompositeSwap/CompositeSwapScreen'
import { CompositeSwapForm, ConfirmCompositeSwapScreen } from './CompositeSwap/ConfirmCompositeSwapScreen'
import { WalletToken } from '@store/wallet'
import { ConversionParam } from '../Portfolio/PortfolioNavigator'
import { useNavigatorScreenOptions } from '@hooks/useNavigatorScreenOptions'
import { HeaderNetworkStatus } from '@components/HeaderNetworkStatus'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { tailwind } from '@tailwind'
import { ThemedTextV2 } from '@components/themed'
import { StyleProp, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { NetworkSelectionScreen } from '../Settings/screens/NetworkSelectionScreen'

export interface DexParamList {
  DexScreen: undefined
  CompositeSwapScreen: {
    pair?: PoolPairData
    fromToken?: WalletToken
    tokenSelectOption?: {
      from: {
        isDisabled: boolean
        isPreselected: boolean
      }
      to: {
        isDisabled: boolean
        isPreselected: boolean
      }
    }
  }
  ConfirmCompositeSwapScreen: {
    conversion?: ConversionParam
    fee: BigNumber
    pairs: PoolPairData[]
    priceRates: PriceRateProps[]
    slippage: BigNumber
    swap: CompositeSwapForm
    futureSwap?: {
      executionBlock: number
      transactionDate: string
      isSourceLoanToken: boolean
      oraclePriceText: string
    }
    tokenA: OwnedTokenState
    tokenB: TokenState & { amount?: string }
    estimatedAmount: BigNumber
  }
  AddLiquidity: {
    pair: PoolPairData
  }
  ConfirmAddLiquidity: {
    pair: PoolPairData
    summary: AddLiquiditySummary
    conversion?: ConversionParam
  }
  RemoveLiquidity: { pair: PoolPairData }
  ConfirmRemoveLiquidity: {
    amount: BigNumber
    fee: BigNumber
    pair: PoolPairData
    tokenAAmount: string
    tokenBAmount: string
    tokenA?: WalletToken
    tokenB?: WalletToken
  }

  [key: string]: undefined | object
}

export interface AddLiquiditySummary {
  fee: BigNumber // stick to whatever estimation/calculation done on previous page
  tokenAAmount: BigNumber // transaction amount
  tokenBAmount: BigNumber // transaction amount
  percentage: BigNumber // to add
  tokenABalance: BigNumber // token A balance (after deducting 0.1 DFI if DFI)
  tokenBBalance: BigNumber // token B balance (after deducting 0.1 DFI if DFI)
}

const DexStack = createStackNavigator<DexParamList>()

export function DexNavigator (): JSX.Element {
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const headerContainerTestId = 'dex_header_container'
  const screenOptions = useNavigatorScreenOptions()
  const goToNetworkSelect = (): void => {
    navigation.navigate('NetworkSelectionScreen')
  }
  const insets = useSafeAreaInsets()

  return (
    <DexStack.Navigator
      initialRouteName='DexScreen'
      screenOptions={{
        headerTitleAlign: 'center',
        headerTitleStyle: HeaderFont,
        headerBackTitleVisible: false
      }}
    >
      <DexStack.Screen
        component={DexScreen}
        name='DexScreen'
        options={{
          ...screenOptions,
          headerLeft: undefined,
          headerLeftContainerStyle: null,
          headerTitleAlign: 'left',
          headerBackTitleVisible: false,
          headerTitleContainerStyle: tailwind('mt-4 ml-5'),
          headerStyle: [screenOptions.headerStyle, tailwind('rounded-b-none border-b-0'), { shadowOpacity: 0, height: 96 + insets.top }],
          headerTitle: () => (
            <ThemedTextV2
              style={[
                screenOptions.headerTitleStyle as Array<StyleProp<ViewStyle>>,
                tailwind('text-left text-3xl font-semibold-v2'),
                { fontSize: 28 }
              ]}
            >
              {translate('screens/DexScreen', 'Decentralized Exchange')}
            </ThemedTextV2>
          ),
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          )
        }}
      />

      <DexStack.Screen
        component={NetworkSelectionScreen}
        name='NetworkSelectionScreen'
        options={{
          ...screenOptions,
          headerTitle: translate('screens/NetworkSelectionScreen', 'Network'),
          headerBackTitleVisible: false,
          headerRight: undefined
        }}
      />

      <DexStack.Screen
        component={AddLiquidityScreen}
        name='AddLiquidity'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/DexScreen', 'Add Liquidity')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <DexStack.Screen
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

      <DexStack.Screen
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

      <DexStack.Screen
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

      <DexStack.Screen
        component={CompositeSwapScreen}
        name='CompositeSwap'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/DexScreen', 'Swap tokens')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <DexStack.Screen
        component={ConfirmCompositeSwapScreen}
        name='ConfirmCompositeSwapScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/DexScreen', 'Confirm swap')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <DexStack.Screen
        component={NetworkDetails}
        name='NetworkDetails'
        options={{
          headerTitle: translate('screens/NetworkDetails', 'Wallet Network'),
          headerBackTitleVisible: false,
          headerBackTestID: 'network_details_header_back'
        }}
      />
    </DexStack.Navigator>
  )
}
