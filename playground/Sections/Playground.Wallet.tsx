import React from 'react'
import { Text, View } from 'react-native'
import tailwind from 'tailwind-rn'
import { PlaygroundAction } from '../Playground.Action'
import { PlaygroundStatus } from '../Playground.Status'
import { WalletStatus } from '../../store/wallet'
import { useWalletAPI } from '../../hooks/wallet/WalletAPI'
import { useDispatch } from 'react-redux'

export function PlaygroundWallet (): JSX.Element {
  const WalletAPI = useWalletAPI()
  const status = WalletAPI.getStatus()
  const dispatch = useDispatch()

  return (
    <View>
      <View style={tailwind('flex-row flex items-center')}>
        <Text style={tailwind('text-lg font-bold')}>Wallet</Text>
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
          WalletAPI.setMnemonic(dispatch, [
            'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'art'
          ])
        }}
      />

      <View style={tailwind('border-b border-gray-100')} />

      <PlaygroundAction
        testID='playground_wallet_random'
        title='Setup wallet with a randomly generated mnemonic seed'
        onPress={() => WalletAPI.randomMnemonic(dispatch)}
      />

      <View style={tailwind('border-b border-gray-100')} />

      <PlaygroundAction
        testID='playground_wallet_top_up'
        title='Top up current wallet with 50 DFI UTXO'
        onPress={() => {
        }}
      />
    </View>
  )
}
