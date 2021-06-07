import * as React from 'react'
import { Button, View } from 'react-native'
import tailwind from 'tailwind-rn'

import { translate } from '../../../../translations'
import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { useWhaleApiClient } from "../../../../hooks/api/useWhaleApiClient";
import { useWalletAPI } from "../../../../hooks/wallet/WalletAPI";
import { useEffect } from "react";
import { AddressToken } from "@defichain/whale-api-client/dist/api/address";

export function BalancesScreen (): JSX.Element {
  const whaleApiClient = useWhaleApiClient()
  const account = useWalletAPI().getWallet().get(0)

  const [utxoBalance, setUtxoBalance] = React.useState<string>("")
  const [tokens, setTokens] = React.useState<AddressToken[]>([])

  useEffect(() => {
    account.getAddress().then(async address => {
      await whaleApiClient.address.getBalance(address).then(value => {
        setUtxoBalance(value)
      })

      await whaleApiClient.address.listToken(address, 30).then(tokens => {
        setTokens(tokens)
      })
    })
  }, []);

  const Icon = getTokenIcon('DFA')

  return (
    <View style={tailwind('flex-1 items-center justify-center')}>
      <Icon />

    </View>
  )
}
