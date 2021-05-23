import * as React from 'react'
import tailwind from 'tailwind-rn'
import { createStackNavigator } from '@react-navigation/stack'

import { Text, View } from '../../components/Themed'
import { translate } from '../../translations'

export default function LiquidityScreen (): JSX.Element {
  return (
    <View style={tailwind('flex-1 items-center justify-center')}>
      <Text style={tailwind('text-xl font-bold')}>
        {translate('screens/LiquidityScreen', 'Liquidity')}
      </Text>
      <View style={tailwind('w-4/5 h-px my-8')} lightColor='#eee' darkColor='rgba(255,255,255,0.1)' />
    </View>
  )
}

export interface LiquidityParamList {
  LiquidityScreen: undefined

  [key: string]: undefined | object
}

const LiquidityStack = createStackNavigator<LiquidityParamList>()

export function LiquidityNavigator (): JSX.Element {
  return (
    <LiquidityStack.Navigator>
      <LiquidityStack.Screen
        name='TabTwoScreen'
        component={LiquidityScreen}
        options={{ headerTitle: translate('screens/LiquidityScreen', 'Liquidity') }}
      />
    </LiquidityStack.Navigator>
  )
}
