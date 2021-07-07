import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpair'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { translate } from '../../../../translations'
import { DexScreen } from './DexScreen'
import { PoolSwapScreen } from './PoolSwap/PoolSwapScreen'

export interface DexParamList {
  DexScreen: undefined
  PoolSwapScreen: { poolpair: PoolPairData }

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
        name='PoolSwap'
        component={PoolSwapScreen}
        options={{
          headerTitle: translate('screens/DexScreen', 'Decentralized Exchange'),
          headerBackTitleVisible: false
        }}
      />
    </DexStack.Navigator>
  )
}
