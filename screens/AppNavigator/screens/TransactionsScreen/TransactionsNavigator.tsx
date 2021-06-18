import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { translate } from '../../../../translations'
import { TransactionsScreen } from './screens/TransactionsScreen'
import { TransactionDetailScreen } from './screens/TransactionDetailScreen'
import { AddressActivity } from '@defichain/whale-api-client/dist/api/address'

export interface TransactionsParamList {
  TransactionsScreen: undefined
  TransactionDetailScreen: {
    activity: AddressActivity
  }

  [key: string]: undefined | object
}

const TransactionsStack = createStackNavigator<TransactionsParamList>()

export function TransactionsNavigator (): JSX.Element {
  return (
    <TransactionsStack.Navigator
      initialRouteName='Transactions'
    >
      <TransactionsStack.Screen
        name='Transactions'
        component={TransactionsScreen}
        options={{ headerTitle: translate('screens/TransactionsScreen', 'Transactions') }}
      />
      <TransactionsStack.Screen
        name='TransactionDetail'
        component={TransactionDetailScreen}
        options={{
          headerTitle: translate('screens/TransactionsDetailScreen', 'TransactionDetail')
        }}
      />
    </TransactionsStack.Navigator>
  )
}
