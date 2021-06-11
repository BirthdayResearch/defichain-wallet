import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'
import tailwind from 'tailwind-rn'
import { useWalletAPI } from '../../../hooks/wallet/WalletAPI'
import { translate } from '../../../translations'

export function WalletOnboarding (): JSX.Element {
  const WalletAPI = useWalletAPI()
  const dispatch = useDispatch()

  function onDebugPress (): void {
    // TODO(fuxingloh): this should only be available in debug mode
    WalletAPI.setMnemonicAbandon23(dispatch)
  }

  return (
    <ScrollView style={tailwind('flex-1 py-8 bg-gray-100')} testID='wallet_onboarding'>
      <View style={tailwind('flex items-center')}>
        <TouchableOpacity delayLongPress={5000} onLongPress={onDebugPress}>
          <View style={tailwind('flex bg-white justify-center items-center rounded-full h-16 w-16')}>
            <Ionicons size={24} name='wallet' color='#999' />
          </View>
        </TouchableOpacity>

        <Text style={tailwind('font-bold mt-4 text-gray-600')}>
          {translate('screens/WalletOnboarding', 'No wallets')}
        </Text>
      </View>

      <View style={tailwind('mt-8')} />
    </ScrollView>
  )
}
