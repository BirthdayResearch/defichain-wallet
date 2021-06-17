import * as React from 'react'
import tailwind from 'tailwind-rn'
import { createStackNavigator } from '@react-navigation/stack'
import { translate } from '../../../../translations'
import { View, Text } from 'react-native'
import { useEffect } from 'react'
import { useWalletAPI } from '../../../../hooks/wallet/WalletAPI'
import { AddressActivity } from '@defichain/whale-api-client/dist/api/address'
import { useWhaleApiClient } from '../../../../hooks/api/useWhaleApiClient'
// import { Method } from '@defichain/whale-api-client'
import { useDispatch, useSelector } from 'react-redux'
import { AsyncState, transaction } from '../../../../store/transaction'
import { RootState } from '../../../../store'

export function TransactionsScreen (): JSX.Element {
  const whaleApiClient = useWhaleApiClient()
  const account = useWalletAPI().getWallet().get(0)

  const status = useSelector<RootState, AsyncState>(state => state.transaction.status)
  // const txs = useSelector<RootState, AddressActivity[]>(state => state.transaction.data)
  const dispatch = useDispatch()

  // app page state
  // not using redux as sharing not needed
  // reset as soon as GC, but should remained working (no reload) in component no destroy
  const activities: AddressActivity[] = []
  const isLoading: boolean = false
  // let error: Error | undefined
  // let endpoint: string | undefined
  // let method: Method | undefined
  // let hasNext: boolean | undefined
  // let nextToken: string | number | undefined

  useEffect(() => {
    if (isLoading) {
      return
    }

    dispatch(transaction.actions.setLoadingStatus('loading'))

    account.getAddress().then(async address => {
      return await whaleApiClient.address.listTransaction(address)
    }).then(async addActivities => {
      // append infinite scrolling list
      activities.push(...addActivities)
      console.log('activities', activities)
      // endpoint = addActivities.endpoint
      // method = addActivities.method
      // hasNext = addActivities.hasNext
      // nextToken = addActivities.nextToken
      dispatch(transaction.actions.setLoadingStatus('idle'))
      dispatch(transaction.actions.setTxs(activities))
    }).catch((e) => {
      // error = e
      dispatch(transaction.actions.setLoadingStatus('error'))
    })
  }, [])

  const row = (tx: AddressActivity): JSX.Element => {
    return (
      <View style={tailwind('flex-1 flex-row items-left')}>
        <Text style={tailwind('flex-column font-bold')}>
          {`${tx.tokenId !== undefined ? tx.tokenId : 'Unknown Token'}: ${tx.type}, ${tx.value}`}
        </Text>
      </View>
    )
  }

  return (
    <View style={tailwind('flex-1 items-center')}>
      <Text style={tailwind('flex-1 flex-row items-center')}>Status: {status}</Text>
      {/* not working */}
      {activities.map(tx => row(tx))}

      {/* working, select from store */}
      {/* {txs.map(tx => row(tx))} */}
    </View>
  )
}

export interface TransactionsParamList {
  TransactionsScreen: undefined

  [key: string]: undefined | object
}

const TransactionsStack = createStackNavigator<TransactionsParamList>()

export function TransactionsNavigator (): JSX.Element {
  return (
    <TransactionsStack.Navigator>
      <TransactionsStack.Screen
        name='transactions'
        component={TransactionsScreen}
        options={{ headerTitle: translate('screens/TransactionsScreen', 'Transactions') }}
      />
    </TransactionsStack.Navigator>
  )
}
