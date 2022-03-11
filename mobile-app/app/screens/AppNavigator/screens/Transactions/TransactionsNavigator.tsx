import { createStackNavigator } from '@react-navigation/stack'
import { HeaderFont } from '@components/Text'
import { HeaderTitle } from '@components/HeaderTitle'
import { translate } from '@translations'
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
  const headerContainerTestId = 'transactions_header_container'

  return (
    <TransactionsStack.Navigator
      initialRouteName='TransactionsScreen'
      screenOptions={{
        headerTitleStyle: HeaderFont,
        headerTitleAlign: 'center'
      }}
    >
      <TransactionsStack.Screen
        component={TransactionsScreen}
        name='TransactionsScreen'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/TransactionsScreen', 'Transactions')}
              containerTestID={headerContainerTestId}
            />
          )
        }}
      />

      <TransactionsStack.Screen
        component={TransactionDetailScreen}
        name='TransactionDetail'
        options={{
          headerTitle: () => (
            <HeaderTitle
              text={translate('screens/TransactionDetailScreen', 'Transaction')}
              containerTestID={headerContainerTestId}
            />
          ),
          headerBackTitleVisible: false
        }}
      />

      <TransactionsStack.Screen
        component={NetworkDetails}
        name='NetworkDetails'
        options={{
          headerTitle: translate('screens/NetworkDetails', 'Wallet Network'),
          headerBackTitleVisible: false,
          headerBackTestID: 'network_details_header_back'
        }}
      />
    </TransactionsStack.Navigator>
  )
}
