import { NavigationProp } from '@react-navigation/native'
import { RefreshControl } from 'react-native'
import { Button } from '@components/Button'
import { ThemedIcon, ThemedScrollView, ThemedText } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { TransactionsParamList } from './TransactionsNavigator'

interface EmptyTransactionProps {
  navigation: NavigationProp<TransactionsParamList>
  handleRefresh: (nextToken?: string | undefined) => void
  loadingStatus: string
}

export function EmptyTransaction (props: EmptyTransactionProps): JSX.Element {
  return (
    <ThemedScrollView
      refreshControl={
        <RefreshControl
          onRefresh={props.handleRefresh}
          refreshing={props.loadingStatus === 'loading'}
        />
      }
      style={tailwind('px-8 pt-32 pb-2 text-center')}
      testID='empty_transaction'
    >
      <ThemedIcon
        dark={tailwind('text-white')}
        iconType='MaterialIcons'
        light={tailwind('text-black')}
        name='assignment-late'
        size={44}
        style={tailwind('pb-5 text-center')}
      />

      <ThemedText style={tailwind('text-2xl pb-2 font-semibold text-center')}>
        {translate('screens/TransactionsScreen', 'No transactions yet')}
      </ThemedText>

      <ThemedText style={tailwind('text-sm pb-16 text-center opacity-60')}>
        {translate('screens/TransactionsScreen', 'Start transacting with your wallet. All UTXO transactions made will be displayed here. Other transaction types are not supported yet.')}
      </ThemedText>

      <Button
        label={translate('screens/TransactionsScreen', 'RECEIVE TOKENS')}
        onPress={() => props.navigation.navigate('Receive')}
        testID='button_receive_coins'
        title='Receive Tokens'
      />
    </ThemedScrollView>
  )
}
