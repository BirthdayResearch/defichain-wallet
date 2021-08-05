import { generateMnemonicWords } from '@defichain/jellyfish-wallet-mnemonic'
import * as Random from 'expo-random'
import React from 'react'
import { MnemonicEncrypted, MnemonicUnprotected } from '../../../api/wallet'
import { Text, View } from '../../../components'
import { useNetworkContext } from '../../../contexts/NetworkContext'
import { useWalletPersistenceContext } from '../../../contexts/WalletPersistenceContext'
import { tailwind } from '../../../tailwind'
import { PlaygroundAction } from '../components/PlaygroundAction'
import { PlaygroundStatus } from '../components/PlaygroundStatus'

export function PlaygroundWallet (): JSX.Element | null {
  const { wallets, clearWallets, setWallet } = useWalletPersistenceContext()
  const { network } = useNetworkContext()

  return (
    <View>
      <View style={tailwind('flex-row flex items-center')}>
        <Text style={tailwind('text-xl font-bold')}>Wallet</Text>
        <View style={tailwind('ml-2')}>
          <PlaygroundStatus
            online={wallets.length > 0}
            offline={wallets.length === 0}
          />
        </View>
      </View>

      <PlaygroundAction
        testID='playground_wallet_clear'
        title='Clear stored mnemonic seed'
        onPress={clearWallets}
      />

      <PlaygroundAction
        testID='playground_wallet_abandon'
        title='Setup wallet with abandon x23 + art as mnemonic seed'
        onPress={async () => await setWallet(MnemonicUnprotected.Abandon23Playground)}
      />

      <PlaygroundAction
        testID='playground_wallet_random'
        title='Setup an encrypted wallet with a random seed using 000000 passcode'
        onPress={async () => {
          const words = generateMnemonicWords(24, (numOfBytes: number) => {
            const bytes = Random.getRandomBytes(numOfBytes)
            return Buffer.from(bytes)
          })
          const encrypted = await MnemonicEncrypted.toData(words, network, '000000')
          await setWallet(encrypted)
        }}
      />
    </View>
  )
}
