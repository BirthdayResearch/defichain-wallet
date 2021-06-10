import * as React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import tailwind from 'tailwind-rn'
import { Ionicons } from '@expo/vector-icons'
import { translate } from '../../../translations'
import { PrimaryColorStyle } from '../../../constants/Colors'
import { useNavigation } from '@react-navigation/native'
import { useWalletAPI } from '../../../hooks/wallet/WalletAPI'
import { useDispatch } from 'react-redux'

export function WalletOnboardingScreen (): JSX.Element {
  const WalletAPI = useWalletAPI()
  const dispatch = useDispatch()
  const navigator = useNavigation()

  return (
    <View style={tailwind('flex-1 py-12 items-center justify-between bg-gray-100')}>
      <TouchableOpacity
        delayLongPress={5000} onLongPress={() => {
          WalletAPI.setMnemonicAbandon23(dispatch)
        }}
      >
        <View style={tailwind('flex items-center')}>
          <View style={tailwind('bg-white rounded-full p-4')}>
            <Ionicons size={24} name='wallet' color='#999' />
          </View>

          <Text style={tailwind('font-bold mt-4 text-gray-600')}>
            {translate('/setup', 'No wallets')}
          </Text>

        </View>
      </TouchableOpacity>

      <View style={tailwind('mt-24')}>
        <TouchableOpacity
          onPress={() => navigator.navigate('AddWallet')}
          style={[tailwind('px-4 py-3 rounded'), PrimaryColorStyle.bg]}
        >
          <Text style={tailwind('text-white font-bold')}>
            {translate('/setup', 'ADD WALLET')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
