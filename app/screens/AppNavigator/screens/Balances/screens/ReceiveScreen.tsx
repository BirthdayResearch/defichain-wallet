import * as Clipboard from 'expo-clipboard'
import React, { useState } from 'react'
import { Share, TouchableOpacity, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { Logging } from '../../../../../api'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '../../../../../components/themed'
import { useThemeContext } from '../../../../../contexts/ThemeProvider'
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
  const { isLight } = useThemeContext()
  const { address } = useWalletContext()
  const [isCopied, setIsCopied] = useState<boolean>(false)

  const copyToClipboard = (text: string): void => {
    Clipboard.setString(text)
  }

  return (
    <ThemedView
      testID='receive_screen'
      style={tailwind('flex flex-1 w-full relative')}
    >
      <ThemedText
        style={tailwind('p-4 font-medium')}
      >{translate('screens/ReceiveScreen', 'Use this address to receive DFI or any DST')}
      </ThemedText>
      <ThemedView
        style={tailwind('flex justify-center items-center p-5')} light={tailwind('bg-white')}
        dark={tailwind('bg-gray-800')}
      >
        <View testID='qr_code_container' style={tailwind('mb-5')}>
          <QRCode
            color={isLight ? 'black' : 'white'}
            backgroundColor={isLight ? 'white' : 'black'}
            value={address}
            size={200}
          />
        </View>
        <ThemedText
          selectable
          testID='address_text' light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-100')}
          style={tailwind('font-medium text-center')}
          numberOfLines={2}
        >{address}
        </ThemedText>
      </ThemedView>
      <ThemedView style={tailwind('flex flex-col p-4')} light={tailwind('bg-white')} dark={tailwind('bg-gray-900')}>
        {
          isCopied
            ? (
              <ThemedView
                style={tailwind('flex flex-grow flex-row justify-center text-center items-center border border-white border-opacity-0 p-3')}
              >
                <ThemedIcon
                  iconType='MaterialIcons' name='check' size={20} style={tailwind('self-center')}
                  light={tailwind('text-success-500')} dark={tailwind('text-darksuccess-500')}
                />
                <ThemedText
                  light={tailwind('text-success-500')} dark={tailwind('text-darksuccess-500')}
                  style={tailwind('ml-1 uppercase font-medium')}
                >{translate('screens/ReceiveScreen', 'Copied to Clipboard')}
                </ThemedText>
              </ThemedView>
              )
            : (
              <ThemedTouchableOpacity
                light={tailwind('border-gray-200')}
                dark={tailwind('border-gray-500')}
                testID='copy_button'
                style={tailwind('flex flex-grow flex-row justify-center text-center items-center p-3 border')}
                onPress={() => {
                  setIsCopied(true)
                  copyToClipboard(address)
                  setTimeout(() => {
                    setIsCopied(false)
                  }, 1500)
                }}
              >
                <ThemedIcon
                  iconType='MaterialIcons'
                  light={tailwind('text-primary-500')} dark={tailwind('text-darkprimary-500')}
                  style={tailwind('self-center')} name='content-copy' size={18}
                />
                <ThemedText
                  style={tailwind('ml-2 uppercase font-medium')}
                  light={tailwind('text-primary-500')} dark={tailwind('text-darkprimary-500')}
                >{translate('screens/ReceiveScreen', 'COPY TO CLIPBOARD')}
                </ThemedText>
              </ThemedTouchableOpacity>
              )
        }
        <TouchableOpacity
          testID='share_button' style={tailwind('flex flex-row flex-grow justify-center items-center p-3 mt-2')}
          onPress={async () => {
            await onShare(address)
          }}
        >
          <ThemedIcon
            iconType='MaterialIcons'
            light={tailwind('text-primary-500')} dark={tailwind('text-darkprimary-500')}
            style={tailwind('self-center')} name='share' size={18}
          />
          <ThemedText
            light={tailwind('text-primary-500')} dark={tailwind('text-darkprimary-500')}
            style={tailwind('ml-2 uppercase font-medium')}
          >{translate('screens/ReceiveScreen', 'SHARE')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  )
}
