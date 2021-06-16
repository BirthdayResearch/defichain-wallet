import * as React from 'react'
import { Text, View } from 'react-native'
import tailwind from 'tailwind-rn'

import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { useTokensAPI } from '../../../../hooks/wallet/TokensAPI'

export function BalancesScreen (): JSX.Element {
  const tokens = useTokensAPI()
  const balances = tokens.map(token => {
    const Icon = getTokenIcon(token.symbol)
    return (
      <View key={token.id} style={tailwind('flex-row items-center')}>
        <Icon />
        <Text style={tailwind('ml-2')}>{token.amount}</Text>
      </View>
    )
  })

  return (
    <View style={tailwind('flex-1 items-center justify-center')}>
      {balances}
    </View>
  )
}
