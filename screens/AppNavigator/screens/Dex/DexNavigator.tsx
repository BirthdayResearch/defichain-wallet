import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { translate } from '../../../../translations'
import { DexScreen } from './DexScreen'
import { AddLiquidityScreen } from './DexAddLiquidity'
import { AddLiquiditySummary, ConfirmAddLiquidityScreen } from './DexConfirmAddLiquidity'
import { RemoveLiquidityScreen } from './DexRemoveLiquidity'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpair'

export interface DexParamList {
  DexScreen: undefined
  AddLiquidity: {
    pair: PoolPairData
  }
  ConfirmAddLiquidity: {
    summary: AddLiquiditySummary
  }
  RemoveLiquidity: {
    pair: PoolPairData
  }

  [key: string]: undefined | object
}

const DexStack = createStackNavigator<DexParamList>()

export function DexNavigator (): JSX.Element {
  return (
    <DexStack.Navigator>
      <DexStack.Screen
        name='DexScreen'
        component={DexScreen}
        options={{ headerTitle: translate('screens/DexScreen', 'Decentralized Exchange') }}
      />
      <DexStack.Screen
        name='AddLiquidity'
        component={AddLiquidityScreen}
        options={{ headerTitle: translate('screens/DexScreen', 'Add Liquidity') }}
      />
      <DexStack.Screen
        name='ConfirmAddLiquidity'
        component={ConfirmAddLiquidityScreen}
        options={{ headerTitle: translate('screens/DexScreen', 'Add Liquidity') }}
      />
      <DexStack.Screen
        name='RemoveLiquidity'
        component={RemoveLiquidityScreen}
        options={{ headerTitle: translate('screens/DexScreen', 'Remove Liquidity') }}
      />
    </DexStack.Navigator>
  )
}
