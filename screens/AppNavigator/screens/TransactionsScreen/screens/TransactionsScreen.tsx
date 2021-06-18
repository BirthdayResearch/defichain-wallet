import * as React from 'react'
import tailwind from 'tailwind-rn'
import { translate } from '../../../../../translations'
import { View, Button, FlatList, ScrollView, TouchableOpacity } from 'react-native'
import { useEffect, useState } from 'react'
import { useWalletAPI } from '../../../../../hooks/wallet/WalletAPI'
import { AddressActivity } from '@defichain/whale-api-client/dist/api/address'
import { useWhaleApiClient } from '../../../../../hooks/api/useWhaleApiClient'
import { Ionicons } from '@expo/vector-icons'
import BigNumber from 'bignumber.js'
import { Text, NumberText } from '../../../../../components'
import { useNavigation } from '@react-navigation/native'

export function TransactionsScreen (): JSX.Element {
  const navigation = useNavigation()
  const whaleApiClient = useWhaleApiClient()
  const account = useWalletAPI().getWallet().get(0)

  // main data
  const [activities, setAddressActivities] = useState<AddressActivity[]>([])
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
    account.getAddress().then(async address => {
      return await whaleApiClient.address.listTransaction(address, undefined, nextToken)
    }).then(async addActivities => {
      setHasNext(addActivities.hasNext)
      setNextToken(addActivities.nextToken as string|undefined)
      setAddressActivities([...activities, ...addActivities])
      setStatus('idle')
    }).catch((e) => {
      setError(e)
      setStatus('error')
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  const TransactionRow = (row: { item: AddressActivity }): JSX.Element => {
    let iconName: 'arrow-up' | 'arrow-down'
    let color: 'green'|'gray'
    let desc = ''
    const isPositive = row.item.vin === undefined

    // TODO(@ivan-zynesis): fix when other token transaction can be included
    const TOKEN_NAME: { [key in number]: string } = {
      0: 'DFI',
      1: 'tBTC'
    }

    const tokenId = TOKEN_NAME[row.item.tokenId as number]
    let amount = new BigNumber(row.item.value)

    if (isPositive) {
      color = 'green'
      // TODO(@ivan-zynesis): Simplified, more complicated token transaction should have different icon and desc
      iconName = 'arrow-down'
      desc = 'Received'
    } else {
      color = 'gray'
      iconName = 'arrow-up'
      desc = 'Sent'
      amount = amount.negated()
    }

    const option = {
      id: row.item.id,
      desc,
      iconName,
      color,
      amount: amount.toFixed(),
      block: row.item.block.height,
      token: tokenId
    }

    const txIcon = <Ionicons name='arrow-down' size={24} color={color} />
    const amountText = <NumberText value={option.amount} style={{ color }} />

    return (
      <TouchableOpacity
        key={row.item.id}
        style={tailwind('bg-white p-2 border-b border-gray-200 flex-row items-center w-full h-16')}
        onPress={() => navigation.navigate('TransactionDetail', { activity: row.item })}
      >
        <View style={tailwind('w-full flex-row flex-initial')}>
          <View style={tailwind('w-8 justify-center')}>
            {txIcon}
          </View>
          <View style={tailwind('flex-auto flex-row justify-center items-center')}>
            <View style={tailwind('flex-auto flex-col ml-3 justify-center')}>
              <Text style={tailwind('font-medium')}>
                {translate('screens/TransactionsScreen', option.desc)}
              </Text>
              <Text style={tailwind('font-medium')}>
                {translate('screens/TransactionsScreen', 'block')}: {option.block}
              </Text>
            </View>
            <View style={tailwind('flex-row ml-3 items-center')}>
              {amountText}
              <View style={tailwind('w-16 ml-3 items-start')}>
                <Text style={tailwind('flex-shrink font-medium')}>
                  {option.token}
                </Text>
              </View>
            </View>
          </View>
          <View style={tailwind('w-8 flex-grow-0 justify-center flex-end')}>
            <Ionicons name='chevron-forward' size={24} color='gray' />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

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
    <ScrollView style={tailwind('w-full')}>
      <FlatList
        data={activities}
        renderItem={TransactionRow}
        keyExtractor={(item) => item.id}
        ListFooterComponent={LoadMore}
      />
    </ScrollView>
  )
}
