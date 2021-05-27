import { Text, View } from 'react-native'
import tailwind from 'tailwind-rn'
import React from 'react'

export function PlaygroundWallet (): JSX.Element {
  return (
    <View>
      <Text style={tailwind('font-bold')}>Playground Wallet</Text>
    </View>
  )
}

// TODO(fuxingloh): Setup Abandon x23 Wallet
// TODO(fuxingloh): Setup Random Wallet
// TODO(fuxingloh): Top Up UTXO
