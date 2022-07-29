/* eslint-disable @typescript-eslint/consistent-type-assertions */
import * as Clipboard from 'expo-clipboard'
import React, { useCallback, useEffect, useState } from 'react'
import { Share, TouchableOpacity, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { ThemedActivityIndicator, ThemedIcon, ThemedScrollView, ThemedText, ThemedView } from '@components/themed'
import { useToast } from 'react-native-toast-notifications'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { debounce } from 'lodash'
import { ButtonGroup } from '../../Dex/components/ButtonGroup'
import DfiIcon from '@assets/images/dfx_buttons/crypto/DFI_icon.png'
import BtcIcon from '@assets/images/dfx_buttons/crypto/BTC_icon.png'
import { PortfolioParamList } from '../PortfolioNavigator'
import { StackScreenProps } from '@react-navigation/stack'
import { getAssets, getCryptoRoutes, postCryptoRoute } from '@shared-api/dfx/ApiService'
import { Blockchain, CryptoRoute } from '@shared-api/dfx/models/CryptoRoute'
import { BuyType } from '@shared-api/dfx/models/BuyRoute'
import { Asset } from '@shared-api/dfx/models/Asset'
import { InfoRow, InfoType } from '@components/InfoRow'
import { InfoText } from '@components/InfoText'
import { useDFXAPIContext } from '@shared-contexts/DFXAPIContextProvider'

export async function onShare (address: string, logger: NativeLoggingProps): Promise<void> {
  try {
    await Share.share({
      message: address
    })
  } catch (error) {
    logger.error(error)
  }
}

export enum CryptoButtonGroupTabKey {
  DFI = 'DeFiChain',
  BTC = 'Bitcoin',
  ETH = 'Ethereum'
}

type Props = StackScreenProps<PortfolioParamList, 'ReceiveDTokenScreen'>

export function ReceiveDTokenScreen ({
  route,
  navigation
}: Props): JSX.Element {
  const logger = useLogger()
  const { isLight } = useThemeContext()
  const { address } = useWalletContext()
  const [activeButton, setActiveButton] = useState<CryptoButtonGroupTabKey>(route.params?.crypto ?? CryptoButtonGroupTabKey.DFI)

  const [bitcoinAddress, setBitcoinAddress] = useState('')
  const activeAddress = activeButton === CryptoButtonGroupTabKey.DFI ? address : bitcoinAddress
  const [isLoading, setIsLoading] = useState(false)
  const defaultFee = 1.2
  const [fee, setFee] = useState(defaultFee)
  const { openDfxServices } = useDFXAPIContext()

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

  const buttonGroup = [
    {
      id: CryptoButtonGroupTabKey.DFI,
      label: CryptoButtonGroupTabKey.DFI,
      handleOnPress: () => setActiveButton(CryptoButtonGroupTabKey.DFI)
    },
    {
      id: CryptoButtonGroupTabKey.BTC,
      label: CryptoButtonGroupTabKey.BTC,
      handleOnPress: () => setActiveButton(CryptoButtonGroupTabKey.BTC)
    }
  ]

  // const onSubmit = (route: CryptoRoute) => {
  //   setIsSaving(true)
  //   setError(undefined)

  //   // re-activate the route, if it already existed
  //   const existingRoute = routes?.find((r) => !r.active)
  //   if (existingRoute) {
  //     existingRoute.active = true
  //   }

  //   route.type = BuyType.WALLET;

  //   (existingRoute ? putCryptoRoute(existingRoute) : postCryptoRoute(route))
  //     .then(onRouteCreated)
  //     .catch((error: ApiError) => setError(error.statusCode === 409 ? "model.route.conflict" : ""))
  //     .finally(() => setIsSaving(false))
  // }

  const cryptoRoute: CryptoRoute = {
    active: true,
    asset: {} as Asset,
    blockchain: Blockchain.BITCOIN,
    type: BuyType.WALLET,
    id: ''
  }

  useEffect(() => {
    setIsLoading(true)
    // load cryptoRoutes
    getCryptoRoutes().then((routes) => {
      const cryptoRoutes = routes.filter((r) => r.active)
      const route = cryptoRoutes.find((r) => r.blockchain === Blockchain.BITCOIN)

      if (route != null) {
        // if route exists, get bitcoin address and set state
        setBitcoinAddress(route?.deposit?.address ?? '')
        setIsLoading(false)
      } else {
        // if route doesn't exist, automatically create a bitcoin route
        getAssets().then((assets) => {
          // get bitcoin asset
          const asset = assets.find((a) => a.id === 2)
          cryptoRoute.asset = asset ?? {} as Asset

          // post bitcoin route
          postCryptoRoute(cryptoRoute).then((route) => {
            setBitcoinAddress(route?.deposit?.address ?? '')
            setFee(route?.fee ?? defaultFee)
          }).catch((error) => {
            logger.error(error)
          }).finally(() => {
            setIsLoading(false)
          })
        })
      }
    })
  }, [])

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
  }, [showToast, address, activeAddress])

  return (
    <ThemedScrollView
      style={tailwind('px-8 pt-2 flex flex-1 w-full relative')}
      testID='receive_screen'
    >
      {
        // filter tab
        route.params?.crypto === undefined &&
        (
          <>
            <View style={tailwind('p-4')}>
              <ButtonGroup
                buttons={buttonGroup}
                activeButtonGroupItem={activeButton}
                modalStyle={tailwind('text-lg')}
                testID='portfolio_button_group'
                darkThemeStyle={tailwind('bg-dfxblue-800 rounded')}
                customButtonGroupStyle={tailwind('px-2.5 py-1 rounded break-words justify-center')}
                customActiveStyle={{
                  dark: tailwind(activeButton === CryptoButtonGroupTabKey.DFI ? 'bg-dfxdfi-500' : 'bg-dfxbtc-500')
                }}
              />
            </View>
          </>
        )
      }
      <ThemedText
        style={tailwind('p-4 font-medium text-center')}
      >
        {translate('screens/ReceiveScreen', activeButton === CryptoButtonGroupTabKey.DFI ? 'Use QR or Wallet Address to receive any DST or DFI' : 'Send ONLY Bitcoin (BTC) to your BTC deposit address shown below or scan the QR code. We will transfer dBTC in your DFX Wallet afterwards.')}
      </ThemedText>

      <ThemedView
        dark={tailwind('bg-dfxblue-800')}
        light={tailwind('bg-white')}
        style={tailwind('flex justify-center items-center p-5 rounded-lg')}
      >
        {isLoading && activeButton !== CryptoButtonGroupTabKey.DFI
          ? (
            <ThemedActivityIndicator size='large' color='#65728a' style={tailwind('absolute inset-0 items-center justify-center')} />
          )
          : activeButton === CryptoButtonGroupTabKey.BTC && bitcoinAddress === ''
          ? (
            <TouchableOpacity onPress={async () => await openDfxServices()}>
              <ThemedText style={tailwind('text-center text-xs')}>
                {translate('screens/ReceiveScreen', 'Please click here to finish the KYC process to receive your bitcoin address')}
              </ThemedText>
            </TouchableOpacity>
          )
          : (
            <>
              <View
                style={tailwind('mb-4')}
                testID='qr_code_container'
              >
                <QRCode
                  backgroundColor={isLight ? 'white' : 'black'}
                  color={isLight ? 'black' : 'white'}
                  size={260}
                  value={activeAddress}
                  logo={activeButton === CryptoButtonGroupTabKey.DFI ? DfiIcon : BtcIcon}
                  // logoSize={52}
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
                {activeAddress}
              </ThemedText>
            </>
          )}
        <ThemedText
          dark={tailwind('text-dfxgray-400')}
          light={tailwind('text-dfxgray-500')}
          numberOfLines={2}
          selectable
          style={tailwind('font-medium my-2 text-center text-xs')}
          testID='wallet_address'
        >
          {translate('screens/ReceiveScreen', 'WALLET ADDRESS')}
        </ThemedText>
      </ThemedView>

      <ThemedView
        style={tailwind('flex flex-row mt-6 mb-4')}
      >

        <TouchableOpacity
          onPress={() => {
            copyToClipboard()
            Clipboard.setString(activeAddress)
          }}
          style={tailwind('flex flex-1 flex-row justify-center text-center items-center')}
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
            style={tailwind('ml-2 uppercase font-medium')}
          >
            {translate('screens/ReceiveScreen', 'COPY')}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            await onShare(activeAddress, logger)
          }}
          style={tailwind('flex flex-1 flex-row justify-center text-center items-center')}
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
            style={tailwind('ml-2 uppercase font-medium')}
          >
            {translate('screens/ReceiveScreen', 'SHARE')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {activeButton === CryptoButtonGroupTabKey.BTC && (
        <>
          <InfoText
            testID='dfx_kyc_info'
            text={translate('components/ReceiveDTokenScreen', 'Please note the MINIMUM deposit amount is 0,0005 BTC!')}
            style={tailwind('mb-4')}
          />
          <InfoRow
            type={InfoType.FiatFee}
            value={fee.toString()}
            testID='fiat_fee'
            suffix='%'
          />
        </>
      )}

    </ThemedScrollView>
  )
}
