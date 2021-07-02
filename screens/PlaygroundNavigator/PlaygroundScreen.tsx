import React from 'react'
import { ScrollView } from 'react-native'
import tailwind from 'tailwind-rn'
import { Text, View } from '../../components'
import { PlaygroundConnection } from './sections/PlaygroundConnection'
import { PlaygroundToken } from './sections/PlaygroundToken'
import { PlaygroundUTXO } from './sections/PlaygroundUTXO'
import { PlaygroundWallet } from './sections/PlaygroundWallet'

export function PlaygroundScreen (): JSX.Element {
  return (
    <ScrollView style={tailwind('p-4 bg-white')} contentInsetAdjustmentBehavior='always'>
      <View style={tailwind('mb-4 p-3 bg-pink-100 rounded')}>
        <Text style={tailwind('text-xs font-medium')}>
          DeFi Playground is a specialized testing blockchain isolated from MainNet for testing DeFi applications.
          Assets are not real, it can be minted by anyone. Blocks are generated every 3 seconds, the chain resets daily.
        </Text>
      </View>

      <View style={tailwind('mt-4 mb-4')}>
        <PlaygroundConnection />
      </View>

      <View style={tailwind('mt-4 mb-4')}>
        <PlaygroundWallet />
      </View>

      <View style={tailwind('mt-4 mb-4')}>
        <PlaygroundUTXO />
      </View>

      <View style={tailwind('mt-4 mb-4')}>
        <PlaygroundToken />
      </View>
    </ScrollView>
  )
}
