import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { translate } from '../../../../translations'
import { VMTransaction } from './screens/stateProcessor'
import { TransactionDetailScreen } from './screens/TransactionDetailScreen'
import { TransactionsScreen } from './TransactionsScreen'

export interface TransactionsParamList {
  TransactionsScreen: undefined
  TransactionDetailScreen: {
    tx: VMTransaction
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
        options={{
          headerTitle: translate('screens/TransactionsScreen', 'Transactions')
        }}
      />
      <TransactionsStack.Screen
        name='TransactionDetail'
        component={TransactionDetailScreen}
        options={{
          headerTitle: translate('screens/TransactionsDetailScreen', 'Transaction'),
          headerBackTitleVisible: false
        }}
      />
    </TransactionsStack.Navigator>
  )
}
