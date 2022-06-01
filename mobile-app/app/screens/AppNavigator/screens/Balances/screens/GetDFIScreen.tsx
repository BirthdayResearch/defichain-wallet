import * as Clipboard from 'expo-clipboard'
import { useCallback, useEffect, useState } from 'react'
import { ImageSourcePropType, Share, TouchableOpacity, View, Image } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { useToast } from 'react-native-toast-notifications'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { debounce } from 'lodash'
import { openURL } from '@api/linking'
import Kucoin from '@assets/images/exchanges/Kucoin.png'
import Bittrex from '@assets/images/exchanges/Bittrex.png'
import Bitrue from '@assets/images/exchanges/Bitrue.png'
import Latoken from '@assets/images/exchanges/Latoken.png'
import DFX from '@assets/images/exchanges/DFX.png'
import Transak from '@assets/images/exchanges/Transak.png'
import Hotbit from '@assets/images/exchanges/Hotbit.png'
import Hoo from '@assets/images/exchanges/Hoo.png'
import EasyCrypto from '@assets/images/exchanges/EasyCrypto.png'
import CakeDeFi from '@assets/images/exchanges/CakeDeFi.png'

interface ExchangeProps {
  image: ImageSourcePropType
  name: string
  url: string
}

const exchanges: ExchangeProps[] = [
  {
    name: 'Kucoin',
    image: Kucoin,
    url: 'https://www.kucoin.com/trade/DFI-BTC'
  }, {
    name: 'Bittrex',
    image: Bittrex,
    url: 'https://global.bittrex.com/Market/Index?MarketName=BTC-DFI'
  }, {
    name: 'Bitrue',
    image: Bitrue,
    url: 'https://www.bitrue.com/trade/dfi_btc'
  }, {
    name: 'Latoken',
    image: Latoken,
    url: 'https://latoken.com/exchange/DFI_BTC'
  }, {
    name: 'DFX',
    image: DFX,
    url: 'https://dfx.swiss/en/'
  }, {
    name: 'Transak',
    image: Transak,
    url: 'https://global.transak.com/'
  }, {
    name: 'Hotbit',
    image: Hotbit,
    url: 'https://www.hotbit.io/exchange?symbol=DFI_USDT'
  }, {
    name: 'Hoo',
    image: Hoo,
    url: 'https://hoo.com/innovation/dfi-usdt'
  }, {
    name: 'EasyCrypto (Australia)',
    image: EasyCrypto,
    url: 'https://easycrypto.com/au/buy-sell/dfi-defichain'
  }, {
    name: 'EasyCrypto (New Zealand)',
    image: EasyCrypto,
    url: 'https://easycrypto.com/nz/buy-sell/dfi-defichain'
  }, {
    name: 'Cake DeFi',
    image: CakeDeFi,
    url: 'https://cakedefi.com/'
  }

]
export async function onShare (address: string, logger: NativeLoggingProps): Promise<void> {
  try {
    await Share.share({
      message: address
    })
  } catch (error) {
    logger.error(error)
  }
}

export function GetDFIScreen (): JSX.Element {
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
      toast.show('Copied', {
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
      contentContainerStyle={tailwind('pb-8')}
      style={tailwind('flex p-4')}
      testID='get_dfi_screen'
    >
      <View>
        <ThemedText
          dark={tailwind('text-gray-50')}
          light={tailwind('text-gray-900')}
          style={tailwind('text-xs font-medium')}
        >
          {translate('screens/CompositeSwapScreen', 'STEP 1')}
        </ThemedText>
        <ThemedText
          dark={tailwind('text-gray-50')}
          light={tailwind('text-gray-900')}
          style={tailwind('text-xl font-semibold')}
        >
          {translate('screens/CompositeSwapScreen', 'Trade/Purchase $DFI')}
        </ThemedText>
        <ThemedText
          dark={tailwind('text-gray-50')}
          light={tailwind('text-gray-900')}
          style={tailwind('text-xl')}
        >
          {translate('screens/CompositeSwapScreen', 'Available on:')}
        </ThemedText>
        <ThemedView
          dark={tailwind('bg-gray-800')}
          light={tailwind('bg-white')}
          style={tailwind('mt-5')}
        >
          {exchanges.map(({ name, image, url }) => <ExchangeItemRow image={image} name={name} url={url} key={name} />)}
        </ThemedView>
        <ThemedText
          dark={tailwind('text-gray-50')}
          light={tailwind('text-gray-900')}
          style={tailwind('text-xs mt-2')}
        >
          {translate('screens/CompositeSwapScreen', ' To learn more about DFI, read here.')}
        </ThemedText>
      </View>
      <View>
        <ThemedText
          dark={tailwind('text-gray-50')}
          light={tailwind('text-gray-900')}
          style={tailwind('text-xs font-medium mt-8')}
        >
          {translate('screens/CompositeSwapScreen', 'STEP 2')}
        </ThemedText>
        <ThemedText
          dark={tailwind('text-gray-50')}
          light={tailwind('text-gray-900')}
          style={tailwind('text-xl font-semibold')}
        >
          {translate('screens/CompositeSwapScreen', 'Receive $DFI in Light Wallet')}
        </ThemedText>
        <View
          style={tailwind('flex flex-row justify-center items-center mt-5')}
        >
          <ThemedView
            style={tailwind('w-4/12 p-3 rounded-lg')}
            testID='qr_code_container'
            dark={tailwind('bg-gray-800')}
            light={tailwind('bg-white')}
          >
            <QRCode
              backgroundColor={isLight ? 'white' : 'black'}
              color={isLight ? 'black' : 'white'}
              size={90}
              value={address}
            />
          </ThemedView>
          <View style={tailwind('w-8/12 p-3')}>
            <ThemedText
              dark={tailwind('text-gray-100')}
              light={tailwind('text-gray-900')}
              numberOfLines={2}
              selectable
              testID='address_text'
            >
              {address}
            </ThemedText>
            <ThemedText
              dark={tailwind('text-gray-400')}
              light={tailwind('text-gray-500')}
              numberOfLines={2}
              selectable
              style={tailwind('font-medium my-2 text-xs')}
              testID='wallet_address'
            >
              {translate('screens/GetDFIScreen', 'Wallet Address')}
            </ThemedText>

            <View
              style={tailwind('flex flex-row mt-2')}
            >

              <TouchableOpacity
                onPress={() => {
                  copyToClipboard()
                  Clipboard.setString(address)
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
                  style={tailwind('ml-2 uppercase font-medium text-sm')}
                >
                  {translate('screens/GetDFIScreen', 'COPY')}
                </ThemedText>
              </TouchableOpacity>

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
                  style={tailwind('ml-2 uppercase font-medium text-sm')}
                >
                  {translate('screens/GetDFIScreen', 'SHARE')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ThemedScrollView>
  )
}

function ExchangeItemRow ({
  image,
  name,
  url
}: ExchangeProps): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-gray-800')}
      light={tailwind('bg-white')}
      style={tailwind('rounded-lg')}
    >
      <ThemedTouchableOpacity
        onPress={async () => await openURL(url)}
        style={tailwind('w-full')}
        testID={name}
      >
        <View style={tailwind('flex flex-row p-4 items-center justify-between')}>
          <View style={tailwind('flex flex-row items-center')}>
            <Image
              source={image}
              style={tailwind('h-6 w-6 mr-2')}
            />
            <ThemedText
              dark={tailwind('text-gray-50')}
              light={tailwind('text-gray-900')}
              style={tailwind('text-base')}
            >
              {name}
            </ThemedText>
          </View>
          <ThemedIcon
            size={16}
            name='open-in-new'
            iconType='MaterialIcons'
            dark={tailwind('text-gray-50')}
            light={tailwind('text-gray-900')}
          />
        </View>
      </ThemedTouchableOpacity>
    </ThemedView>
  )
}
