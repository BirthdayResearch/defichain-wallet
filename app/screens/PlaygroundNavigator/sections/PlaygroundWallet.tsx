import { generateMnemonicWords } from '@defichain/jellyfish-wallet-mnemonic'
import { getRandomBytes } from 'expo-random'
import React from 'react'
import { MnemonicEncrypted, MnemonicUnprotected } from '../../../api/wallet'
import { MnemonicWords } from '../../../api/wallet/mnemonic_words'
import { View } from '../../../components'
import { useNetworkContext } from '../../../contexts/NetworkContext'
import { useWalletPersistenceContext } from '../../../contexts/WalletPersistenceContext'
import { PlaygroundAction } from '../components/PlaygroundAction'
import { PlaygroundTitle } from '../components/PlaygroundTitle'

export function PlaygroundWallet (): JSX.Element | null {
  const { wallets, clearWallets, setWallet } = useWalletPersistenceContext()
  const { network } = useNetworkContext()

  return (
    <View>
      <PlaygroundTitle title='Wallet' status={{ online: wallets.length > 0, offline: wallets.length === 0 }} />

      <PlaygroundAction
        testID='playground_wallet_clear'
        title='Clear stored mnemonic seed'
        onPress={clearWallets}
      />

      <PlaygroundAction
        testID='playground_wallet_abandon'
        title='Setup an unprotected wallet with abandon x23 + art as the 24 word'
        onPress={async () => {
          const data = await MnemonicUnprotected.toData([
            'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'art'
          ], network)
          await setWallet(data)
        }}
      />

      <PlaygroundAction
        testID='playground_wallet_abandon_encrypted'
        title='Setup an encrypted wallet with abandon x23 + art as the 24 word with 000000 passcode'
        onPress={async () => {
          const data = await MnemonicEncrypted.toData([
            'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'art'
          ], network, '000000')
          await setWallet(data)
        }}
      />

      <PlaygroundAction
        testID='playground_wallet_random'
        title='Setup an encrypted wallet with a random seed using 000000 passcode'
        onPress={async () => {
          const words = generateMnemonicWords(24, (numOfBytes: number) => {
            const bytes = getRandomBytes(numOfBytes)
            return Buffer.from(bytes)
          })
          const encrypted = await MnemonicEncrypted.toData(words, network, '000000')
          await setWallet(encrypted)
          await MnemonicWords.encrypt(words, '000000')
        }}
      />
    </View>
  )
}
