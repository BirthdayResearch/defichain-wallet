import { Text, View } from 'react-native'
import tailwind from 'tailwind-rn'
import React from 'react'

export function PlaygroundDex (): JSX.Element {
  return (
    <View>
      <Text style={tailwind('font-bold')}>Playground DEX</Text>
    </View>
  )
}

// TODO(fuxingloh): See Available Pairs from Wallet
