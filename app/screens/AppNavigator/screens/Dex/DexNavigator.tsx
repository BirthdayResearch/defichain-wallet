import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { createStackNavigator } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { HeaderFont } from '../../../../components'
import { HeaderTitle } from '../../../../components/HeaderTitle'
import { translate } from '../../../../translations'
import { AddLiquidityScreen } from './DexAddLiquidity'
import { AddLiquiditySummary, ConfirmAddLiquidityScreen } from './DexConfirmAddLiquidity'
import { RemoveLiquidityConfirmScreen } from './DexConfirmRemoveLiquidity'
import { RemoveLiquidityScreen } from './DexRemoveLiquidity'
import { DexScreen } from './DexScreen'
import { ConfirmPoolSwapScreen, DexForm } from './PoolSwap/ConfirmPoolSwapScreen'
import { DerivedTokenState, PoolSwapScreen } from './PoolSwap/PoolSwapScreen'

export interface DexParamList {
  DexScreen: undefined
  PoolSwapScreen: { poolpair: PoolPairData }
  ConfirmPoolSwapScreen: {
    tokenA: DerivedTokenState
    tokenB: DerivedTokenState
    swap: DexForm
    fee: BigNumber
  }
  AddLiquidity: { pair: PoolPairData }
  ConfirmAddLiquidity: { summary: AddLiquiditySummary }
  RemoveLiquidity: { pair: PoolPairData }
  ConfirmRemoveLiquidity: { amount: BigNumber, fee: BigNumber, pair: PoolPairData, tokenAAmount: string, tokenBAmount: string }

  [key: string]: undefined | object
}

const DexStack = createStackNavigator<DexParamList>()

export function DexNavigator (): JSX.Element {
  return (
    <DexStack.Navigator
      initialRouteName='DexScreen'
      screenOptions={{ headerTitleStyle: HeaderFont, headerBackTitleVisible: false }}
    >
      <DexStack.Screen
        name='DexScreen'
        component={DexScreen}
        options={{ headerTitle: () => <HeaderTitle text={translate('screens/DexScreen', 'Decentralized Exchange')} /> }}
      />
      <DexStack.Screen
        name='AddLiquidity'
        component={AddLiquidityScreen}
        options={{ headerTitle: () => <HeaderTitle text={translate('screens/DexScreen', 'Add Liquidity')} /> }}
      />
      <DexStack.Screen
        name='ConfirmAddLiquidity'
        component={ConfirmAddLiquidityScreen}
        options={{ headerTitle: () => <HeaderTitle text={translate('screens/DexScreen', 'Add Liquidity')} /> }}
      />
      <DexStack.Screen
        name='RemoveLiquidity'
        component={RemoveLiquidityScreen}
        options={{ headerTitle: () => <HeaderTitle text={translate('screens/DexScreen', 'Remove Liquidity')} /> }}
      />
      <DexStack.Screen
        name='RemoveLiquidityConfirmScreen'
        component={RemoveLiquidityConfirmScreen}
        options={{
          headerTitle: () => <HeaderTitle text={translate('screens/DexScreen', 'Confirm removal')} />
        }}
      />
      <DexStack.Screen
        name='PoolSwap'
        component={PoolSwapScreen}
        options={{
          headerTitle: () => <HeaderTitle text={translate('screens/DexScreen', 'Decentralized Exchange')} />
        }}
      />
      <DexStack.Screen
        name='ConfirmPoolSwapScreen'
        component={ConfirmPoolSwapScreen}
        options={{
          headerTitle: () => <HeaderTitle text={translate('screens/DexScreen', 'Confirm swap')} />
        }}
      />
    </DexStack.Navigator>
  )
}
