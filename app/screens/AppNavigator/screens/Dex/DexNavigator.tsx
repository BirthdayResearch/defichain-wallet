import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { HeaderFont } from '../../../../components'
import { HeaderTitle } from '../../../../components/HeaderTitle'
import { translate } from '../../../../translations'
import { AddLiquidityScreen } from './DexAddLiquidity'
import { AddLiquiditySummary, ConfirmAddLiquidityScreen } from './DexConfirmAddLiquidity'
import { RemoveLiquidityScreen } from './DexRemoveLiquidity'
import { DexScreen } from './DexScreen'
import { PoolSwapScreen } from './PoolSwap/PoolSwapScreen'

export interface DexParamList {
  DexScreen: undefined
  PoolSwapScreen: { poolpair: PoolPairData }
  AddLiquidity: { pair: PoolPairData }
  ConfirmAddLiquidity: { summary: AddLiquiditySummary }

  [key: string]: undefined | object
}

const DexStack = createStackNavigator<DexParamList>()

export function DexNavigator (): JSX.Element {
  return (
    <DexStack.Navigator screenOptions={{ headerTitleStyle: HeaderFont }}>
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
        name='PoolSwap'
        component={PoolSwapScreen}
        options={{
          headerTitle: () => <HeaderTitle text={translate('screens/DexScreen', 'Decentralized Exchange')} />,
          headerBackTitleVisible: false
        }}
      />
    </DexStack.Navigator>
  )
}
