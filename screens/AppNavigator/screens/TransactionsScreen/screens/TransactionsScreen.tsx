import * as React from 'react'
import tailwind from 'tailwind-rn'
import { translate } from '../../../../../translations'
import { View, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { useEffect, useState } from 'react'
import { useWalletAPI } from '../../../../../hooks/wallet/WalletAPI'
import { useWhaleApiClient } from '../../../../../hooks/api/useWhaleApiClient'
import { Ionicons } from '@expo/vector-icons'
import { Text, NumberText } from '../../../../../components'
import { activitiesToViewModel, VMTransaction } from './stateProcessor'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { TransactionsParamList } from '../TransactionsNavigator'
import { PrimaryColorStyle } from '../../../../../constants/Theme'

export function TransactionsScreen (): JSX.Element {
  const whaleApiClient = useWhaleApiClient()
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
    }).catch((e) => {
      // setError(e)
      setLoadingStatus('error')
    })
  }

  useEffect(() => loadData(), [])

  return (
    <FlatList
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

function TransactionRow (navigation: NavigationProp<TransactionsParamList>): (row: { item: VMTransaction }) => JSX.Element {
  return (row: { item: VMTransaction }): JSX.Element => {
    const {
      color,
      amount,
      desc,
      block,
      token
    } = row.item

    return (
      <TouchableOpacity
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
            <NumberText value={amount} style={{ color }} />
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
      <TouchableOpacity onPress={onPress} style={tailwind('p-2')}>
        <Text style={PrimaryColorStyle.text}>{translate('screens/TransactionsScreen', 'LOAD MORE')}</Text>
      </TouchableOpacity>
    </View>
  )
}
