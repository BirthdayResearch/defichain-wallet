import { ThemedIcon, ThemedScrollView, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useCallback } from 'react'
import { Linking, View } from 'react-native'
import { TransactionsParamList } from '../TransactionsNavigator'
import { formatBlockTime } from '../TransactionsScreen'

type Props = StackScreenProps<TransactionsParamList, 'TransactionDetailScreen'>

export function TransactionDetailScreen (props: Props): JSX.Element {
  const { tx } = props.route.params
  const { getTransactionUrl } = useDeFiScanContext()

  function RenderRow ({
    lhs,
    rhs
  }: { lhs: string, rhs: string }): JSX.Element {
    return (
      <ThemedScrollView testID={`transaction-detail-${lhs.toLowerCase()}`}>
        <ThemedView
          dark={tailwind('bg-gray-800 border-b border-gray-700')}
          light={tailwind('bg-white border-b border-gray-200')}
          style={tailwind('p-2 flex-row items-center w-full p-4 mt-4')}
        >
          <View style={tailwind('w-1/2 flex-1')}>
            <ThemedText style={tailwind('font-medium')}>
              {lhs}
            </ThemedText>
          </View>

          <View style={tailwind('w-1/2 flex-1')}>
            <ThemedText style={tailwind('font-medium text-right')}>
              {rhs}
            </ThemedText>
          </View>
        </ThemedView>
      </ThemedScrollView>
    )
  }

  const onTxidUrlPressed = useCallback(async () => {
    const url = getTransactionUrl(tx.txid)
    await Linking.openURL(url)
  }, [tx?.txid, getTransactionUrl])

  return (
    <View>
      <RenderRow
        lhs={translate('screens/TransactionDetailScreen', 'Type')}
        rhs={translate('screens/TransactionDetailScreen', tx.desc)}
      />

      <RenderRow
        lhs={translate('screens/TransactionDetailScreen', 'Amount')}
        rhs={translate('screens/TransactionDetailScreen', tx.amount)}
      />

      <RenderRow
        lhs={translate('screens/TransactionDetailScreen', 'Block')}
        rhs={translate('screens/TransactionDetailScreen', `${tx.block}`)}
      />

      <RenderRow
        lhs={translate('screens/TransactionDetailScreen', 'Date')}
        rhs={translate('screens/TransactionDetailScreen', `${formatBlockTime(tx.medianTime)}`)}
      />

      {/* TODO(@ivan-zynesis): handle different transaction type other than sent/receive */}

      <ThemedTouchableOpacity
        onPress={onTxidUrlPressed}
        style={tailwind('p-2 flex-row items-center w-full p-4 mt-4')}
        testID='transaction-detail-explorer-url'
      >
        <View style={tailwind('flex-1 flex-row flex-initial')}>
          <View style={tailwind('flex-1')}>
            <ThemedText
              dark={tailwind('text-darkprimary-500')}
              light={tailwind('text-primary-500')}
              style={tailwind('font-medium text-sm')}
            >
              {tx.txid}
            </ThemedText>
          </View>

          <View style={tailwind('ml-2 flex-grow-0 justify-center')}>
            <ThemedIcon
              dark={tailwind('text-darkprimary-500')}
              iconType='MaterialIcons'
              light={tailwind('text-primary-500')}
              name='open-in-new'
              size={24}
            />
          </View>
        </View>
      </ThemedTouchableOpacity>
    </View>
  )
}
