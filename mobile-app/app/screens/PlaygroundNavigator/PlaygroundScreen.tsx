
import { ThemedScrollView } from '@components/themed'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { WalletContextProvider } from '@shared-contexts/WalletContext'
import { WalletNodeProvider } from '@shared-contexts/WalletNodeProvider'
import { useWalletPersistenceContext } from '@shared-contexts/WalletPersistenceContext'
import { isPlayground } from '@environment'
import { tailwind } from '@tailwind'
import { PlaygroundConnection } from './sections/PlaygroundConnection'
import { PlaygroundToken } from './sections/PlaygroundToken'
import { PlaygroundUTXO } from './sections/PlaygroundUTXO'
import { PlaygroundWallet } from './sections/PlaygroundWallet'
import { WalletAddressIndexPersistence } from '@api/wallet/address_index'
import { PlaygroundOperations } from '@screens/PlaygroundNavigator/sections/PlaygroundOperations'

export function PlaygroundScreen (): JSX.Element {
  return (
    <ThemedScrollView
      contentInsetAdjustmentBehavior='always'
      style={tailwind('pb-16')}
    >
      <PlaygroundConnection />
      <PlaygroundWallet />
      <PlaygroundWalletSection />
    </ThemedScrollView>
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
      <WalletContextProvider api={WalletAddressIndexPersistence}>
        <PlaygroundOperations />
        <PlaygroundUTXO />

        <PlaygroundToken />
      </WalletContextProvider>
    </WalletNodeProvider>
  )
}
