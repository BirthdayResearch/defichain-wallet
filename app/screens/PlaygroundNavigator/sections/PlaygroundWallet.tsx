import { generateMnemonicWords } from '@defichain/jellyfish-wallet-mnemonic'
import * as Random from 'expo-random'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MnemonicUnprotected } from '../../../api/wallet'
import { Text, View } from '../../../components'
import { useNetworkContext } from '../../../contexts/NetworkContext'
import { useWalletPersistenceContext } from '../../../contexts/WalletPersistenceContext'
import { useWhaleApiClient } from '../../../contexts/WhaleContext'
import { fetchTokens } from '../../../hooks/wallet/TokensAPI'
import { RootState } from '../../../store'
import { tailwind } from '../../../tailwind'
import { PlaygroundAction } from '../components/PlaygroundAction'
import { PlaygroundStatus } from '../components/PlaygroundStatus'

export function PlaygroundWallet (): JSX.Element | null {
  const { wallets, clearWallets, setWallet } = useWalletPersistenceContext()
  const network = useNetworkContext()
  const whaleApiClient = useWhaleApiClient()
  const dispatch = useDispatch()
  const address = useSelector((state: RootState) => state.wallet.address)

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
        title='Setup wallet with a randomly generated mnemonic seed'
        onPress={async () => {
          const words = generateMnemonicWords(24, (numOfBytes: number) => {
            const bytes = Random.getRandomBytes(numOfBytes)
            return Buffer.from(bytes)
          })

          await setWallet(MnemonicUnprotected.toData(words, network.network))
        }}
      />

      <PlaygroundAction
        testID='playground_wallet_fetch_balances'
        title='Fetch Balances'
        onPress={() => fetchTokens(whaleApiClient, address, dispatch)}
      />
    </View>
  )
}
