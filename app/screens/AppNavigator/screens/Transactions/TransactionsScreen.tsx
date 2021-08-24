import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import dayjs from 'dayjs'
import * as React from 'react'
import { useEffect } from 'react'
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native'
import NumberFormat from 'react-number-format'
import { useDispatch, useSelector } from 'react-redux'
import { Text } from '../../../../components'
import { SkeletonLoader, SkeletonLoaderScreen } from '../../../../components/SkeletonLoader'
import { useWalletContext } from '../../../../contexts/WalletContext'
import { useWhaleApiClient } from '../../../../contexts/WhaleContext'
import { RootState } from '../../../../store'
import { transaction } from '../../../../store/transaction'
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
  const transactions = useSelector((state: RootState) => state.transaction.transactions)
  const loadingState = useSelector((state: RootState) => state.transaction.loadingState)
  const loadMoreToken = useSelector((state: RootState) => state.transaction.loadMoreToken)
  const dispatch = useDispatch()

  useEffect(() => {
    // onload
    if (loadingState === 'idle') {
      dispatch(transaction.actions.setLoadingState('loading'))
      loadData()
    }
  }, [])

  useEffect(() => {
    // background update
    if (loadingState === 'success' || loadingState === 'error') {
      dispatch(transaction.actions.setLoadingState('background'))
      loadData()
    }
  }, [address, blocks])

  const loadData = (loadMoreToken?: string | undefined): void => {
    client.address.listTransaction(address, undefined, loadMoreToken)
      .then(async addActivities => {
        if (typeof loadMoreToken === 'string') {
          dispatch(transaction.actions.addTransactions(activitiesToViewModel(addActivities)))
        } else {
          dispatch(transaction.actions.setTransactions(activitiesToViewModel(addActivities)))
        }

        dispatch(transaction.actions.setLoadMoreToken(addActivities.nextToken))
        dispatch(transaction.actions.setLoadingState('success'))
      }).catch((err) => {
        dispatch(transaction.actions.setError(err))
        dispatch(transaction.actions.setLoadingState('error'))
      })
  }

  const onLoadMore = (): void => {
    if (loadingState === 'success' || loadingState === 'error') {
      loadData(loadMoreToken)
    }
  }

  const onRefresh = (): void => {
    dispatch(transaction.actions.setLoadingState('loadingMore'))
    loadData(loadMoreToken)
  }

  if (transactions.length === 0 &&
    (loadingState === 'success' || loadingState === 'background')) {
    return (
      <EmptyTransaction
        navigation={navigation}
        handleRefresh={loadData}
        loadingStatus={loadingState}
      />
    )
  }

  if (loadingState === 'loading') {
    return (
      <>
        <SkeletonLoader row={3} screen={SkeletonLoaderScreen.Transaction} />
      </>
    )
  }
  // TODO(kyleleow): render error screen
  return (
    <FlatList
      testID='transactions_screen_list'
      style={tailwind('w-full')}
      data={transactions}
      renderItem={TransactionRow(navigation)}
      keyExtractor={(item) => item.id}
      ListFooterComponent={typeof loadMoreToken === 'string' ? LoadMore(onLoadMore) : undefined}
      refreshControl={
        <RefreshControl
          refreshing={loadingState === 'loadingMore'}
          onRefresh={onRefresh}
        />
      }
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
      <TouchableOpacity
        testID={rowId}
        key={row.item.id}
        style={tailwind('flex-row w-full h-16 bg-white p-2 border-b border-gray-200 items-center')}
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
