import { View } from '@components'
import { NumberRow } from '@components/NumberRow'
import { TextRow } from '@components/TextRow'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedView } from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { Linking, TouchableOpacity } from 'react-native'
import { BalanceParamList } from '../BalancesNavigator'

type Props = StackScreenProps<BalanceParamList, 'FutureSwapDetailScreen'>

export function FutureSwapDetailScreen ({ route }: Props): JSX.Element {
  const { futureSwap } = route.params

  return (
    <ThemedScrollView
      contentContainerStyle={tailwind('py-4')}
    >
      <TextRow
        lhs={translate('screens/FutureSwapDetailScreen', 'Transaction')}
        rhs={{
          value: translate('screens/FutureSwapDetailScreen', 'Future swap'),
          testID: 'text_transaction_type'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <TextRow
        lhs={translate('screens/FutureSwapDetailScreen', 'Transaction date')}
        rhs={{
          value: 'Aug 23, 2022 08:25pm',
          testID: 'text_transaction_date'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <TextRow
        lhs={translate('screens/FutureSwapDetailScreen', 'Token to swap from')}
        rhs={{
          value: 'Aug 23, 2022 08:25pm',
          testID: 'text_transaction_date'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <NumberRow
        lhs={translate('screens/FutureSwapDetailScreen', 'Amount to swap')}
        rhs={{
          value: futureSwap.tokenAmount.toFixed(8),
          testID: 'text_amount',
          suffixType: 'text',
          suffix: futureSwap.tokenDisplaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/FutureSwapDetailScreen', 'Execution block')}
        rhs={{
          value: futureSwap.executionBlock,
          testID: 'text_amount'
        }}
      />
      <NumberRow
        lhs={translate('screens/FutureSwapDetailScreen', 'Execution date')}
        rhs={{
          value: futureSwap.dueDate.toString(),
          testID: 'text_amount'
        }}
      />
      <View style={tailwind('mt-4')}>
        <TransactionIdRow transactionId='441088a44388cc050f70c81d93185c078fbe95b071a23dee91f23b121cbd3b29' />
      </View>
    </ThemedScrollView>
  )
}

function TransactionIdRow ({ transactionId }: { transactionId: string }): JSX.Element {
  const { getTransactionUrl } = useDeFiScanContext()

  const onPress = async (): Promise<void> => {
    const url = getTransactionUrl(transactionId)
    await Linking.openURL(url)
  }

  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-gray-700')}
      light={tailwind('bg-white border-gray-200')}
      style={tailwind('flex flex-row p-4 border-b items-center justify-between w-full')}
    >
      <View style={tailwind('w-6/12')}>
        <ThemedText style={tailwind('text-sm')}>
          {translate('screens/FutureSwapDetailScreen', 'Transaction ID')}
        </ThemedText>
      </View>

      <TouchableOpacity
        onPress={onPress}
        testID='transaction_id_url'
        style={tailwind('flex-row items-center w-6/12')}
      >
        <ThemedText
          ellipsizeMode='middle'
          numberOfLines={1}
          style={tailwind('text-sm mr-1.5 flex-auto')}
          dark={tailwind('text-gray-400')}
          light={tailwind('text-gray-500')}
        >
          {transactionId}
        </ThemedText>
        <ThemedIcon
          dark={tailwind('text-darkprimary-500')}
          iconType='MaterialIcons'
          light={tailwind('text-primary-500')}
          name='open-in-new'
          size={24}
        />
      </TouchableOpacity>
    </ThemedView>
  )
}
