import { Text, View } from '../../../components/Themed'
import tailwind from 'tailwind-rn'
import { translate } from '../../../translations'
import * as React from 'react'
import { PlaygroundAction } from '../../../playground/Playground.Action'
import { useWalletAPI } from '../../../hooks/wallet/WalletAPI'
import { useDispatch } from 'react-redux'

export function WalletSetupScreen (): JSX.Element {
  const WalletAPI = useWalletAPI()
  const dispatch = useDispatch()
  return (
    <View style={tailwind('flex-1 items-center justify-center')}>
      <Text style={tailwind('text-xl font-bold')} testID='wallet_setup'>
        {translate('screens/WalletSetupScreen', 'Wallet Setup')}
      </Text>
      {/* Temporary Button to create wallet on native app */}
      <PlaygroundAction
        testID='playground_wallet_random'
        title='Create Wallet'
        onPress={() => WalletAPI.randomMnemonic(dispatch)}
      />
    </View>
  )
}
