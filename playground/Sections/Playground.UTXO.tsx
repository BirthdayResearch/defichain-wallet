import { Text, View } from 'react-native'
import tailwind from 'tailwind-rn'
import React from 'react'
import { usePlaygroundRpcClient } from '../../hooks/api/usePlaygroundClient'
import { PlaygroundAction } from '../Playground.Action'
import { PlaygroundStatus } from '../Playground.Status'
import { useWalletAPI } from '../../hooks/wallet/WalletAPI'
import { WalletStatus } from '../../store/wallet'

export function PlaygroundUTXO (): JSX.Element | null {
  const WalletAPI = useWalletAPI()
  const rpcClient = usePlaygroundRpcClient()
  const status = WalletAPI.getStatus()

  if (WalletAPI.getStatus() !== WalletStatus.LOADING) {
    return null
  }

  return (
    <View>
      <View style={tailwind('flex-row flex items-center')}>
        <Text style={tailwind('text-lg font-bold')}>UTXO</Text>
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
        testID='playground_wallet_top_up'
        title='Top up 50 DFI UTXO to Wallet'
        onPress={async () => {
          const address = await WalletAPI.getWallet().get(0).getAddress()
          await rpcClient.wallet.sendToAddress(address, 50)
        }}
      />
    </View>
  )
}
