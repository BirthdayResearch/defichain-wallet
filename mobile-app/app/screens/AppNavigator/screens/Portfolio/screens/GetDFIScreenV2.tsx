import * as Clipboard from 'expo-clipboard'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useCallback, useEffect, useState } from 'react'
import { Share, TouchableOpacity, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { ThemedIcon, ThemedScrollViewV2, ThemedTextV2, ThemedTouchableOpacityV2, ThemedViewV2 } from '@components/themed'
import { useToast } from 'react-native-toast-notifications'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { debounce } from 'lodash'
import { IconTooltip } from '@components/tooltip/IconTooltip'
import NumberFormat from 'react-number-format'
import BigNumber from 'bignumber.js'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { PortfolioParamList } from '@screens/AppNavigator/screens/Portfolio/PortfolioNavigator'

export async function onShare (address: string, logger: NativeLoggingProps): Promise<void> {
  try {
    await Share.share({
      message: address
    })
  } catch (error) {
    logger.error(error)
  }
}

export function GetDFIScreenV2 (): JSX.Element {
  return (
    <>
      <ThemedScrollViewV2
        contentContainerStyle={tailwind('pb-24')}
        style={tailwind('flex')}
        testID='get_dfi_screen'
      >
        <StepOne />
        <StepTwo />
      </ThemedScrollViewV2>
      <DFIOraclePrice />
    </>
  )
}

function StepOne (): JSX.Element {
  // const [expand, setExpand] = useState(false)
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>()

  return (
    <View style={tailwind('mx-5 mt-8')}>
      <View style={tailwind('px-5 pb-4')}>
        <ThemedTextV2
          style={tailwind('text-xs font-normal-v2')}
        >
          {translate('screens/GetDFIScreen', 'STEP 1')}
        </ThemedTextV2>
        <ThemedTextV2 style={tailwind('font-normal-v2')}>
          {translate('screens/GetDFIScreen', 'Trade/Purchase DFI')}
        </ThemedTextV2>
      </View>
      <ThemedViewV2
        dark={tailwind('bg-mono-dark-v2-00')}
        light={tailwind('bg-mono-light-v2-00')}
        style={tailwind('rounded-2lg')}
      >
        <ThemedTouchableOpacityV2
          style={tailwind('flex flex-row items-center justify-between py-4.5 ml-5 mr-4')}
          onPress={() => navigation.navigate('MarketplaceScreen')}
        >
          <ThemedTextV2 style={tailwind('text-sm font-normal-v2')}>
            {translate('screens/GetDFIScreen', 'Marketplace')}
          </ThemedTextV2>
          <ThemedIcon
            dark={tailwind('text-mono-dark-v2-900')}
            light={tailwind('text-mono-light-v2-900')}
            iconType='Feather'
            name='chevron-right'
            size={18}
          />
        </ThemedTouchableOpacityV2>
      </ThemedViewV2>
      <TouchableOpacity style={tailwind('flex flex-row items-center mx-5 mt-2')}>
        <ThemedIcon
          dark={tailwind('text-mono-dark-v2-900')}
          light={tailwind('text-mono-light-v2-900')}
          iconType='MaterialCommunityIcons'
          name='help-circle'
          size={18}
        />
        <ThemedTextV2 style={tailwind('text-sm font-normal-v2')}>
          {translate('screens/GetDFIScreen', '  Learn more about DFI')}
        </ThemedTextV2>
      </TouchableOpacity>
      {/* <ThemedViewV2 style={tailwind('mt-1')}>
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
      </ThemedViewV2> */}
      {/* <ShowMore onPress={setExpand} expand={expand} /> */}
      {/* <View style={tailwind('px-4 mt-2 flex flex-row')}>
        <ThemedTextV2
          dark={tailwind('text-gray-50')}
          light={tailwind('text-gray-900')}
          style={tailwind('text-xs')}
        >
          {translate('screens/GetDFIScreen', 'To learn more about DFI, ')}
        </ThemedTextV2>
        <TouchableOpacity
          onPress={async () => await openURL('https://defichain.com/dfi')}
          testID='read_here'
        >
          <ThemedTextV2
            dark={tailwind('text-darkprimary-500')}
            light={tailwind('text-primary-500')}
            style={tailwind('text-xs')}
          >
            {translate('screens/GetDFIScreen', 'read here.')}
          </ThemedTextV2>
        </TouchableOpacity>
      </View> */}
    </View>
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
    <View style={tailwind('mx-5 mt-8')}>
      <View style={tailwind('px-5 pb-4')}>
        <ThemedTextV2 style={tailwind('text-xs font-normal-v2')}>
          {translate('screens/GetDFIScreen', 'STEP 2')}
        </ThemedTextV2>
        <ThemedTextV2 style={tailwind('font-normal-v2')}>
          {translate('screens/GetDFIScreen', 'Receive DFI in DeFiChain Wallet')}
        </ThemedTextV2>
      </View>
      <View
        style={tailwind('flex flex-row justify-center items-center mx-4')}
      >
        <ThemedViewV2
          style={tailwind('w-4/12 p-3 rounded-lg justify-center items-center')}
          testID='qr_code_container'
          dark={tailwind('bg-mono-light-v2-00')}
          light={tailwind('bg-mono-light-v2-00')}
        >
          <QRCode
            backgroundColor={isLight ? 'white' : 'black'}
            color={isLight ? 'black' : 'white'}
            size={90}
            value={address}
          />
        </ThemedViewV2>
        <View style={tailwind('w-8/12 px-3')}>
          <ThemedTextV2
            numberOfLines={2}
            selectable
            style={tailwind('font-normal-v2 mb-2 text-xs uppercase')}
            dark={tailwind('text-mono-dark-v2-500')}
            light={tailwind('text-mono-light-v2-500')}
            testID='wallet_address'
          >
            {translate('screens/GetDFIScreen', 'Wallet Address')}
          </ThemedTextV2>
          <TouchableOpacity
            onPress={() => {
                copyToClipboard()
                Clipboard.setString(address)
              }}
            style={tailwind('flex flex-1 flex-row justify-start items-center')}
            testID='copy_button'
          >
            <ThemedTextV2
              numberOfLines={3}
              selectable
              testID='address_text'
            >
              {address}<CopyIcon />
            </ThemedTextV2>
            {/* <ThemedIcon
              dark={tailwind('text-darkprimary-500')}
              iconType='MaterialIcons'
              light={tailwind('text-primary-500')}
              name='content-copy'
              size={18}
              style={tailwind('self-center')}
            /> */}
            {/* <ThemedTextV2
              dark={tailwind('text-darkprimary-500')}
              light={tailwind('text-primary-500')}
              style={tailwind('ml-2 uppercase font-medium text-sm')}
            >
              {translate('screens/GetDFIScreen', 'COPY')}
            </ThemedTextV2> */}
          </TouchableOpacity>
          {/* <ThemedTextV2
            dark={tailwind('text-gray-100')}
            light={tailwind('text-gray-900')}
            numberOfLines={3}
            selectable
            testID='address_text'
          >
            {address}
          </ThemedTextV2> */}
          {/* <ThemedTextV2
            dark={tailwind('text-gray-400')}
            light={tailwind('text-gray-500')}
            numberOfLines={2}
            selectable
            style={tailwind('font-medium my-2 text-xs')}
            testID='wallet_address'
          >
            {translate('screens/GetDFIScreen', 'Wallet Address')}
          </ThemedTextV2> */}

          <View style={tailwind('flex flex-row mt-2')}>
            <TouchableOpacity
              onPress={async () => {
                await onShare(address, logger)
              }}
              style={tailwind('flex flex-1 flex-row justify-start text-center items-center')}
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

              <ThemedTextV2
                dark={tailwind('text-darkprimary-500')}
                light={tailwind('text-primary-500')}
                style={tailwind('ml-2 uppercase font-medium text-sm')}
              >
                {translate('screens/GetDFIScreen', 'SHARE')}
              </ThemedTextV2>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
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
      <ThemedViewV2
        dark={tailwind('bg-gray-100 border-gray-100')}
        light={tailwind('bg-gray-900 border-gray-700')}
        style={tailwind('flex flex-row items-center justify-between rounded-lg mx-4 px-6 py-4')}
      >
        <View style={tailwind('flex flex-row items-center')}>
          <ThemedTextV2
            light={tailwind('text-white')}
            dark={tailwind('text-black')}
            style={tailwind('text-base text-xs font-medium mr-1')}
          >
            {translate('screens/GetDFIScreen', 'DFI oracle price')}
          </ThemedTextV2>
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
            <ThemedTextV2
              light={tailwind('text-white')}
              dark={tailwind('text-black')}
              style={tailwind('text-lg font-semibold')}
              testID='dfi_oracle_price'
            >
              {val}
            </ThemedTextV2>
          )}
          thousandSeparator
          value={new BigNumber(price).toFixed(2)}
        />
      </ThemedViewV2>
    </View>
  )
}

function CopyIcon (): JSX.Element {
  return (
    <ThemedIcon
      iconType='MaterialIcons'
      dark={tailwind('text-mono-dark-v2-700')}
      light={tailwind('text-mono-light-v2-700')}
      name='content-copy'
      size={18}
      style={tailwind('self-center ml-2')}
    />
  )
}
