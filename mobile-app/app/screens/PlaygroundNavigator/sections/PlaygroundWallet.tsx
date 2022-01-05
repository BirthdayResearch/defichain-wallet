
import { MnemonicEncrypted, MnemonicUnprotected } from '../../../api/wallet'
import { MnemonicStorage } from '@api/wallet/mnemonic_storage'
import { View } from '@components/index'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWalletPersistenceContext } from '@shared-contexts/WalletPersistenceContext'
import { PlaygroundAction } from '../components/PlaygroundAction'
import { PlaygroundTitle } from '../components/PlaygroundTitle'

export function PlaygroundWallet (): JSX.Element | null {
  const {
    wallets,
    clearWallets,
    setWallet
  } = useWalletPersistenceContext()
  const {
    network,
    updateNetwork
  } = useNetworkContext()

  return (
    <View>
      <PlaygroundTitle
        status={{ online: wallets.length > 0, offline: wallets.length === 0 }}
        title='Wallet'
      />

      <PlaygroundAction
        onPress={clearWallets}
        testID='playground_wallet_clear'
        title='Clear stored mnemonic seed'
      />

      <PlaygroundAction
        onPress={async () => {
          await updateNetwork(network)
          const data = await MnemonicUnprotected.toData([
            'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'art'
          ], network)
          await setWallet(data)
        }}
        testID='playground_wallet_abandon'
        title='Setup an unprotected wallet with abandon x23 + art as the 24 word'
      />

      <PlaygroundAction
        onPress={async () => {
          await updateNetwork(network)
          const data = await MnemonicEncrypted.toData([
            'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'art'
          ], network, '000000')
          await setWallet(data)
        }}
        testID='playground_wallet_abandon_encrypted'
        title='Setup an encrypted wallet with abandon x23 + art as the 24 word with 000000 passcode'
      />

      <PlaygroundAction
        onPress={async () => {
          await updateNetwork(network)
          const words = MnemonicUnprotected.generateWords()
          const encrypted = await MnemonicEncrypted.toData(words, network, '000000')
          await setWallet(encrypted)
          await MnemonicStorage.set(words, '000000')
        }}
        testID='playground_wallet_random'
        title='Setup an encrypted wallet with a random seed using 000000 passcode'
      />
    </View>
  )
}
