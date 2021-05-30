import * as React from 'react'
import { Button } from 'react-native'
import tailwind from 'tailwind-rn'

import { translate } from '../../../../translations'
import { Text, View } from '../../../../components/Themed'
import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { createStackNavigator } from '@react-navigation/stack'

export function BalancesScreen (): JSX.Element {
  const [count, setCount] = React.useState(0)

  const Icon = getTokenIcon('DFA')

  return (
    <View style={tailwind('flex-1 items-center justify-center')}>
      <Icon />
      <Button title='Click' onPress={() => setCount(count + 2)} />
      <Text testID='count'>
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
