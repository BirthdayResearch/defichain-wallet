import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { translate } from '../../../../translations'
import { LiquidityScreen } from './LiquidityScreen'

export interface LiquidityParamList {
  LiquidityScreen: undefined

  [key: string]: undefined | object
}

const LiquidityStack = createStackNavigator<LiquidityParamList>()

export function LiquidityNavigator (): JSX.Element {
  return (
    <LiquidityStack.Navigator>
      <LiquidityStack.Screen
        name='LiquidityScreen'
        component={LiquidityScreen}
        options={{ headerTitle: translate('screens/LiquidityScreen', 'DEX') }}
      />
    </LiquidityStack.Navigator>
  )
}
