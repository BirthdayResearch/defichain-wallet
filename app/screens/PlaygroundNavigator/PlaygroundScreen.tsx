import React from 'react'
import { ScrollView } from 'react-native'
import { useNetworkContext } from '../../contexts/NetworkContext'
import { useThemeContext } from '../../contexts/ThemeProvider'
import { WalletContextProvider } from '../../contexts/WalletContext'
import { WalletNodeProvider } from '../../contexts/WalletNodeProvider'
import { useWalletPersistenceContext } from '../../contexts/WalletPersistenceContext'
import { isPlayground } from '../../environment'
import { tailwind } from '../../tailwind'
import { PlaygroundConnection } from './sections/PlaygroundConnection'
import { PlaygroundToken } from './sections/PlaygroundToken'
import { PlaygroundUTXO } from './sections/PlaygroundUTXO'
import { PlaygroundWallet } from './sections/PlaygroundWallet'

export function PlaygroundScreen (): JSX.Element {
  const { getThemeClass } = useThemeContext()
  return (
    <ScrollView style={tailwind('pb-16', getThemeClass('body-bg'))} contentInsetAdjustmentBehavior='always'>
      <PlaygroundConnection />
      <PlaygroundWallet />
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
  const { network } = useNetworkContext()

  if (wallets.length === 0 || !isPlayground(network)) {
    return null
  }

  return (
    <WalletNodeProvider data={wallets[0]}>
      <WalletContextProvider>
        <PlaygroundUTXO />
        <PlaygroundToken />
      </WalletContextProvider>
    </WalletNodeProvider>
  )
}
