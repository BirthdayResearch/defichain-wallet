import { View } from '@components'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { translate } from '@translations'
import { useCallback, useEffect, useState } from 'react'
import NumberFormat from 'react-number-format'
import { tailwind } from '@tailwind'
import { PortfolioParamList } from '../PortfolioNavigator'
import { batch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { fetchExecutionBlock, fetchFutureSwaps, FutureSwapData, FutureSwapSelector } from '@store/futureSwap'
import { useIsFocused } from '@react-navigation/native'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useFutureSwapDate } from '../../Dex/hook/FutureSwap'
import { fetchLoanTokens } from '@store/loans'
import { useWhaleApiClient, useWhaleRpcClient } from '@shared-contexts/WhaleContext'
import { SymbolIcon } from '@components/SymbolIcon'
import { TouchableOpacity } from 'react-native'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { openURL } from '@api/linking'
import { useAppDispatch } from '@hooks/useAppDispatch'

type Props = StackScreenProps<PortfolioParamList, 'FutureSwapScreen'>

export function FutureSwapScreen ({ navigation }: Props): JSX.Element {
  const isFocused = useIsFocused()
  const dispatch = useAppDispatch()
  const whaleRpcClient = useWhaleRpcClient()
  const whaleApiClient = useWhaleApiClient()
  const { address } = useWalletContext()
  const futureSwaps = useSelector((state: RootState) => FutureSwapSelector(state))
  const blockCount = useSelector((state: RootState) => state.block.count ?? 0)
  const executionBlock = useSelector((state: RootState) => state.futureSwaps.executionBlock)
  const { transactionDate, isEnded } = useFutureSwapDate(executionBlock, blockCount)
  const [displayExecutedInfo, setDisplayExecutedInfo] = useState(false)
  const [executedBlock, setExecutedBlock] = useState<Number | undefined>(undefined)

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

    if (blockCount === executionBlock) {
      setExecutedBlock(blockCount)
      setDisplayExecutedInfo(true)
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
      <ThemedTouchableOpacity
        style={tailwind('p-4 items-center justify-between flex flex-row')}
        onPress={() => onPress(item)}
        testID={testID}
        disabled={isEnded}
      >
        <View>
          <View style={tailwind('flex flex-row items-center mb-1')}>
            <SymbolIcon
              symbol={item.source.displaySymbol}
              styleProps={tailwind('w-4 h-4')}
            />
            <ThemedIcon
              size={18}
              name='arrow-right'
              iconType='MaterialIcons'
              style={tailwind('mx-1')}
              light={tailwind('text-gray-600')}
              dark={tailwind('text-gray-300')}
            />
            <SymbolIcon
              symbol={item.destination.displaySymbol}
              styleProps={tailwind('w-4 h-4')}
            />
          </View>
          <View style={tailwind('flex flex-row items-center mb-1')}>
            <NumberFormat
              value={item.source.amount}
              thousandSeparator
              displayType='text'
              suffix={` ${item.source.displaySymbol}`}
              renderText={value =>
                <ThemedText
                  light={tailwind('text-gray-900')}
                  dark={tailwind('text-gray-50')}
                  testID={`${testID}_amount`}
                >
                  {value}
                </ThemedText>}
            />
            <ThemedIcon
              size={22}
              name='arrow-right-alt'
              iconType='MaterialIcons'
              style={tailwind('mx-0.5')}
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
            />
            <ThemedText
              style={tailwind('text-sm')}
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
              testID={`${testID}_destination_symbol`}
            >
              {item.destination.displaySymbol}
            </ThemedText>
          </View>
          <ThemedView
            style={[tailwind('px-1 rounded-sm'), { alignSelf: 'flex-start' }]}
            light={tailwind('bg-gray-50')}
            dark={tailwind('bg-gray-900')}
          >
            <ThemedText
              style={tailwind('text-xs')}
              light={tailwind('text-gray-500')}
              dark={tailwind('text-gray-400')}
              testID={`${testID}_oracle_price`}
            >
              {translate('screens/FutureSwapScreen', '{{percentage_change}} on oracle price', { percentage_change: !item.source.isLoanToken ? '+5%' : '-5%' })}
            </ThemedText>
          </ThemedView>
        </View>
        <ThemedView
          style={tailwind('flex flex-row items-center border rounded-sm p-1')}
          light={tailwind('border-gray-200')}
          dark={tailwind('border-gray-700')}
        >
          <ThemedIcon
            size={24}
            name='call-received'
            iconType='MaterialIcons'
            light={tailwind('text-primary-500')}
            dark={tailwind('text-darkprimary-500')}
          />
        </ThemedView>
      </ThemedTouchableOpacity>
    )
  }, [isEnded, transactionDate])

  return (
    <ThemedFlatList
      keyExtractor={(_item, index) => index.toString()}
      data={futureSwaps}
      renderItem={FutureSwapListItem}
      ListHeaderComponent={
        <View style={tailwind('pt-6 px-4')}>
          {displayExecutedInfo &&
            <InfoText
              text={translate('screens/FutureSwapScreen', 'Settlement block {{block}} has been executed', { block: executedBlock })}
              onClose={() => setDisplayExecutedInfo(false)}
            />}
          <InfoText text={translate('screens/FutureSwapScreen', 'The amount will be refunded automatically if the transaction does not go through.')} />
          <ExecutionBlock executionBlock={executionBlock} transactionDate={transactionDate} />
        </View>
      }
    />
  )
}

function ExecutionBlock ({ executionBlock, transactionDate }: { executionBlock: number, transactionDate: string }): JSX.Element {
  const { getBlocksCountdownUrl } = useDeFiScanContext()
  return (
    <ThemedView
      style={tailwind('py-2 rounded border m-4 flex flex-row items-center justify-center flex-wrap')}
      light={tailwind('border-gray-200')}
      dark={tailwind('border-gray-700')}
    >
      <ThemedText
        style={tailwind('text-xs text-center')}
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
      >
        {`${translate('screens/FutureSwapScreen', 'Settlement block')}:`}
      </ThemedText>
      <NumberFormat
        value={executionBlock}
        thousandSeparator
        displayType='text'
        renderText={value =>
          <ThemedText
            style={tailwind('text-xs ml-1')}
            light={tailwind('text-gray-900')}
            dark={tailwind('text-gray-50')}
            testID='execution_block'
          >
            {` ${value}`}
            <ThemedText
              style={tailwind('ml-1 text-xs')}
              light={tailwind('text-gray-900')}
              dark={tailwind('text-gray-50')}
            >
              {` (${transactionDate}) `}

            </ThemedText>
          </ThemedText>}
      />
      <TouchableOpacity onPress={async () => await openURL(getBlocksCountdownUrl(executionBlock))}>
        <ThemedIcon
          size={16}
          name='open-in-new'
          iconType='MaterialIcons'
          style={tailwind('flex items-center')}
          dark={tailwind('text-darkprimary-500')}
          light={tailwind('text-primary-500')}
        />
      </TouchableOpacity>
    </ThemedView>
  )
}

function InfoText ({ text, onClose }: { text: string, onClose?: () => void }): JSX.Element {
  return (
    <ThemedView
      style={tailwind('rounded p-2 mb-2 flex flex-row items-center justify-between')}
      light={tailwind('bg-blue-100')}
      dark={tailwind('bg-darkblue-100')}
    >
      <View style={tailwind('flex flex-row items-center flex-1')}>
        <ThemedIcon
          iconType='MaterialIcons'
          name='info'
          size={14}
          light={tailwind('text-blue-600')}
          dark={tailwind('text-darkblue-600')}
        />
        <ThemedText
          style={tailwind('text-xs pl-2 flex-1')}
          light={tailwind('text-black opacity-60')}
          dark={tailwind('text-white opacity-60')}
        >
          {text}
        </ThemedText>
      </View>
      {onClose !== undefined &&
        <TouchableOpacity onPress={onClose}>
          <ThemedIcon
            iconType='MaterialIcons'
            name='close'
            size={24}
            light={tailwind('text-gray-600')}
            dark={tailwind('text-gray-300')}
          />
        </TouchableOpacity>}
    </ThemedView>
  )
}
