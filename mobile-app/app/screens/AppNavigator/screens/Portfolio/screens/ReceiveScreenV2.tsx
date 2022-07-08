import * as Clipboard from 'expo-clipboard'
import { useCallback, useEffect, useState } from 'react'
import { Share, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { ThemedIcon, ThemedScrollView, ThemedTextV2, ThemedViewV2 } from '@components/themed'
import { useToast } from 'react-native-toast-notifications'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { debounce } from 'lodash'
import { TouchableOpacity } from 'react-native-gesture-handler'

export async function onShare (address: string, logger: NativeLoggingProps): Promise<void> {
  try {
    await Share.share({
      message: address
    })
  } catch (error) {
    logger.error(error)
  }
}

export function ReceiveScreenV2 (): JSX.Element {
  const logger = useLogger()
  const { isLight } = useThemeContext()
  const { address } = useWalletContext()
  const [showToast, setShowToast] = useState(false)
  const toast = useToast()
  const TOAST_DURATION = 2000

  const copyToClipboard = useCallback(debounce(() => {
    if (showToast) {
      return
    }
    setShowToast(true)
    setTimeout(() => setShowToast(false), TOAST_DURATION)
  }, 500), [showToast])

  useEffect(() => {
    if (showToast) {
      toast.show(translate('components/toaster', 'Copied'), {
        type: 'wallet_toast',
        placement: 'top',
        duration: TOAST_DURATION
      })
    } else {
      toast.hideAll()
    }
  }, [showToast, address])

  return (
    <ThemedScrollView
      style={tailwind('px-8 pt-2 flex flex-1 w-full relative')}
      testID='receive_screen'
    >
      <ThemedTextV2
        style={tailwind('p-3 font-normal-v2 text-center')}
      >
        {translate('screens/ReceiveScreen', 'Use QR or Wallet Address to receive any DST or DFI')}
      </ThemedTextV2>

      <View
        style={tailwind('m-2 items-center')}
        testID='qr_code_container'
      >
        <View style={tailwind('bg-white p-4 rounded-md')}>
          <QRCode
            backgroundColor={isLight ? 'white' : 'black'}
            color={isLight ? 'black' : 'white'}
            size={200}
            value={address}
          />
        </View>
      </View>

      <ThemedTextV2
        numberOfLines={2}
        selectable
        style={tailwind('text-xs text-center p-2 pt-4')}
        testID='wallet_address'
      >
        {translate('screens/ReceiveScreen', 'WALLET ADDRESS')}
      </ThemedTextV2>

      <View style={tailwind('mx-7 mb-4')}>
        <ThemedTextV2
          numberOfLines={2}
          selectable
          style={tailwind('font-normal-v2 text-sm text-center pb-4')}
          testID='address_text'
        >
          {address}
        </ThemedTextV2>
      </View>

      <TouchableOpacity
        onPress={() => {
          copyToClipboard()
          Clipboard.setString(address)
        }}
        testID='copy_button'
      >
        <ThemedViewV2
          dark={tailwind('bg-mono-dark-v2-00')}
          light={tailwind('bg-mono-light-v2-00')}
          style={tailwind('rounded-t-md')}
        >
          <ThemedViewV2
            dark={tailwind('border-mono-dark-v2-300')}
            light={tailwind('border-mono-light-v2-300')}
            style={tailwind('py-4 mx-5 flex-row justify-center border-b')}
          >
            <ThemedTextV2
              dark={tailwind('text-mono-dark-v2-700')}
              light={tailwind('text-mono-light-v2-700')}
              style={tailwind('flex-grow text-sm font-normal-v2')}
            >
              Copy
            </ThemedTextV2>
            <ThemedIcon
              dark={tailwind('text-mono-dark-v2-700')}
              light={tailwind('text-mono-light-v2-700')}
              iconType='MaterialIcons'
              name='content-copy'
              size={18}
            />
          </ThemedViewV2>
        </ThemedViewV2>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={async () => {
          await onShare(address, logger)
        }}
        testID='share_button'
      >
        <ThemedViewV2
          dark={tailwind('bg-mono-dark-v2-00')}
          light={tailwind('bg-mono-light-v2-00')}
          style={tailwind('rounded-b-md')}
        >
          <ThemedViewV2
            dark={tailwind('border-mono-dark-v2-300')}
            light={tailwind('border-mono-light-v2-300')}
            style={tailwind('py-4 mx-5 flex-row justify-center')}
          >
            <ThemedTextV2
              dark={tailwind('text-mono-dark-v2-700')}
              light={tailwind('text-mono-light-v2-700')}
              style={tailwind('flex-grow text-sm font-normal-v2')}
            >
              Share
            </ThemedTextV2>
            <ThemedIcon
              dark={tailwind('text-mono-dark-v2-700')}
              light={tailwind('text-mono-light-v2-700')}
              iconType='MaterialIcons'
              name='share'
              size={18}
            />
          </ThemedViewV2>
        </ThemedViewV2>
      </TouchableOpacity>
    </ThemedScrollView>
  )
}
