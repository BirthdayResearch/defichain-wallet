import { NavigationProp, useNavigation } from '@react-navigation/native'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { createStackNavigator } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import { HeaderFont } from '@components/Text'
import { HeaderTitle } from '@components/HeaderTitle'
import { PriceRateProps } from '@components/PricesSection'
import { translate } from '@translations'
import { NetworkDetails } from '../Settings/screens/NetworkDetails'
import { DexScreen } from './DexScreen'
import { CompositeSwapScreen, OwnedTokenState, TokenState } from './CompositeSwap/CompositeSwapScreen'
import { CompositeSwapForm, ConfirmCompositeSwapScreen } from './CompositeSwap/ConfirmCompositeSwapScreen'
import { WalletToken } from '@store/wallet'
import { ConversionParam } from '../Portfolio/PortfolioNavigator'
import { useNavigatorScreenOptions } from '@hooks/useNavigatorScreenOptions'
import { HeaderNetworkStatus } from '@components/HeaderNetworkStatus'
import { AddLiquidityScreenV2 } from './DexAddLiquidityV2'
import { ConfirmAddLiquidityScreen } from './DexConfirmAddLiquidity'
import { RemoveLiquidityScreen } from './DexRemoveLiquidity'
import { RemoveLiquidityScreenV2 } from './DexRemoveLiquidityV2'
import { RemoveLiquidityConfirmScreen } from './DexConfirmRemoveLiquidity'
import { RemoveLiquidityConfirmScreenV2 } from './DexConfirmRemoveLiquidityV2'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { AddLiquidityScreen } from './DexAddLiquidity'
import { ConfirmAddLiquidityScreenV2 } from './DexConfirmAddLiquidityV2'
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
    pairInfo: WalletToken
  }
  ConfirmAddLiquidity: {
    pair: PoolPairData
    summary: AddLiquiditySummary
    conversion?: ConversionParam
    pairInfo: WalletToken
  }
  RemoveLiquidity: {
    pair: PoolPairData
    pairInfo: WalletToken
  }
  ConfirmRemoveLiquidity: {
    amount: BigNumber
    fee: BigNumber
    pair: PoolPairData
    pairInfo: WalletToken
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
  lmTotalTokens: string // total LP tokens
}

const DexStack = createStackNavigator<DexParamList>()

export function DexNavigator (): JSX.Element {
  const headerContainerTestId = 'dex_header_container'
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const goToNetworkSelect = (): void => {
    navigation.navigate('NetworkSelectionScreen')
  }
  const screenOptions = useNavigatorScreenOptions()
  const { isFeatureAvailable } = useFeatureFlagContext()

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
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/DexScreen', 'Decentralized Exchange')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <DexStack.Screen
        component={isFeatureAvailable('add_liquidity_v2') ? AddLiquidityScreenV2 : AddLiquidityScreen}
        name='AddLiquidity'
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate('screens/DexScreen', 'Add Liquidity')
        }}
      />

      <DexStack.Screen
        component={isFeatureAvailable('add_liquidity_v2') ? ConfirmAddLiquidityScreenV2 : ConfirmAddLiquidityScreen}
        name='ConfirmAddLiquidity'
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate('screens/DexScreen', 'Confirm')
        }}
      />

      <DexStack.Screen
        component={isFeatureAvailable('remove_liquidity_v2') ? RemoveLiquidityScreenV2 : RemoveLiquidityScreen}
        name='RemoveLiquidity'
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate('screens/DexScreen', 'Remove Liquidity')
        }}
      />

      <DexStack.Screen
        component={isFeatureAvailable('remove_liquidity_v2') ? RemoveLiquidityConfirmScreenV2 : RemoveLiquidityConfirmScreen}
        name='RemoveLiquidityConfirmScreen'
        options={{
          ...screenOptions,
          headerRight: () => (
            <HeaderNetworkStatus onPress={goToNetworkSelect} />
          ),
          headerTitle: translate('screens/DexScreen', 'Confirm')
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
