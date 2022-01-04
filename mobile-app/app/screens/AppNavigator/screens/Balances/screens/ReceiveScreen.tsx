import * as Clipboard from 'expo-clipboard'
import { useState } from 'react'
import { Share, TouchableOpacity, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedView } from '@components/themed'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'

export async function onShare (address: string, logger: NativeLoggingProps): Promise<void> {
  try {
    await Share.share({
      message: address
    })
  } catch (error) {
    logger.error(error)
  }
}

export function ReceiveScreen (): JSX.Element {
  const logger = useLogger()
  const { isLight } = useThemeContext()
  const { address } = useWalletContext()
  const [isCopied, setIsCopied] = useState<boolean>(false)

  const copyToClipboard = (text: string): void => {
    Clipboard.setString(text)
  }

  return (
    <ThemedScrollView
      style={tailwind('px-8 pt-2 flex flex-1 w-full relative')}
      testID='receive_screen'
    >
      <ThemedText
        style={tailwind('p-4 font-medium text-center')}
      >
        {translate('screens/ReceiveScreen', 'Use QR or Wallet Address to receive any DST or DFI')}
      </ThemedText>

      <ThemedView
        dark={tailwind('bg-gray-800')}
        light={tailwind('bg-white')}
        style={tailwind('flex justify-center items-center p-5 rounded-lg')}
      >
        <View
          style={tailwind('mb-4')}
          testID='qr_code_container'
        >
          <QRCode
            backgroundColor={isLight ? 'white' : 'black'}
            color={isLight ? 'black' : 'white'}
            size={260}
            value={address}
          />
        </View>

        <ThemedText
          dark={tailwind('text-gray-100')}
          light={tailwind('text-gray-900')}
          numberOfLines={2}
          selectable
          style={tailwind('font-semibold text-lg text-center')}
          testID='address_text'
        >
          {address}
        </ThemedText>
        <ThemedText
          dark={tailwind('text-gray-400')}
          light={tailwind('text-gray-500')}
          numberOfLines={2}
          selectable
          style={tailwind('font-medium my-2 text-center text-xs')}
          testID='wallet_address'
        >
          {translate('screens/ReceiveScreen', 'WALLET ADDRESS')}
        </ThemedText>
      </ThemedView>

      <ThemedView
        style={tailwind('flex flex-row mt-6 mb-8')}
      >
        {
          isCopied
            ? (
              <ThemedView
                style={tailwind('flex flex-1 flex-row justify-center text-center items-center')}
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
                  {translate('screens/ReceiveScreen', 'COPIED')}
                </ThemedText>
              </ThemedView>
              )
            : (
              <TouchableOpacity
                onPress={() => {
                  setIsCopied(true)
                  copyToClipboard(address)
                  setTimeout(() => {
                    setIsCopied(false)
                  }, 1500)
                }}
                style={tailwind('flex flex-1 flex-row justify-center text-center items-center')}
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
                  {translate('screens/ReceiveScreen', 'COPY')}
                </ThemedText>
              </TouchableOpacity>
              )
        }

        <TouchableOpacity
          onPress={async () => {
            await onShare(address, logger)
          }}
          style={tailwind('flex flex-1 flex-row justify-center text-center items-center')}
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
    </ThemedScrollView>
  )
}
