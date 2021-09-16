import { createStackNavigator } from '@react-navigation/stack'
import * as React from 'react'
import { HeaderFont } from '../../../../components'
import { HeaderTitle } from '../../../../components/HeaderTitle'
import { translate } from '../../../../translations'
import { NetworkDetails } from '../Settings/screens/NetworkDetails'
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
      initialRouteName='TransactionsScreen'
      screenOptions={{ headerTitleStyle: HeaderFont }}
    >
      <TransactionsStack.Screen
        component={TransactionsScreen}
        name='TransactionsScreen'
        options={{
          headerTitle: () => <HeaderTitle text={translate('screens/TransactionsScreen', 'Transactions')} />
        }}
      />

      <TransactionsStack.Screen
        component={TransactionDetailScreen}
        name='TransactionDetail'
        options={{
          headerTitle: () => <HeaderTitle text={translate('screens/TransactionsDetailScreen', 'Transaction')} />,
          headerBackTitleVisible: false
        }}
      />

      <TransactionsStack.Screen
        component={NetworkDetails}
        name='NetworkDetails'
        options={{
          headerTitle: translate('screens/NetworkDetails', 'Wallet Network'),
          headerBackTitleVisible: false
        }}
      />
    </TransactionsStack.Navigator>
  )
}
