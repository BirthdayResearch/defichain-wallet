import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp } from '@react-navigation/native'
import * as React from 'react'
import { RefreshControl, ScrollView } from 'react-native'
import { Text } from '../../../../components'
import { Button } from '../../../../components/Button'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { TransactionsParamList } from './TransactionsNavigator'

interface EmptyTransactionProps {
  navigation: NavigationProp<TransactionsParamList>
  handleRefresh: (nextToken?: string | undefined) => void
  loadingStatus: string
}

export function EmptyTransaction (props: EmptyTransactionProps): JSX.Element {
  return (
    <ScrollView
      testID='empty_transaction'
      style={tailwind('px-8 pt-32 pb-2 text-center')}
      refreshControl={
        <RefreshControl
          refreshing={props.loadingStatus === 'loading'}
          onRefresh={props.handleRefresh}
        />
      }
    >
      <MaterialIcons name='assignment-late' size={44} style={tailwind('pb-5 text-center text-black')} />
      <Text style={tailwind('text-2xl pb-2 font-semibold text-center')}>
        {translate('screens/TransactionsScreen', 'No transactions yet')}
      </Text>
      <Text style={tailwind('text-sm pb-16 text-center opacity-60')}>
        {translate('screens/TransactionsScreen', 'Start transacting with your wallet. All UTXO transactions made will be displayed here. Other transaction types are not supported yet.')}
      </Text>
      <Button
        testID='button_receive_coins'
        title='Receive Coins'
        onPress={() => props.navigation.navigate('Receive')}
        label={translate('screens/TransactionsScreen', 'RECEIVE COINS')}
      />
    </ScrollView>
  )
}
