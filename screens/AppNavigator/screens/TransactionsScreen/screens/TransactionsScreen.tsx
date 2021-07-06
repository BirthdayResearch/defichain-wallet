import { Ionicons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native'
import NumberFormat from 'react-number-format'
import tailwind from 'tailwind-rn'
import { getWhaleClient } from '../../../../../app/api/whale'
import { Text } from '../../../../../components'
import { PrimaryColorStyle } from '../../../../../constants/Theme'
import { useWalletAPI } from '../../../../../hooks/wallet/WalletAPI'
import { translate } from '../../../../../translations'
import { TransactionsParamList } from '../TransactionsNavigator'
import { activitiesToViewModel, VMTransaction } from './stateProcessor'

export function TransactionsScreen (): JSX.Element {
  const whaleApiClient = getWhaleClient()
  const account = useWalletAPI().getWallet().get(0)
  const navigation = useNavigation<NavigationProp<TransactionsParamList>>()

  const [activities, setAddressActivities] = useState<VMTransaction[]>([])
  const [loadingStatus, setLoadingStatus] = useState('initial') // page status
  const [nextToken, setNextToken] = useState<string|undefined>(undefined)
  const [hasNext, setHasNext] = useState<boolean>(false)
  // const [error, setError] = useState<Error|undefined>(undefined) // TODO: render error

  const loadData = (): void => {
    if (
      loadingStatus === 'loading' ||
      (loadingStatus === 'idle' && !hasNext) // last page
    ) {
      return
    }

    setLoadingStatus('loading')
    account.getAddress().then(async address => {
      return await whaleApiClient.address.listTransaction(address, undefined, nextToken)
    }).then(async addActivities => {
      const newRows = activitiesToViewModel(addActivities)
      setAddressActivities([...activities, ...newRows])
      setHasNext(addActivities.hasNext)
      setNextToken(addActivities.nextToken as string|undefined)
      setLoadingStatus('idle')
    }).catch(() => {
      setLoadingStatus('error')
    })
  }

  useEffect(() => loadData(), [])

  return (
    <FlatList
      testID='transactions_screen_list'
      style={tailwind('w-full')}
      data={activities}
      renderItem={TransactionRow(navigation)}
      keyExtractor={(item) => item.id}
      ListFooterComponent={hasNext ? LoadMore(loadData) : undefined}
      refreshControl={
        <RefreshControl
          refreshing={loadingStatus === 'loading'}
          onRefresh={loadData}
        />
      }
    />
  )
}

function TransactionRow (navigation: NavigationProp<TransactionsParamList>): (row: { item: VMTransaction, index: number }) => JSX.Element {
  return (row: { item: VMTransaction, index: number }): JSX.Element => {
    const {
      color,
      amount,
      desc,
      block,
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
          <Ionicons name='arrow-down' size={24} color={color} />
        </View>
        <View style={tailwind('flex-1 flex-row justify-center items-center')}>
          <View style={tailwind('flex-auto flex-col ml-3 justify-center')}>
            <Text style={tailwind('font-medium')}>{translate('screens/TransactionsScreen', desc)}</Text>
            <Text style={tailwind('font-medium')}>{translate('screens/TransactionsScreen', 'block')}: {block}</Text>
          </View>
          <View style={tailwind('flex-row ml-3 items-center')}>
            <NumberFormat
              value={amount} decimalScale={8} thousandSeparator displayType='text'
              renderText={(value) => <Text style={{ color }}>{value}</Text>}
            />
            <View style={tailwind('w-16 ml-2 items-start')}>
              <Text style={tailwind('flex-shrink font-medium text-gray-600')}>{token}</Text>
            </View>
          </View>
        </View>
        <View style={tailwind('w-8 justify-center items-center')}>
          <Ionicons name='chevron-forward' size={24} color='rgba(0,0,0,0.6)' />
        </View>
      </TouchableOpacity>
    )
  }
}

function LoadMore (onPress: () => void): JSX.Element|null {
  return (
    <View style={tailwind('flex-1 items-center justify-center w-full m-1')}>
      <TouchableOpacity
        testID='transactions_list_loadmore'
        onPress={onPress}
        style={tailwind('p-2')}
      >
        <Text style={PrimaryColorStyle.text}>{translate('screens/TransactionsScreen', 'LOAD MORE')}</Text>
      </TouchableOpacity>
    </View>
  )
}
