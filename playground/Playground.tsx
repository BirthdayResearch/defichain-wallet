import { Text, View } from 'react-native'
import tailwind from 'tailwind-rn'
import React from 'react'
import { PlaygroundConnection } from './Playground.Connection'
import { PlaygroundWallet } from './Playground.Wallet'
import { PlaygroundToken } from './Playground.Token'
import { PlaygroundDex } from './Playground.Dex'

export function Playground (): JSX.Element {
  return (
    <View style={tailwind('p-4')}>
      <Text style={tailwind('text-lg font-bold')}>DeFi Wallet x DeFi Playground</Text>
      <View style={tailwind('mt-2 p-3 bg-pink-100 rounded')}>
        <Text style={tailwind('text-xs font-medium')}>
          DeFi Playground is a specialized testing blockchain isolated from MainNet for testing DeFi applications.
          Assets are not real, it can be minted by anyone. Blocks are generated every 3 seconds, the chain resets daily.
        </Text>
      </View>

      <View>
        <View style={tailwind('mt-4')}>
          <PlaygroundConnection />
        </View>
        <View style={tailwind('mt-4')}>
          <PlaygroundWallet />
        </View>
        <View style={tailwind('mt-4')}>
          <PlaygroundToken />
        </View>
        <View style={tailwind('mt-4')}>
          <PlaygroundDex />
        </View>
      </View>
    </View>
  )
}
