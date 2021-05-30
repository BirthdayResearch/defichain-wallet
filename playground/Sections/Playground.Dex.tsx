import { Text, View } from 'react-native'
import tailwind from 'tailwind-rn'
import React from 'react'

export function PlaygroundDex (): JSX.Element {
  return (
    <View>
      <Text style={tailwind('text-lg font-bold')}>DEX</Text>
    </View>
  )
}

// TODO(fuxingloh): See Available Pairs from Wallet
