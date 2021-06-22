import * as React from 'react'
import tailwind from 'tailwind-rn'
import { translate } from '../../../../../translations'
import { View, Button, FlatList, TouchableOpacity } from 'react-native'
import { useEffect, useState } from 'react'
import { useWalletAPI } from '../../../../../hooks/wallet/WalletAPI'
import { useWhaleApiClient } from '../../../../../hooks/api/useWhaleApiClient'
import { Ionicons } from '@expo/vector-icons'
import { Text, NumberText } from '../../../../../components'
import { activitiesToViewModel, VMTransaction } from './reducer'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { TransactionsParamList } from '../TransactionsNavigator'

// prop for Transaction row
interface TxRow extends VMTransaction {
  navigation: NavigationProp<TransactionsParamList>
}

// reduced state
interface State {
  txRows: TxRow[]
  hasNext: boolean
  nextToken: string|undefined
}

export function TransactionsScreen (): JSX.Element {
  const whaleApiClient = useWhaleApiClient()
  const account = useWalletAPI().getWallet().get(0)
  const navigation = useNavigation<NavigationProp<TransactionsParamList>>()

  // main data
  const [activities, setAddressActivities] = useState<TxRow[]>([])
  const [status, setStatus] = useState('initial') // page status

  // TODO(@ivan-zynesis): standardize how to display error (some base component)?
  // eslint-disable-next-line
  const [error, setError] = useState<Error|undefined>(undefined)

  // pagination
  const [nextToken, setNextToken] = useState<string|undefined>(undefined)
  const [hasNext, setHasNext] = useState<boolean|undefined>(undefined)

  const loadData = (isFirstPage: boolean = true): void => {
    if (status === 'loading') {
      return
    }

    if (!isFirstPage && hasNext !== true) {
      return
    }

    setStatus('loading')

    /**
     * promise chain of
     * 0. retrieve wallet (pre-req: user should not reach this page if no wallet found)
     * 1. API call to whale
     * 2. reducer
     * 3. dispatch
     */
    account.getAddress().then(async address => {
      return await whaleApiClient.address.listTransaction(address, undefined, nextToken)
    }).then(async addActivities => {
      const newRows = activitiesToViewModel(addActivities).map(tx => ({
        ...tx, navigation
      }))
      return {
        txRows: [...activities, ...newRows],
        hasNext: addActivities.hasNext,
        nextToken: addActivities.nextToken as string|undefined
      }
    }).then(async (reduced: State) => {
      setHasNext(reduced.hasNext)
      setNextToken(reduced.nextToken)
      setAddressActivities(reduced.txRows)
      setStatus('idle') // do this last, ensure no re-loading before all data updates dispatched
    }).catch((e) => {
      setError(e)
      setStatus('error')
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  const LoadMore = (): JSX.Element|null => {
    if (hasNext !== true) {
      return null
    }
    return (
      <View style={tailwind('flex-1 items-center justify-center w-full')}>
        <Button title={translate('screens/TransactionsScreen', 'load more')} onPress={() => loadData(false)} />
      </View>
    )
  }

  return (
    <FlatList
      style={tailwind('w-full')}
      data={activities}
      renderItem={TransactionRow}
      keyExtractor={(item) => item.id}
      ListFooterComponent={LoadMore}
    />
  )
}

// Flatlist row renderer
function TransactionRow (row: { item: TxRow }): JSX.Element {
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
        // TODO(@ivan-zynesis): in another PR, TransactionDetail
      }}
    >
      <View style={tailwind('w-8 justify-center')}>
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
      <View style={tailwind('w-8 justify-center')}>
        <Ionicons name='chevron-forward' size={24} color='gray' />
      </View>
    </TouchableOpacity>
  )
}
