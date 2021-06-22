import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { translate } from '../../../../translations'
import { TransactionsScreen } from './screens/TransactionsScreen'
import { VMTransaction } from './screens/reducer'

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
    <TransactionsStack.Navigator>
      <TransactionsStack.Screen
        name='transactions'
        component={TransactionsScreen}
        options={{ headerTitle: translate('screens/TransactionsScreen', 'Transactions') }}
      />
    </TransactionsStack.Navigator>
  )
}
