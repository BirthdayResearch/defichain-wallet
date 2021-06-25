import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { translate } from '../../../../translations'
import { DexScreen } from './DexScreen'
import { AddLiquidityScreen } from './DexAddLiquidity'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpair'

export interface DexParamList {
  DexScreen: undefined
  AddLiquidity: {
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
    </DexStack.Navigator>
  )
}
