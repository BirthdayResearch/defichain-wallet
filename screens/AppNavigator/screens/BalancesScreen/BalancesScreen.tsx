import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import * as React from 'react'
import { FlatList, Text, View } from 'react-native'
import tailwind from 'tailwind-rn'
import { NumberText } from '../../../../components'

import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { translate } from '../../../../translations'

export function BalancesScreen (): JSX.Element {
  const tokens = useTokensAPI()
  return (
    <View style={tailwind('items-start justify-start w-full')}>
      <FlatList
        style={tailwind('w-full mb-4')}
        data={tokens}
        testID='balances_list'
        renderItem={({ item }) => <BalanceItemRow token={item} key={item.id} />}
        ListHeaderComponent={
          <Text style={tailwind('font-bold p-4 text-base')}>
            {translate('screens/BalancesScreen', 'Portfolio')}
          </Text>
        }
      />
    </View>
  )
}

function BalanceItemRow ({ token }: { token: AddressToken }): JSX.Element {
  const Icon = getTokenIcon(token.symbol)
  return (
    <View testID={token.id} style={tailwind('bg-white p-2 border-b border-gray-200 flex-row items-center w-full h-16')}>
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
