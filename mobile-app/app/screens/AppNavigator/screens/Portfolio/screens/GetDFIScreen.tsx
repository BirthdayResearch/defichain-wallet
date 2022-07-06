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
import { IconTooltip } from '@components/tooltip/IconTooltip'
import NumberFormat from 'react-number-format'
import BigNumber from 'bignumber.js'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
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
import Bybit from '@assets/images/exchanges/Bybit.png'
import Swyftx from '@assets/images/exchanges/Swyftx.png'

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
    name: 'Bybit',
    image: Bybit,
    url: 'https://www.bybit.com/en-US/trade/spot/DFI/USDT'
  }, {
    name: 'Swyftx',
    image: Swyftx,
    url: 'https://swyftx.com/au/buy/defichain/'
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
  return (
    <>
      <ThemedScrollView
        contentContainerStyle={tailwind('pb-24')}
        style={tailwind('flex')}
        testID='get_dfi_screen'
      >
        <StepOne />
        <StepTwo />
      </ThemedScrollView>
      <DFIOraclePrice />
    </>
  )
}

function StepOne (): JSX.Element {
  const [expand, setExpand] = useState(false)

  return (
    <>
      <View style={tailwind('p-4')}>
        <ThemedText
          dark={tailwind('text-gray-50')}
          light={tailwind('text-gray-900')}
          style={tailwind('text-xs font-medium')}
        >
          {translate('screens/GetDFIScreen', 'STEP 1')}
        </ThemedText>
        <ThemedText
          dark={tailwind('text-gray-50')}
          light={tailwind('text-gray-900')}
          style={tailwind('text-xl font-semibold')}
        >
          {translate('screens/GetDFIScreen', 'Trade/Purchase $DFI')}
        </ThemedText>
        <ThemedText
          dark={tailwind('text-gray-50')}
          light={tailwind('text-gray-900')}
          style={tailwind('text-xl')}
        >
          {translate('screens/GetDFIScreen', 'Available on:')}
        </ThemedText>
      </View>
      <ThemedView style={tailwind('mt-1')}>
        {(exchanges.slice(0, expand ? exchanges.length : 3))
          .map(({ name, image, url }, index) =>
            <ExchangeItemRow
              url={url}
              key={name}
              name={name}
              image={image}
              testID={`exchange_${index}`}
            />
          )}
      </ThemedView>
      <ShowMore onPress={setExpand} expand={expand} />
      <View style={tailwind('px-4 mt-2 flex flex-row')}>
        <ThemedText
          dark={tailwind('text-gray-50')}
          light={tailwind('text-gray-900')}
          style={tailwind('text-xs')}
        >
          {translate('screens/GetDFIScreen', 'To learn more about DFI, ')}
        </ThemedText>
        <TouchableOpacity
          onPress={async () => await openURL('https://defichain.com/dfi')}
          testID='read_here'
        >
          <ThemedText
            dark={tailwind('text-dfxred-500')}
            light={tailwind('text-primary-500')}
            style={tailwind('text-xs')}
          >
            {translate('screens/GetDFIScreen', 'read here.')}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </>
  )
}

function StepTwo (): JSX.Element {
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
    <View style={tailwind('p-4')}>
      <ThemedText
        dark={tailwind('text-gray-50')}
        light={tailwind('text-gray-900')}
        style={tailwind('text-xs font-medium mt-8')}
      >
        {translate('screens/GetDFIScreen', 'STEP 2')}
      </ThemedText>
      <ThemedText
        dark={tailwind('text-gray-50')}
        light={tailwind('text-gray-900')}
        style={tailwind('text-xl font-semibold')}
      >
        {translate('screens/GetDFIScreen', 'Receive $DFI in Light Wallet')}
      </ThemedText>
      <View
        style={tailwind('flex flex-row justify-center items-center mt-3')}
      >
        <ThemedView
          style={tailwind('w-4/12 p-3 rounded-lg justify-center items-center')}
          testID='qr_code_container'
          dark={tailwind('bg-dfxblue-800')}
          light={tailwind('bg-white')}
        >
          <QRCode
            backgroundColor={isLight ? 'white' : 'black'}
            color={isLight ? 'black' : 'white'}
            size={90}
            value={address}
          />
        </ThemedView>
        <View style={tailwind('w-8/12 px-3')}>
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
            dark={tailwind('text-dfxgray-400')}
            light={tailwind('text-gray-500')}
            numberOfLines={2}
            selectable
            style={tailwind('font-medium my-2 text-xs')}
            testID='wallet_address'
          >
            {translate('screens/GetDFIScreen', 'Wallet Address')}
          </ThemedText>

          <View style={tailwind('flex flex-row mt-2')}>
            <TouchableOpacity
              onPress={() => {
                copyToClipboard()
                Clipboard.setString(address)
              }}
              style={tailwind('flex flex-1 flex-row justify-start text-center items-center')}
              testID='copy_button'
            >
              <ThemedIcon
                dark={tailwind('text-dfxred-500')}
                iconType='MaterialIcons'
                light={tailwind('text-primary-500')}
                name='content-copy'
                size={18}
                style={tailwind('self-center')}
              />

              <ThemedText
                dark={tailwind('text-dfxred-500')}
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
              style={tailwind('flex flex-1 flex-row justify-start text-center items-center')}
              testID='share_button'
            >
              <ThemedIcon
                dark={tailwind('text-dfxred-500')}
                iconType='MaterialIcons'
                light={tailwind('text-primary-500')}
                name='share'
                size={18}
                style={tailwind('self-center')}
              />

              <ThemedText
                dark={tailwind('text-dfxred-500')}
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
  )
}

function ExchangeItemRow ({ image, name, url, testID }: ExchangeProps & { testID: string }): JSX.Element {
  return (
    <ThemedTouchableOpacity
      onPress={async () => await openURL(url)}
      style={tailwind('w-full')}
      testID={testID}
    >
      <ThemedView style={tailwind('flex flex-row px-4 py-3 items-center justify-between')}>
        <View style={tailwind('flex flex-row items-center')}>
          <Image
            source={image}
            style={tailwind('h-6 w-6')}
          />
          <ThemedText
            dark={tailwind('text-gray-50')}
            light={tailwind('text-gray-900')}
            style={tailwind('text-base ml-2')}
          >
            {name}
          </ThemedText>
        </View>
        <ThemedIcon
          size={16}
          name='open-in-new'
          iconType='MaterialIcons'
          dark={tailwind('text-dfxgray-300')}
          light={tailwind('text-gray-600')}
        />
      </ThemedView>
    </ThemedTouchableOpacity>
  )
}

function ShowMore ({ onPress, expand }: { onPress: (flag: boolean) => void, expand: boolean }): JSX.Element {
  return (
    <ThemedTouchableOpacity
      onPress={() => onPress(!expand)}
      style={tailwind('w-full')}
      testID='show_more'
    >
      <ThemedView style={tailwind('flex flex-row px-4 py-3 items-center')}>
        <ThemedIcon
          iconType='MaterialIcons'
          dark={tailwind('text-dfxred-500')}
          light={tailwind('text-primary-500')}
          name={expand ? 'expand-less' : 'expand-more'}
          size={24}
        />
        <ThemedText
          dark={tailwind('text-dfxred-500')}
          light={tailwind('text-primary-500')}
          style={tailwind('text-base font-medium ml-2')}
        >
          {translate('screens/GetDFIScreen', expand ? 'Show less' : 'Show more')}
        </ThemedText>
      </ThemedView>
    </ThemedTouchableOpacity>
  )
}

function DFIOraclePrice (): JSX.Element {
  const [price, setPrice] = useState('0')
  const client = useWhaleApiClient()
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0
  const logger = useLogger()

  useEffect(() => {
    client.prices.get('DFI', 'USD')
    .then((value) => {
      setPrice(value.price.aggregated.amount)
    }).catch(logger.error)
  }, [blockCount])

  return (
    <View style={tailwind('absolute bottom-2 w-full')}>
      <ThemedView
        dark={tailwind('bg-gray-100 border-gray-100')}
        light={tailwind('bg-gray-900 border-gray-700')}
        style={tailwind('flex flex-row items-center justify-between rounded-lg mx-4 px-6 py-4')}
      >
        <View style={tailwind('flex flex-row items-center')}>
          <ThemedText
            light={tailwind('text-white')}
            dark={tailwind('text-black')}
            style={tailwind('text-base text-xs font-medium mr-1')}
          >
            {translate('screens/GetDFIScreen', 'DFI oracle price')}
          </ThemedText>
          <IconTooltip
            size={18}
            light={tailwind('text-white')}
            dark={tailwind('text-black')}
          />
        </View>
        <NumberFormat
          displayType='text'
          prefix='$'
          decimalScale={2}
          renderText={(val: string) => (
            <ThemedText
              light={tailwind('text-white')}
              dark={tailwind('text-black')}
              style={tailwind('text-lg font-semibold')}
              testID='dfi_oracle_price'
            >
              {val}
            </ThemedText>
          )}
          thousandSeparator
          value={new BigNumber(price).toFixed(2)}
        />
      </ThemedView>
    </View>
  )
}
