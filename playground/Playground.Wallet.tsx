import React from 'react'
import { Text, View } from 'react-native'
import tailwind from 'tailwind-rn'
import { usePlaygroundRpcClient } from "../hooks/api/usePlaygroundRpcClient";
import { useLoadJellyfishWallet } from "../hooks/wallet/useJellyfishWallet";

export function PlaygroundWallet (): JSX.Element {
  const rpcClient = usePlaygroundRpcClient()
  const status = useLoadJellyfishWallet()

  return (
    <View>
      <Text style={tailwind('font-bold')}>Playground Wallet</Text>
    </View>
  )
}

// TODO(fuxingloh): is wallet loaded
// TODO(fuxingloh): Setup Abandon x23 Wallet
// TODO(fuxingloh): Setup Random Wallet

// TODO(fuxingloh): Top Up UTXO
