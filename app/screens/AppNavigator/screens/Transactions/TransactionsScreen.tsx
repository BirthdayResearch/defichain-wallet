import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import dayjs from 'dayjs'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'

import { Text } from '../../../../components'
import { useWalletAddressContext } from '../../../../contexts/WalletAddressContext'
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
  const { address } = useWalletAddressContext()
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

  return activities.length === 0
    ? <EmptyTransaction navigation={navigation} handleRefresh={loadData} loadingStatus={loadingStatus} />
    : <FlatList testID='transactions_screen_list' style={tailwind('w-full')} data={activities} renderItem={TransactionRow(navigation)} keyExtractor={(item) => item.id} ListFooterComponent={hasNext ? LoadMore(onLoadMore) : undefined} refreshControl={<RefreshControl refreshing={loadingStatus === 'loading'} onRefresh={loadData} />} />
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
      <TouchableOpacity
        testID={rowId}
        key={row.item.id}
        style={tailwind('flex-row w-full h-16 bg-white p-2 border-b border-gray-200 items-center')}
        onPress={() => {
          navigation.navigate('TransactionDetail', { tx: row.item })
        }}
      >
        <View style={tailwind('w-8 justify-center items-center')}>
          <MaterialIcons name={iconName} size={24} color={color} />
        </View>
        <View style={tailwind('flex-1 flex-row justify-center items-center')}>
          <View style={tailwind('flex-auto flex-col ml-3 justify-center')}>
            <Text style={tailwind('font-medium')}>{translate('screens/TransactionsScreen', desc)}</Text>
            <Text
              style={tailwind('text-xs text-gray-600')}
            >{formatBlockTime(medianTime)}
            </Text>
          </View>
          <View style={tailwind('flex-row ml-3 w-32 justify-end items-center')}>
            <NumberFormat
              value={amount} decimalScale={8} thousandSeparator displayType='text'
              renderText={(value) => <Text numberOfLines={1} ellipsizeMode='tail' style={{ color }}>{value}</Text>}
            />
            <View style={tailwind('ml-2 items-start')}>
              <Text style={tailwind('flex-shrink font-medium text-gray-600')}>{token}</Text>
            </View>
          </View>
        </View>
        <View style={tailwind('w-8 justify-center items-center')}>
          <MaterialIcons name='chevron-right' size={24} style={tailwind('text-black opacity-60')} />
        </View>
      </TouchableOpacity>
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
        <Text style={tailwind('text-primary')}>{translate('screens/TransactionsScreen', 'LOAD MORE')}</Text>
      </TouchableOpacity>
    </View>
  )
}
