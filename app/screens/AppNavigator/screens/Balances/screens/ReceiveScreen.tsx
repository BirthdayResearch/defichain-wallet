import { MaterialIcons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import React, { useState } from 'react'
import { Share, TouchableOpacity, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { Logging } from '../../../../../api'
import { Text } from '../../../../../components'
import { useWalletContext } from '../../../../../contexts/WalletContext'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'

export async function onShare (address: string): Promise<void> {
  try {
    await Share.share({
      message: address
    })
  } catch (error) {
    Logging.error(error.message)
  }
}

export function ReceiveScreen (): JSX.Element {
  const { address } = useWalletContext()
  const [isCopied, setIsCopied] = useState<boolean>(false)

  const copyToClipboard = (text: string): void => {
    Clipboard.setString(text)
  }

  return (
    <View
      testID='receive_screen'
      style={tailwind('flex flex-1 w-full relative')}
    >
      <Text
        style={tailwind('p-4 font-medium')}
      >{translate('screens/ReceiveScreen', 'Use this address to receive DFI or any DST')}
      </Text>
      <View style={tailwind('bg-white flex justify-center items-center p-5')}>
        <View testID='qr_code_container' style={tailwind('mb-5')}>
          <QRCode
            value={address}
            size={200}
          />
        </View>
        <Text
          selectable
          testID='address_text'
          style={tailwind('text-gray-500 font-medium text-center')}
          numberOfLines={2}
        >{address}
        </Text>
      </View>
      <View style={tailwind('bg-white flex flex-col p-4')}>
        {
          isCopied
            ? (
              <View
                style={tailwind('flex flex-grow flex-row justify-center text-center items-center border border-white border-opacity-0 p-3')}
              >
                <MaterialIcons name='check' size={20} style={tailwind('self-center text-success')} />
                <Text
                  style={tailwind('ml-1 uppercase font-medium text-success')}
                >{translate('screens/ReceiveScreen', 'Copied to Clipboard')}
                </Text>
              </View>
            )
            : (
              <TouchableOpacity
                testID='copy_button'
                style={tailwind('flex flex-grow flex-row justify-center text-center items-center p-3 border border-gray-200')}
                onPress={() => {
                  setIsCopied(true)
                  copyToClipboard(address)
                  setTimeout(() => {
                    setIsCopied(false)
                  }, 1500)
                }}
              >
                <MaterialIcons
                  style={tailwind('self-center text-primary')} name='content-copy' size={18}
                />
                <Text
                  style={tailwind('ml-2 uppercase font-medium text-primary')}
                >{translate('screens/ReceiveScreen', 'COPY TO CLIPBOARD')}
                </Text>
              </TouchableOpacity>
            )
        }
        <TouchableOpacity
          testID='share_button' style={tailwind('flex flex-row flex-grow justify-center items-center p-3 mt-2')}
          onPress={async () => {
            await onShare(address)
          }}
        >
          <MaterialIcons
            style={tailwind('self-center text-primary')} name='share' size={18}
          />
          <Text
            style={tailwind('ml-2 uppercase font-medium text-primary')}
          >{translate('screens/ReceiveScreen', 'SHARE')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
