import { View } from '@components'
import { ThemedFlatList, ThemedIcon, ThemedSectionTitle, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { translate } from '@translations'
import { useCallback, useEffect } from 'react'
import NumberFormat from 'react-number-format'
import { tailwind } from '@tailwind'
import { BalanceParamList } from '../BalancesNavigator'
import { batch, useSelector } from 'react-redux'
import { RootState, useAppDispatch } from '@store'
import { fetchExecutionBlock, fetchFutureSwaps, FutureSwapData, FutureSwapSelector } from '@store/futureSwap'
import { useIsFocused } from '@react-navigation/native'
import { WhaleRpcClient } from '@defichain/whale-api-client'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useFutureSwapDate } from '../../Dex/hook/FutureSwap'
import { fetchLoanTokens } from '@store/loans'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'

type Props = StackScreenProps<BalanceParamList, 'FutureSwapScreen'>

export function FutureSwapScreen ({ navigation }: Props): JSX.Element {
  const isFocused = useIsFocused()
  const dispatch = useAppDispatch()
  const whaleRpcClient = new WhaleRpcClient()
  const whaleApiClient = useWhaleApiClient()
  const { address } = useWalletContext()
  const futureSwaps = useSelector((state: RootState) => FutureSwapSelector(state))
  const blockCount = useSelector((state: RootState) => state.block.count ?? 0)
  const executionBlock = useSelector((state: RootState) => state.futureSwaps.executionBlock)
  const { transactionDate, isEnded } = useFutureSwapDate(executionBlock, blockCount)

  useEffect(() => {
    // fetch once to retrieve display symbol in store
    dispatch(fetchLoanTokens({ client: whaleApiClient }))
  }, [])

  useEffect(() => {
    if (isFocused) {
      batch(() => {
        dispatch(fetchFutureSwaps({
          client: whaleRpcClient,
          address
        }))
        dispatch(fetchExecutionBlock({ client: whaleRpcClient }))
      })
    }
  }, [address, blockCount, isFocused])

  const onPress = (item: FutureSwapData): void => {
    navigation.navigate({
      name: 'FutureSwapDetailScreen',
      params: {
        futureSwap: item,
        executionBlock
      }
    })
  }

  const FutureSwapListItem = useCallback(({
    item
  }: { item: FutureSwapData }): JSX.Element => {
    return (
      <ThemedTouchableOpacity
        style={tailwind('py-3 pl-4 pr-2 items-center justify-between flex flex-row')}
        onPress={() => onPress(item)}
        disabled={isEnded}
      >
        <View style={tailwind('flex flex-row items-center')}>
          <ThemedIcon
            size={24}
            name='swap-horiz'
            iconType='MaterialIcons'
            light={tailwind('text-gray-600')}
            dark={tailwind('text-gray-300')}
          />
          <View style={tailwind('ml-2')}>
            <ThemedText
              light={tailwind('text-gray-900')}
              dark={tailwind('text-gray-50')}
            >
              {translate('screens/FutureSwapScreen', 'Future swap')}
            </ThemedText>
            <ThemedText
              style={tailwind('text-xs')}
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
            >
              {translate('screens/FutureSwapScreen', 'Due on {{date}}', { date: transactionDate })}
            </ThemedText>
          </View>
        </View>
        <View style={tailwind('flex flex-row items-center')}>
          <View>
            <NumberFormat
              value={item.source.amount}
              thousandSeparator
              displayType='text'
              suffix={` ${item.source.displaySymbol}`}
              renderText={value =>
                <ThemedText
                  light={tailwind('text-gray-900')}
                  dark={tailwind('text-gray-50')}
                >
                  {value}
                </ThemedText>}
            />
            <ThemedText
              style={tailwind('text-xs text-right')}
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
            >
              {translate('screens/FutureSwapScreen', `Oracle price ${!item.source.isLoanToken ? '+5%' : '-5%'}`)}
            </ThemedText>
          </View>
          <ThemedIcon
            size={24}
            name='chevron-right'
            iconType='MaterialIcons'
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
          />
        </View>
      </ThemedTouchableOpacity>
    )
  }, [isEnded, transactionDate])

  return (
    <ThemedFlatList
      keyExtractor={(_item, index) => index.toString()}
      data={futureSwaps}
      renderItem={FutureSwapListItem}
      ListHeaderComponent={
        <ThemedSectionTitle
          testID='title_future_swap'
          text={translate('screens/FutureSwapScreen', 'PENDING TRANSACTIONS')}
        />
      }
      ListFooterComponent={
        <ThemedText
          style={tailwind('pt-2 pb-2 px-4 text-xs')}
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
        >
          {translate('screens/FutureSwapScreen', 'The amount will be refunded automatically if the transaction does not go through.')}
        </ThemedText>
      }
    />
  )
}
