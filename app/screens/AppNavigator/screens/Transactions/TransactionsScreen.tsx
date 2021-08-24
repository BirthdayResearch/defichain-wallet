import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import dayjs from 'dayjs'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { RefreshControl, TouchableOpacity, View } from 'react-native'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { ThemedFlatList, ThemedIcon, ThemedText, ThemedTouchableOpacity } from '../../../../components/themed'
import { useWalletContext } from '../../../../contexts/WalletContext'
import { useWhaleApiClient } from '../../../../contexts/WhaleContext'
import { RootState } from '../../../../store'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { EmptyTransaction } from './EmptyTransaction'
import { activitiesToViewModel, VMTransaction } from './screens/stateProcessor'
import { TransactionsParamList } from './TransactionsNavigator'

export function formatBlockTime (date: number): string {
  return dayjs(date * 1000).format('MMM D, h:mm a')
}

export function TransactionsScreen (): JSX.Element {
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const navigation = useNavigation<NavigationProp<TransactionsParamList>>()
  const blocks = useSelector((state: RootState) => state.block.count)

  const [activities, setAddressActivities] = useState<VMTransaction[]>([])
  const [loadingStatus, setLoadingStatus] = useState('initial') // page status
  const [nextToken, setNextToken] = useState<string | undefined>(undefined)
  const [hasNext, setHasNext] = useState<boolean>(false)
  // const [error, setError] = useState<Error|undefined>(undefined) // TODO: render error

  const loadData = (nextToken?: string | undefined): void => {
    if (loadingStatus === 'loading') return
    setLoadingStatus('loading')
    client.address.listTransaction(address, undefined, nextToken)
      .then(async addActivities => {
        const newRows = activitiesToViewModel(addActivities)
        if (nextToken !== undefined) {
          setAddressActivities([...activities, ...newRows])
        } else {
          setAddressActivities([...newRows])
        }
        setHasNext(addActivities.hasNext)
        setNextToken(addActivities.nextToken as string)
        setLoadingStatus('idle')
      }).catch(() => {
        setLoadingStatus('error')
      })
  }

  const onLoadMore = (): void => {
    loadData(nextToken)
  }

  useEffect(() => {
    loadData()
  }, [address, blocks])

  if (activities.length === 0) {
    return (
      <EmptyTransaction
        navigation={navigation}
        handleRefresh={loadData}
        loadingStatus={loadingStatus}
      />
    )
  }

  return (
    <ThemedFlatList
      testID='transactions_screen_list' style={tailwind('w-full')} data={activities}
      renderItem={TransactionRow(navigation)} keyExtractor={(item) => item.id}
      ListFooterComponent={hasNext ? LoadMore(onLoadMore) : undefined}
      refreshControl={<RefreshControl refreshing={loadingStatus === 'loading'} onRefresh={loadData} />}
    />
  )
}

function TransactionRow (navigation: NavigationProp<TransactionsParamList>): (row: { item: VMTransaction, index: number }) => JSX.Element {
  return (row: { item: VMTransaction, index: number }): JSX.Element => {
    const {
      color,
      iconName,
      amount,
      desc,
      medianTime,
      token
    } = row.item

    const rowId = `transaction_row_${row.index}`
    return (
      <ThemedTouchableOpacity
        testID={rowId}
        key={row.item.id}
        light='bg-white border-b border-gray-200'
        dark='bg-gray-800 border-b border-gray-700'
        style={tailwind('flex-row w-full h-16 p-2 items-center')}
        onPress={() => {
          navigation.navigate({
            name: 'TransactionDetail', params: { tx: row.item }, merge: true
          })
        }}
      >
        <View style={tailwind('w-8 justify-center items-center')}>
          <MaterialIcons name={iconName} size={24} color={color} />
        </View>
        <View style={tailwind('flex-1 flex-row justify-center items-center')}>
          <View style={tailwind('flex-auto flex-col ml-3 justify-center')}>
            <ThemedText style={tailwind('font-medium')}>{translate('screens/TransactionsScreen', desc)}</ThemedText>
            <ThemedText
              style={tailwind('text-xs text-gray-600')}
            >{formatBlockTime(medianTime)}
            </ThemedText>
          </View>
          <View style={tailwind('flex-row ml-3 w-32 justify-end items-center')}>
            <NumberFormat
              value={amount} decimalScale={8} thousandSeparator displayType='text'
              renderText={(value) => (
                <ThemedText
                  numberOfLines={1} ellipsizeMode='tail'
                  style={{ color }}
                >{value}
                </ThemedText>
              )}
            />
            <View style={tailwind('ml-2 items-start')}>
              <ThemedText style={tailwind('flex-shrink font-medium text-gray-600')}>{token}</ThemedText>
            </View>
          </View>
        </View>
        <View style={tailwind('w-8 justify-center items-center')}>
          <ThemedIcon iconType='MaterialIcons' name='chevron-right' size={24} style={tailwind('opacity-60')} />
        </View>
      </ThemedTouchableOpacity>
    )
  }
}

function LoadMore (onPress: () => void): JSX.Element | null {
  return (
    <View style={tailwind('flex-1 items-center justify-center w-full m-1')}>
      <TouchableOpacity
        testID='transactions_list_loadmore'
        onPress={onPress}
        style={tailwind('p-2')}
      >
        <ThemedText
          light='text-primary-500'
          dark='text-darkprimary-500'
        >{translate('screens/TransactionsScreen', 'LOAD MORE')}
        </ThemedText>
      </TouchableOpacity>
    </View>
  )
}
