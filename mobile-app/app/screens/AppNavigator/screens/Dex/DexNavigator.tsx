import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { createStackNavigator } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import { HeaderFont } from '@components/Text'
import { HeaderTitle } from '@components/HeaderTitle'
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
import { ConversionParam } from '../Balances/BalancesNavigator'
import { PriceRateProps } from '@screens/AppNavigator/screens/Dex/CompositeSwap/components/PricesSection'

export interface DexParamList {
  DexScreen: undefined
  CompositeSwapScreen: {
    pair?: PoolPairData
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
    tokenA: OwnedTokenState
    tokenB: TokenState & { amount?: string }
  }
  AddLiquidity: { pair: PoolPairData }
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
  const headerContainerTestId = 'dex_header_container'

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
