import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import * as React from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { useDispatch } from 'react-redux'
import tailwind from 'tailwind-rn'
import { Text, View } from '../../../components'
import { PrimaryColor } from '../../../constants/Theme'
import { useWalletAPI } from '../../../hooks/wallet/WalletAPI'
import { translate } from '../../../translations'

export function WalletOnboarding (): JSX.Element {
  const WalletAPI = useWalletAPI()
  const dispatch = useDispatch()
  const navigator = useNavigation()

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

        <Text style={tailwind('font-bold text-lg mt-4 text-gray-600')}>
          {translate('screens/WalletOnboarding', 'No wallets')}
        </Text>
      </View>

      <View style={tailwind('mt-8')}>
        <WalletOptionRow
          onPress={() => navigator.navigate('WalletMnemonicCreate')}
          text='Create new mnemonic wallet' icon='time'
        />
        <View style={tailwind('h-px bg-gray-100')} />
        <WalletOptionRow
          onPress={() => navigator.navigate('WalletMnemonicRestore')}
          text='Restore mnemonic wallet' icon='document-text'
        />
      </View>
    </ScrollView>
  )
}

function WalletOptionRow (props: { text: string, icon: string, onPress: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={tailwind('flex-row items-center justify-between px-4 bg-white')}
    >
      <View style={tailwind('flex-row items-center')}>
        <Ionicons name={props.icon as any} size={20} color={PrimaryColor} />
        <Text style={tailwind('font-medium ml-3 py-4')}>
          {props.text}
        </Text>
      </View>
      <View>
        <Ionicons name='chevron-forward' size={24} />
      </View>
    </TouchableOpacity>
  )
}
