import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { translate } from '../../../../translations'
import { BalancesScreen } from './BalancesScreen'
import { ReceiveScreen } from './ReceiveScreen/ReceiveScreen'
import { SendScreen } from './SendScreen/SendScreen'

export interface BalanceParamList {
  BalancesScreen: undefined
  ReceiveScreen: undefined
  SendScreen: { token: AddressToken }

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
        options={{ headerTitle: translate('screens/ReceiveScreen', 'Wallet Receive') }}
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
