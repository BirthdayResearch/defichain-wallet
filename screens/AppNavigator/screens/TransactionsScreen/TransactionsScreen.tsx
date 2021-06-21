import * as React from 'react'
import tailwind from 'tailwind-rn'
import { translate } from '../../../../translations'
import { View, Button, FlatList } from 'react-native'
import { useEffect, useState } from 'react'
import { useWalletAPI } from '../../../../hooks/wallet/WalletAPI'
import { AddressActivity } from '@defichain/whale-api-client/dist/api/address'
import { useWhaleApiClient } from '../../../../hooks/api/useWhaleApiClient'
import { Ionicons } from '@expo/vector-icons'
import BigNumber from 'bignumber.js'
import { Text, NumberText } from '../../../../components'

interface TransactionRowModel {
  id: string
  desc: string
  iconName: string
  color: string
  amount: string
  block: number
  token: string
}

interface ReducedPageState {
  txRows: TransactionRowModel[]
  hasNext: boolean
  nextToken: string|undefined
}

export function TransactionsScreen (): JSX.Element {
  const whaleApiClient = useWhaleApiClient()
  const account = useWalletAPI().getWallet().get(0)

  // main data
  const [activities, setAddressActivities] = useState<TransactionRowModel[]>([])
  const [status, setStatus] = useState('initial') // page status

  // TODO(@ivan-zynesis): standardize how to display error (some base component)?
  // eslint-disable-next-line
  const [error, setError] = useState<Error|undefined>(undefined)

  // pagination
  const [nextToken, setNextToken] = useState<string|undefined>(undefined)
  const [hasNext, setHasNext] = useState<boolean|undefined>(undefined)

  function loadData (isFirstPage: boolean = true): void {
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
      const newRows = []
      for (let i = 0; i < addActivities.length; i++) {
        const act = addActivities[i]
        newRows.push(activityToTxRowReducer(act))
      }

      return {
        txRows: [...activities, ...newRows],
        hasNext: addActivities.hasNext,
        nextToken: addActivities.nextToken as string|undefined
      }
    }).then(async (reduced: ReducedPageState) => {
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
function TransactionRow (row: { item: TransactionRowModel }): JSX.Element {
  const {
    color,
    amount,
    desc,
    block,
    token
  } = row.item
  const txIcon = <Ionicons name='arrow-down' size={24} color={color} />
  const amountText = <NumberText value={amount} style={{ color }} />

  return (
    <View key={row.item.id} style={tailwind('bg-white p-2 border-b border-gray-200 flex-row items-center w-full h-16')}>
      <View style={tailwind('w-full flex-row flex-initial')}>
        <View style={tailwind('w-8 justify-center')}>
          {txIcon}
        </View>
        <View style={tailwind('flex-auto flex-row justify-center items-center')}>
          <View style={tailwind('flex-auto flex-col ml-3 justify-center')}>
            <Text style={tailwind('font-medium')}>
              {translate('screens/TransactionsScreen', desc)}
            </Text>
            <Text style={tailwind('font-medium')}>
              {translate('screens/TransactionsScreen', 'block')}: {block}
            </Text>
          </View>
          <View style={tailwind('flex-row ml-3 items-center')}>
            {amountText}
            <View style={tailwind('w-16 ml-2 items-start')}>
              <Text style={tailwind('flex-shrink font-medium text-gray-600')}>
                {token}
              </Text>
            </View>
          </View>
        </View>
        <View style={tailwind('w-8 flex-grow-0 justify-center flex-end')}>
          <Ionicons name='chevron-forward' size={24} color='gray' />
        </View>
      </View>
    </View>
  )
}

// minimum output, just enough for rendering (setState) use
const activityToTxRowReducer = (activity: AddressActivity): TransactionRowModel => {
  let iconName: 'arrow-up' | 'arrow-down'
  let color: '#02B31B'|'gray'
  let desc = ''
  const isPositive = activity.vin === undefined

  // TODO(@ivan-zynesis): fix when other token transaction can be included
  const TOKEN_NAME: { [key in number]: string } = {
    0: 'DFI',
    1: 'tBTC'
  }

  const tokenId = TOKEN_NAME[activity.tokenId as number]
  let amount = new BigNumber(activity.value)

  if (isPositive) {
    color = '#02B31B' // green
    // TODO(@ivan-zynesis): Simplified, more complicated token transaction should have different icon and desc
    iconName = 'arrow-down'
    desc = 'Received'
  } else {
    color = 'gray'
    iconName = 'arrow-up'
    desc = 'Sent'
    amount = amount.negated()
  }

  return {
    id: activity.id,
    desc,
    iconName,
    color,
    amount: amount.toFixed(),
    block: activity.block.height,
    token: tokenId
  }
}
