import * as React from 'react'
import tailwind from 'tailwind-rn'
import { createStackNavigator } from '@react-navigation/stack'
import { useDispatch, useSelector } from 'react-redux'

import { Text, View } from '../../../../components/Themed'
import { translate } from '../../../../translations'
import { Button } from 'react-native'
import { decrement, increment, incrementAsync, incrementIfOdd } from '../../../../store/liquidity'
import { RootState } from '../../../../store'

export function LiquidityScreen (): JSX.Element {
  const count = useSelector<RootState, number>(state => state.counter.value)
  const status = useSelector<RootState>(state => state.counter.status)
  const dispatch = useDispatch()

  if (count > 2) {
    throw new Error('Trigger error boundary!')
  }

  return (
    <View style={tailwind('flex-1 items-center justify-center')}>
      <Text style={tailwind('text-xl font-bold')}>
        {translate('screens/LiquidityScreen', 'Liquidity')}
      </Text>

      <View style={tailwind('w-4/5 h-px my-8')} lightColor='#eee' darkColor='rgba(255,255,255,0.1)' />

      <Button title='Increment' onPress={() => dispatch(increment())} />
      <Button title='Decrement' onPress={() => dispatch(decrement())} />
      <Button title='Increment 10 If Odd' onPress={() => dispatch(incrementIfOdd(10))} />
      <Button title='Increment 5 Async' onPress={() => dispatch(incrementAsync(5))} />

      <Text testID='something'>
        Count: {count}
      </Text>

      <Text testID='loading'>
        Loading: {status}
      </Text>
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
        name='liquidity'
        component={LiquidityScreen}
        options={{ headerTitle: translate('screens/LiquidityScreen', 'Liquidity') }}
      />
    </LiquidityStack.Navigator>
  )
}
