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
      style={tailwind('flex flex-1 w-full relative')}
      testID='receive_screen'
    >
      <ThemedText
        style={tailwind('p-4 font-medium')}
      >
        {translate('screens/ReceiveScreen', 'Use this address to receive DFI or any DST')}
      </ThemedText>

      <ThemedView
        dark={tailwind('bg-gray-800')}
        light={tailwind('bg-white')}
        style={tailwind('flex justify-center items-center p-5')}
      >
        <View
          style={tailwind('mb-5')}
          testID='qr_code_container'
        >
          <QRCode
            backgroundColor={isLight ? 'white' : 'black'}
            color={isLight ? 'black' : 'white'}
            size={200}
            value={address}
          />
        </View>

        <ThemedText
          dark={tailwind('text-gray-100')}
          light={tailwind('text-gray-500')}
          numberOfLines={2}
          selectable
          style={tailwind('font-medium text-center')}
          testID='address_text'
        >
          {address}
        </ThemedText>
      </ThemedView>

      <ThemedView
        dark={tailwind('bg-gray-900')}
        light={tailwind('bg-white')}
        style={tailwind('flex flex-col p-4')}
      >
        {
          isCopied
            ? (
              <ThemedView
                style={tailwind('flex flex-grow flex-row justify-center text-center items-center border border-white border-opacity-0 p-3')}
              >
                <ThemedIcon
                  dark={tailwind('text-darksuccess-500')}
                  iconType='MaterialIcons'
                  light={tailwind('text-success-500')}
                  name='check'
                  size={20}
                  style={tailwind('self-center')}
                />

                <ThemedText
                  dark={tailwind('text-darksuccess-500')}
                  light={tailwind('text-success-500')}
                  style={tailwind('ml-1 uppercase font-medium')}
                >
                  {translate('screens/ReceiveScreen', 'Copied to Clipboard')}
                </ThemedText>
              </ThemedView>
              )
            : (
              <ThemedTouchableOpacity
                dark={tailwind('border-gray-500')}
                light={tailwind('border-gray-200')}
                onPress={() => {
                  setIsCopied(true)
                  copyToClipboard(address)
                  setTimeout(() => {
                    setIsCopied(false)
                  }, 1500)
                }}
                style={tailwind('flex flex-grow flex-row justify-center text-center items-center p-3 border')}
                testID='copy_button'
              >
                <ThemedIcon
                  dark={tailwind('text-darkprimary-500')}
                  iconType='MaterialIcons'
                  light={tailwind('text-primary-500')}
                  name='content-copy'
                  size={18}
                  style={tailwind('self-center')}
                />

                <ThemedText
                  dark={tailwind('text-darkprimary-500')}
                  light={tailwind('text-primary-500')}
                  style={tailwind('ml-2 uppercase font-medium')}
                >
                  {translate('screens/ReceiveScreen', 'COPY TO CLIPBOARD')}
                </ThemedText>
              </ThemedTouchableOpacity>
              )
        }

        <TouchableOpacity
          onPress={async () => {
            await onShare(address)
          }}
          style={tailwind('flex flex-row flex-grow justify-center items-center p-3 mt-2')}
          testID='share_button'
        >
          <ThemedIcon
            dark={tailwind('text-darkprimary-500')}
            iconType='MaterialIcons'
            light={tailwind('text-primary-500')}
            name='share'
            size={18}
            style={tailwind('self-center')}
          />

          <ThemedText
            dark={tailwind('text-darkprimary-500')}
            light={tailwind('text-primary-500')}
            style={tailwind('ml-2 uppercase font-medium')}
          >
            {translate('screens/ReceiveScreen', 'SHARE')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  )
}
