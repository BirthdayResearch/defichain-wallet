import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { useCallback, useState } from 'react'
import * as React from 'react'
import { FlatList, RefreshControl, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import tailwind from 'tailwind-rn'
import { NumberText } from '../../../../components'

import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { useWhaleApiClient } from '../../../../hooks/api/useWhaleApiClient'
import { fetchTokens, useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { RootState } from '../../../../store'
import { translate } from '../../../../translations'

export function BalancesScreen (): JSX.Element {
  const address = useSelector((state: RootState) => state.wallet.address)
  const [refreshing, setRefreshing] = useState(false)
  const dispatch = useDispatch()
  const whaleAPI = useWhaleApiClient()

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchTokens(address, dispatch, whaleAPI)
    setRefreshing(false)
  }, [])

  const tokens = useTokensAPI()
  return (
    <FlatList
      data={tokens}
      testID='balances_list'
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      renderItem={({ item }) => <BalanceItemRow token={item} key={item.id} />}
      ListHeaderComponent={
        <Text style={tailwind('font-bold p-4 text-base')}>
          {translate('screens/BalancesScreen', 'Portfolio')}
        </Text>
      }
    />
  )
}

function BalanceItemRow ({ token }: { token: AddressToken }): JSX.Element {
  const Icon = getTokenIcon(token.symbol)
  return (
    <View testID={token.id} style={tailwind('bg-white p-2 border-b border-gray-200 flex-row items-center h-16')}>
      <View style={tailwind('w-8')}>
        <Icon />
      </View>
      <View style={tailwind('flex flex-col ml-3')}>
        <Text style={tailwind('font-medium')}>{token.symbol}</Text>
        <Text style={tailwind('text-xs text-gray-400 overflow-hidden')}>{token.name}</Text>
      </View>
      <Text style={tailwind('flex-grow text-right font-medium overflow-hidden ml-3')}>
        <NumberText value={token.amount} />
      </Text>
    </View>
  )
}
