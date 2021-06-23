import { MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'
import tailwind from 'tailwind-rn'
import { PrimaryColor, PrimaryColorStyle } from '../../../../../constants/Theme'
import { RootState } from '../../../../../store'
import { translate } from '../../../../../translations'
import QRCode from 'react-native-qrcode-svg'
import Clipboard from 'expo-clipboard'

export function ReceiveScreen (): JSX.Element {
  const address = useSelector((state: RootState) => state.wallet.address)

  const copyToClipboard = (text: string): void => {
    Clipboard.setString(text)
  }

  return (
    <View style={tailwind('flex flex-1 w-full relative')}>
      <Text
        style={tailwind('p-4 font-medium')}
      >{translate('screens/ReceiveScreen', 'Use this address to receive DFI or any DST')}
      </Text>
      <View style={tailwind('bg-white flex justify-center items-center p-5 border-b border-gray-200')}>
        <View testID='qr_code_container' style={tailwind('mb-5')}>
          <QRCode
            value={address}
            size={200}
          />
        </View>
        <Text
          testID='address_text'
          style={tailwind('text-gray-500 font-medium')}
        >{address}
        </Text>
      </View>
      <TouchableOpacity
        testID='copy_button' style={tailwind('bg-white flex flex-row justify-center items-center p-3')}
        onPress={() => {
          copyToClipboard(address)
        }}
      >
        <MaterialCommunityIcons
          style={tailwind('self-center')} name='content-copy' size={16}
          color={PrimaryColor}
        />
        <Text
          style={[PrimaryColorStyle.text, tailwind('ml-2 uppercase font-medium')]}
        >{translate('screens/ReceiveScreen', 'Copy')}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
