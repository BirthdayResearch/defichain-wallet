import * as React from 'react'
import { Button } from 'react-native'
import tailwind from 'tailwind-rn'

import { translate } from '../../../../translations'
import { Text, View } from '../../../../components/Themed'
import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { createStackNavigator } from '@react-navigation/stack'
import LoadingScreen from '../../../LoadingScreen/LoadingScreen'

export function BalancesScreen (): JSX.Element {
  const [isLoading, setIsLoading] = React.useState(false)
  const [count, setCount] = React.useState(0)

  const Icon = getTokenIcon('DFA')

  if (isLoading) {
    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
    return <LoadingScreen />
  }

  return (
    <View style={tailwind('flex-1 items-center justify-center')}>
      <Icon />
      <Button
        testID='count_btn' title='Click' onPress={() => {
          setIsLoading(true)
          setCount(count + 2)
        }}
      />
      <Text testID='count_text'>
        Count: {count}
      </Text>
      <Text style={tailwind('text-xl font-bold')}>
        {translate('screens/BalancesScreen', 'Balances')}
      </Text>
      <View style={tailwind('w-4/5 h-px my-8')} lightColor='#eee' darkColor='rgba(255,255,255,0.1)' />
    </View>
  )
}

export interface BalancesParamList {
  BalancesScreen: undefined

  [key: string]: undefined | object
}

const Balances = createStackNavigator<BalancesParamList>()

export function BalancesNavigator (): JSX.Element {
  return (
    <Balances.Navigator>
      <Balances.Screen
        name='balances'
        component={BalancesScreen}
        options={{ headerTitle: translate('screens/BalancesScreen', 'Balances') }}
      />
    </Balances.Navigator>
  )
}
