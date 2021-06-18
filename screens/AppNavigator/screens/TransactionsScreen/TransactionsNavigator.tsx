import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { translate } from '../../../../translations'
import { TransactionsScreen } from './TransactionsScreen'

export interface TransactionsParamList {
  TransactionsScreen: undefined

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
