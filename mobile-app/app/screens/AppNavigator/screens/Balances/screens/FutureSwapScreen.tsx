import { View } from '@components'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import NumberFormat from 'react-number-format'
import tailwind from 'tailwind-rn'

interface FutureSwap {
  dueDate: Date
  tokenAmount: BigNumber
  tokenDisplaySymbol: string
  toLoanToken: boolean
}

export function FutureSwapScreen (): JSX.Element {
  const mockData: FutureSwap[] = [
    {
      dueDate: new Date(),
      tokenAmount: new BigNumber(123),
      tokenDisplaySymbol: 'DUSD',
      toLoanToken: true
    },
    {
      dueDate: new Date(),
      tokenAmount: new BigNumber(456),
      tokenDisplaySymbol: 'dTSLA',
      toLoanToken: false
    }
  ]

  const FutureSwapListItem = useCallback(({
    item,
    index
  }: { item: FutureSwap, index: number }): JSX.Element => {
    return (
      <ThemedTouchableOpacity
        style={tailwind('py-3 pl-4 pr-2 items-center justify-between flex flex-row')}
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
              suffix={` ${item.tokenDisplaySymbol}`}
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
      keyExtractor={(item) => item}
      data={mockData}
      renderItem={FutureSwapListItem}
      ListHeaderComponent={
        <ThemedText
          style={tailwind('pt-4 pb-2 px-4 text-xs font-medium')}
          light={tailwind('text-gray-400')}
          dark={tailwind('text-gray-500')}
        >
          {translate('screens/FutureSwapScreen', 'PENDING TRANSACTIONS')}
        </ThemedText>
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
