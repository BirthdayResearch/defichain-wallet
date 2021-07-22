import { generateMnemonic } from '@defichain/jellyfish-wallet-mnemonic'
import * as Random from 'expo-random'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Mnemonic } from '../../../api/wallet/mnemonic'
import { Text, View } from '../../../components'
import { useWalletManagementContext } from '../../../contexts/WalletManagementContext'
import { useWhaleApiClient } from '../../../contexts/WhaleContext'
import { fetchTokens } from '../../../hooks/wallet/TokensAPI'
import { RootState } from '../../../store'
import { tailwind } from '../../../tailwind'
import { PlaygroundAction } from '../components/PlaygroundAction'
import { PlaygroundStatus } from '../components/PlaygroundStatus'

export function PlaygroundWallet (): JSX.Element | null {
  const { wallets, clearWallets, setWallet } = useWalletManagementContext()
  const whaleApiClient = useWhaleApiClient()
  const dispatch = useDispatch()
  const address = useSelector((state: RootState) => state.wallet.address)

  return (
    <View>
      <View style={tailwind('flex-row flex items-center')}>
        <Text fontWeight='bold' style={tailwind('text-xl')}>Wallet</Text>
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
        onPress={async () => await setWallet(Mnemonic.createWalletDataAbandon23())}
      />

      <PlaygroundAction
        testID='playground_wallet_random'
        title='Setup wallet with a randomly generated mnemonic seed'
        onPress={async () => {
          const words = generateMnemonic(24, numOfBytes => {
            const bytes = Random.getRandomBytes(numOfBytes)
            return Buffer.from(bytes)
          })

          await setWallet(Mnemonic.createWalletData(words))
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
