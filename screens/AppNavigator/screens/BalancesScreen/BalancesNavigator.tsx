import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { translate } from '../../../../translations'
import { BalancesScreen } from './BalancesScreen'
import { ReceiveScreen } from './ReceiveScreen/ReceiveScreen'
import { SendScreen } from "./SendScreen";

export interface BalanceParamList {
  BalancesScreen: undefined
  ReceiveScreen: undefined
  SendScreen: undefined

  [key: string]: undefined | object
}

const BalanceStack = createStackNavigator<BalanceParamList>()

export function BalancesNavigator (): JSX.Element {
  return (
    <BalanceStack.Navigator>
      <BalanceStack.Screen
        name='Balances'
        component={BalancesScreen}
        options={{ headerTitle: translate('screens/BalancesScreen', 'Wallet Balances') }}
      />
      <BalanceStack.Screen
        name='Receive'
        component={ReceiveScreen}
        options={{ headerTitle: translate('screens/ReceiveScreen', 'Receive') }}
      />
      <BalanceStack.Screen
        name='Send'
        component={SendScreen}
        options={{
          headerTitle: translate('screens/SendScreen', 'Wallet Send'),
          headerBackTitleVisible: false
        }}
      />
    </BalanceStack.Navigator>
  )
}
