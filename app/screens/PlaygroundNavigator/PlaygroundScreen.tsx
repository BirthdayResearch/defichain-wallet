import React from 'react'
import { ScrollView } from 'react-native'
import { Text, View } from '../../components'
import { WalletProvider } from '../../contexts/WalletContext'
import { useWalletPersistenceContext } from '../../contexts/WalletPersistenceContext'
import { tailwind } from '../../tailwind'
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

      <PlaygroundWalletSection />
    </ScrollView>
  )
}

/**
 * @deprecated need to refactor this as it should never have a 2 `WalletProvider`,
 * however, it should be is a single wallet Provider nested properly
 */
function PlaygroundWalletSection (): JSX.Element | null {
  const { wallets } = useWalletPersistenceContext()

  if (wallets.length === 0) {
    return null
  }

  return (
    <WalletProvider data={wallets[0]}>
      <View style={tailwind('mt-4 mb-4')}>
        <PlaygroundUTXO />
      </View>

      <View style={tailwind('mt-4 mb-4')}>
        <PlaygroundToken />
      </View>
    </WalletProvider>
  )
}
