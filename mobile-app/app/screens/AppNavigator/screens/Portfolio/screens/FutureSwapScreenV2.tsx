import { ThemedFlatListV2, ThemedIcon, ThemedTextV2, ThemedTouchableOpacityV2 } from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { translate } from '@translations'
import { useCallback, useEffect } from 'react'
import NumberFormat from 'react-number-format'
import { tailwind } from '@tailwind'
import { PortfolioParamList } from '../PortfolioNavigator'
import { batch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { fetchExecutionBlock, fetchFutureSwaps, FutureSwapData, futureSwapSelector } from '@store/futureSwap'
import { useIsFocused } from '@react-navigation/native'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { OraclePriceType, useFutureSwapDate } from '../../Dex/hook/FutureSwap'
import { fetchLoanTokens } from '@store/loans'
import { useWhaleApiClient, useWhaleRpcClient } from '@shared-contexts/WhaleContext'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { openURL } from '@api/linking'
import { PoolPairIconV2 } from '@screens/AppNavigator/screens/Dex/components/PoolPairCards/PoolPairIconV2'
import { View } from 'react-native'

type Props = StackScreenProps<PortfolioParamList, 'FutureSwapScreen'>

export function FutureSwapScreenV2 ({ navigation }: Props): JSX.Element {
  const isFocused = useIsFocused()
  const dispatch = useAppDispatch()
  const whaleRpcClient = useWhaleRpcClient()
  const whaleApiClient = useWhaleApiClient()
  const { address } = useWalletContext()
  const futureSwaps = useSelector((state: RootState) => futureSwapSelector(state))
  const blockCount = useSelector((state: RootState) => state.block.count ?? 0)
  const executionBlock = useSelector((state: RootState) => state.futureSwaps.executionBlock)
  const {
    timeRemaining,
    transactionDate,
    isEnded
  } = useFutureSwapDate(executionBlock, blockCount)

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
      name: 'WithdrawFutureSwapScreen',
      params: {
        futureSwap: item,
        executionBlock
      }
    })
  }

  const FutureSwapListItem = useCallback(({
    item
  }: { item: FutureSwapData }): JSX.Element => {
    const testID = `${item.source.displaySymbol}-${item.destination.displaySymbol}`
    return (
      <ThemedTouchableOpacityV2
        style={tailwind('py-4 px-5 mx-5 mt-2 items-center justify-between flex flex-row border-0 rounded-lg')}
        dark={tailwind('bg-mono-dark-v2-00')}
        light={tailwind('bg-mono-light-v2-00')}
        onPress={() => onPress(item)}
        testID={testID}
        disabled={isEnded}
      >
        <PoolPairIconV2 symbolA={item.source.displaySymbol} symbolB={item.destination.displaySymbol} customSize={36} />
        <View style={tailwind('flex-1 flex-col pl-2 pr-4')}>
          <NumberFormat
            value={item.source.amount}
            thousandSeparator
            displayType='text'
            suffix={` ${item.source.displaySymbol}`}
            renderText={value =>
              <ThemedTextV2
                style={tailwind('font-semibold-v2 text-base')}
                testID={`${testID}_amount`}
              >
                {value}
              </ThemedTextV2>}
          />
          <ThemedTextV2 style={tailwind('font-normal-v2 text-xs')} testID={`${testID}_destination_symbol`}>
            {translate('screens/FutureSwapScreen', 'to {{destination}}', { destination: item.destination.displaySymbol })}
          </ThemedTextV2>
          <ThemedTextV2
            style={tailwind('pt-3 font-normal-v2 text-xs')}
            dark={tailwind('text-mono-dark-v2-700')}
            light={tailwind('text-mono-light-v2-700')}
            testID={`${testID}_oracle_price`}
          >
            {translate('screens/FutureSwapScreen', 'Settlement value ({{percentage_change}})', { percentage_change: !item.source.isLoanToken ? OraclePriceType.POSITIVE : OraclePriceType.NEGATIVE })}
          </ThemedTextV2>
        </View>
        <ThemedIcon
          size={20}
          name='minus-circle'
          iconType='Feather'
          light={tailwind('text-mono-light-v2-700')}
          dark={tailwind('text-mono-dark-v2-700')}
        />
      </ThemedTouchableOpacityV2>
    )
  }, [isEnded, transactionDate])

  return (
    <ThemedFlatListV2
      keyExtractor={(_item, index) => index.toString()}
      data={futureSwaps}
      renderItem={FutureSwapListItem}
      ListHeaderComponent={
        <View style={tailwind('flex-col px-5')}>
          <ExecutionBlockInfo
            executionBlock={executionBlock} transactionDate={transactionDate}
            timeRemaining={timeRemaining}
          />
        </View>
      }
      ListFooterComponent={FooterNote}
      ListFooterComponentStyle={tailwind('flex-1 justify-end')}
      contentContainerStyle={tailwind('flex-grow')}
    />
  )
}

function ExecutionBlockInfo ({
  executionBlock,
  transactionDate,
  timeRemaining
}: { executionBlock: number, transactionDate: string, timeRemaining: string }): JSX.Element {
  const { getBlocksCountdownUrl } = useDeFiScanContext()
  return (
    <ThemedTouchableOpacityV2
      style={tailwind('border-0')}
      onPress={async () => await openURL(getBlocksCountdownUrl(executionBlock))}
    >
      <View style={tailwind('flex-col px-5 pt-8')}>
        <NumberFormat
          value={executionBlock}
          thousandSeparator
          displayType='text'
          renderText={value =>
            <ThemedTextV2
              style={tailwind('text-xs font-semibold-v2')}
              testID='execution_block'
            >
              {translate('screens/FutureSwapScreen', 'Target block {{block}', { block: value })}
            </ThemedTextV2>}
        />
        <View style={tailwind('flex-row items-center')}>
          <ThemedTextV2
            style={tailwind('text-xs font-normal-v2 pr-1')}
            dark={tailwind('text-mono-dark-v2-700')}
            light={tailwind('text-mono-light-v2-700')}
          >
            {`${transactionDate} (${translate('screens/FutureSwapScreen', '{{time}} left', { time: timeRemaining.trim() })})`}
          </ThemedTextV2>
          <ThemedIcon
            size={14}
            name='external-link'
            iconType='Feather'
            dark={tailwind('text-mono-dark-v2-700')}
            light={tailwind('text-mono-light-v2-700')}
          />
        </View>
      </View>
    </ThemedTouchableOpacityV2>
  )
}

function FooterNote (): JSX.Element {
  return (
    <View style={tailwind('px-10 py-12 justify-center')}>
      <ThemedTextV2
        style={tailwind('text-xs font-normal-v2 text-center')}
        dark={tailwind('text-mono-dark-v2-500')}
        light={tailwind('text-mono-light-v2-500')}
      >
        {translate('screens/FutureSwapScreen', 'Amount will be refunded automatically if transaction(s) failed')}
      </ThemedTextV2>
    </View>
  )
}
