import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import * as React from 'react'
import { useEffect } from 'react'
import { Text, View } from 'react-native'
import tailwind from 'tailwind-rn'

import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { useWhaleApiClient } from '../../../../hooks/api/useWhaleApiClient'
import { useWalletAPI } from '../../../../hooks/wallet/WalletAPI'

export function BalancesScreen (): JSX.Element {
  const whaleApiClient = useWhaleApiClient()
  const account = useWalletAPI().getWallet().get(0)

  const [utxoBalance, setUtxoBalance] = React.useState<string>('')
  const [tokens, setTokens] = React.useState<AddressToken[]>([])

  useEffect(() => {
    account.getAddress().then(async address => {
      const balance = await whaleApiClient.address.getBalance(address)
      setUtxoBalance(balance)

      const tokens = await whaleApiClient.address.listToken(address, 30)
      setTokens([...tokens])
    }).catch(() => {
      console.log('@typescript-eslint/no-floating-promises')
    })
  }, [])

  const Icon = getTokenIcon('DFI')

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
      <View style={tailwind('flex-row items-center')}>
        <Icon />
        <Text style={tailwind('ml-2')}>{utxoBalance}</Text>
      </View>
      {balances}
    </View>
  )
}
