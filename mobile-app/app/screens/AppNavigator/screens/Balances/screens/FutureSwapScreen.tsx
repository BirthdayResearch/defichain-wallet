import { View } from '@components'
import { ThemedFlatList, ThemedIcon, ThemedSectionTitle, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import NumberFormat from 'react-number-format'
import tailwind from 'tailwind-rn'
import { BalanceParamList } from '../BalancesNavigator'

export interface FutureSwap {
  transactionDate: Date
  dueDate: Date
  tokenAmount: BigNumber
  fromTokenDisplaySymbol: string
  toTokenDisplaySymbol: string
  toLoanToken: boolean
  executionBlock: number
  txId: string
}

type Props = StackScreenProps<BalanceParamList, 'FutureSwapScreen'>

export function FutureSwapScreen ({ navigation }: Props): JSX.Element {
  const mockData: FutureSwap[] = [
    {
      transactionDate: new Date(),
      dueDate: new Date(),
      tokenAmount: new BigNumber(123),
      fromTokenDisplaySymbol: 'DUSD',
      toTokenDisplaySymbol: 'dTU10',
      toLoanToken: true,
      executionBlock: 20160,
      txId: '441088a44388cc050f70c81d93185c078fbe95b071a23dee91f23b121cbd3b29'
    },
    {
      transactionDate: new Date(),
      dueDate: new Date(),
      tokenAmount: new BigNumber(456),
      fromTokenDisplaySymbol: 'dTU10',
      toTokenDisplaySymbol: 'DUSD',
      toLoanToken: false,
      executionBlock: 20160,
      txId: '045928316b751e236a3a338c1073a2c7272b47ecc279f27884fd66583991eb02'
    }
  ]

  const onPress = (item: FutureSwap): void => {
    navigation.navigate({
      name: 'FutureSwapDetailScreen',
      params: {
        futureSwap: item
      }
    })
  }

  const FutureSwapListItem = useCallback(({
    item
  }: { item: FutureSwap }): JSX.Element => {
    return (
      <ThemedTouchableOpacity
        style={tailwind('py-3 pl-4 pr-2 items-center justify-between flex flex-row')}
        onPress={() => onPress(item)}
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
              {translate('screens/FutureSwapScreen', 'Due on Aug 30, 2022')}
            </ThemedText>
          </View>
        </View>
        <View style={tailwind('flex flex-row items-center')}>
          <View>
            <NumberFormat
              value={item.tokenAmount.toFixed(8)}
              thousandSeparator
              displayType='text'
              suffix={` ${item.fromTokenDisplaySymbol}`}
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
              {translate('screens/FutureSwapScreen', `Oracle price ${item.toLoanToken ? '+5%' : '-5%'}`)}
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
  }, [])

  return (
    <ThemedFlatList
      keyExtractor={(item) => item.txId}
      data={mockData}
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
