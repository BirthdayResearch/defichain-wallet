import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import tailwind from 'tailwind-rn'
import { Text, View } from '../../../components'
import { fetchTokens } from '../../../hooks/wallet/TokensAPI'
import { useWalletAPI } from '../../../hooks/wallet/WalletAPI'
import { RootState } from '../../../store'
import { WalletStatus } from '../../../store/wallet'
import { PlaygroundAction } from '../components/PlaygroundAction'
import { PlaygroundStatus } from '../components/PlaygroundStatus'

export function PlaygroundWallet (): JSX.Element | null {
  const WalletAPI = useWalletAPI()
  const status = WalletAPI.getStatus()
  const dispatch = useDispatch()
  const address = useSelector((state: RootState) => state.wallet.address)

  return (
    <View>
      <View style={tailwind('flex-row flex items-center')}>
        <Text style={tailwind('text-xl font-bold')}>Wallet</Text>
        <View style={tailwind('ml-2')}>
          <PlaygroundStatus
            online={status === WalletStatus.LOADED_WALLET}
            loading={status === WalletStatus.LOADING}
            offline={status === WalletStatus.NO_WALLET}
            error={status === WalletStatus.ERROR}
          />
        </View>
      </View>

      <PlaygroundAction
        testID='playground_wallet_clear'
        title='Clear stored mnemonic seed'
        onPress={() => WalletAPI.clearWallet(dispatch)}
      />

      <PlaygroundAction
        testID='playground_wallet_abandon'
        title='Setup wallet with abandon x23 + art as mnemonic seed'
        onPress={() => {
          WalletAPI.setMnemonicAbandon23(dispatch)
        }}
      />

      <PlaygroundAction
        testID='playground_wallet_random'
        title='Setup wallet with a randomly generated mnemonic seed'
        onPress={() => WalletAPI.randomMnemonic(dispatch)}
      />

      <PlaygroundAction
        testID='playground_wallet_fetch_balances'
        title='Fetch Balances'
        onPress={() => fetchTokens(address, dispatch)}
      />
    </View>
  )
}
