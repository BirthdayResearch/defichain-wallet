import React, { useMemo } from 'react'
import { ScrollView } from 'react-native'
import { Provider as StoreProvider } from 'react-redux'
import { Text, View } from '../../components'
import { WalletProvider } from '../../contexts/WalletContext'
import { useWalletPersistenceContext } from '../../contexts/WalletPersistenceContext'
import { createStore } from '../../store'
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

function PlaygroundWalletSection (): JSX.Element | null {
  const { wallets } = useWalletPersistenceContext()
  const store = useMemo(() => createStore(), [wallets[0]])

  if (wallets.length === 0) {
    return null
  }

  return (
    <WalletProvider data={wallets[0]}>
      <StoreProvider store={store}>
        <View style={tailwind('mt-4 mb-4')}>
          <PlaygroundUTXO />
        </View>

        <View style={tailwind('mt-4 mb-4')}>
          <PlaygroundToken />
        </View>
      </StoreProvider>
    </WalletProvider>
  )
}
