import * as React from 'react'
import { translate } from '../../../../translations'
import { createStackNavigator } from '@react-navigation/stack'
import { BalancesScreen } from './BalancesScreen'
import { ReceiveScreen } from './ReceiveScreen/ReceiveScreen'

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
      <Balances.Screen
        name='receive'
        component={ReceiveScreen}
        options={{ headerTitle: translate('screens/ReceiveScreen', 'Receive') }}
      />
    </Balances.Navigator>
  )
}
