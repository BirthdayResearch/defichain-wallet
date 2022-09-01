/* eslint-disable @typescript-eslint/consistent-type-assertions */
import * as Clipboard from 'expo-clipboard'
import React, { useCallback, useEffect, useState } from 'react'
import { Share, TouchableOpacity, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { ThemedActivityIndicator, ThemedIcon, ThemedScrollView, ThemedText, ThemedTextBasic, ThemedView } from '@components/themed'
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
// import BtcIconSvg from '@assets/images/dfx_buttons/crypto/Bitcoin_icon.svg'
import BtcTodBtc from '@assets/images/dfx_buttons/crypto/BTC_to_dBTC.svg'
import { HeaderTitle } from '@components/HeaderTitle'

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

// TODO: (thabrad) check if in future fetched from server
export const MinimumBtcAmount = '0.0005 BTC'

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
  const [refBonus, setRefBonus] = useState(0)
  const { openKycLink } = useDFXAPIContext()
  const [showToast, setShowToast] = useState(false)
  const toast = useToast()
  const TOAST_DURATION = 2000
  const [isLoadingKyc, setIsLoadingKyc] = useState(false)

  const copyToClipboard = useCallback(debounce(() => {
    if (showToast) {
      return
    }
    setShowToast(true)
    setTimeout(() => setShowToast(false), TOAST_DURATION)
  }, 500), [showToast])

  const buttonGroup = [
    {
      id: CryptoButtonGroupTabKey.BTC,
      label: CryptoButtonGroupTabKey.BTC,
      handleOnPress: () => setActiveButton(CryptoButtonGroupTabKey.BTC)
    },
    {
      id: CryptoButtonGroupTabKey.DFI,
      label: CryptoButtonGroupTabKey.DFI,
      handleOnPress: () => setActiveButton(CryptoButtonGroupTabKey.DFI)
    }
  ]

  const cryptoRoute: CryptoRoute = {
    active: true,
    blockchain: Blockchain.BITCOIN,
    type: BuyType.WALLET,
    id: '',
    fee: 0,
    volume: 0,
    annualVolume: 0,
    refBonus: 0
  }

  useEffect(() => {
    if (route.params?.fromReceiveScreen ?? false) {
      navigation.setOptions({
        headerTitle: () => (
          <HeaderTitle
            text={activeButton === CryptoButtonGroupTabKey.DFI ? translate('screens/ReceiveScreen', 'Receive') : translate('screens/ReceiveDTokenScreen', 'Bitcoin Deposit')}
          // containerTestID={headerContainerTestId}
          />
        )
      })
    }
  }, [activeButton, navigation])

  useEffect(() => {
    setIsLoading(true)
    // load cryptoRoutes
    getCryptoRoutes().then((routes) => {
      const cryptoRoutes = routes.filter((r) => r.active)
      const route = cryptoRoutes.find((r) => r.blockchain === Blockchain.BITCOIN)

      if (route != null) {
        // if route exists, get bitcoin address and set state
        setBitcoinAddress(route?.deposit?.address ?? '')
        setFee(route?.fee ?? defaultFee)
        setRefBonus(route?.refBonus ?? 0)
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
            setRefBonus(route?.refBonus ?? 0)
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
        // crypto tab switch
        route.params?.crypto === undefined
        ? (
          <View style={tailwind('pt-2 self-center')}>
            <ButtonGroup
              buttons={buttonGroup}
              activeButtonGroupItem={activeButton}
              modalStyle={tailwind('text-lg')}
              testID='portfolio_button_group'
              darkThemeStyle={tailwind('bg-dfxblue-800 rounded')}
              customButtonGroupStyle={tailwind('px-14 py-1 h-8 rounded')}
              customActiveStyle={{
                dark: tailwind(activeButton === CryptoButtonGroupTabKey.DFI ? 'bg-dfxdfi-500' : 'bg-dfxbtc-500', 'h-10')
              }}
            />
          </View>
        )
        : (
          <BtcTodBtc style={tailwind('self-center')} />
        )
        // if route.params?.crypto === undefined, then show bitcoin svg
      }
      <ThemedText
        style={tailwind('p-4 font-medium text-base text-center')}
      >
        {activeButton === CryptoButtonGroupTabKey.DFI ? translate('screens/ReceiveScreen', 'Use QR or Wallet Address to receive any DST or DFI') : translate('screens/ReceiveDTokenScreen', 'Send ONLY Bitcoin (BTC) to your BTC deposit address shown below or scan the QR code. We will transfer dBTC in your DFX Wallet afterwards.')}
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
            <TouchableOpacity onPress={async () => {
                setIsLoadingKyc(true)
                openKycLink().finally(() => setIsLoadingKyc(false))
              }}
            >
              <ThemedText style={tailwind('text-center')}>
                {translate('screens/ReceiveDTokenScreen', 'Please click here to finish the KYC process to receive your bitcoin address')}
              </ThemedText>
              {(isLoadingKyc) && <ThemedActivityIndicator size='large' color='#65728a' style={tailwind('absolute inset-0 items-center justify-center')} />}
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
                  logoSize={60}
                />
              </View>

              <ThemedTextBasic
                dark={tailwind(activeButton === CryptoButtonGroupTabKey.DFI ? 'text-dfxdfi-500' : 'text-dfxbtc-500')}
                light={tailwind(activeButton === CryptoButtonGroupTabKey.DFI ? 'text-dfxdfi-500' : 'text-dfxbtc-500')}
                style={tailwind('font-medium text-center')}
                testID='wallet_address'
              >
                {activeButton === CryptoButtonGroupTabKey.DFI ? translate('screens/ReceiveScreen', 'WALLET ADDRESS') : 'BTC ' + translate('screens/ReceiveDTokenScreen', 'DEPOSIT ADDRESS')}
              </ThemedTextBasic>
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
      </ThemedView>

      {(bitcoinAddress !== '' || activeButton === CryptoButtonGroupTabKey.DFI) && (
        <>
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
                text={translate('screens/ReceiveDTokenScreen', 'Please note the MINIMUM deposit amount is {{MinimumBtcAmount}}!', { MinimumBtcAmount })}
                style={tailwind('mt-2 mb-4')}
              />
              <InfoRow
                type={InfoType.BtcFee}
                value={fee}
                testID='fiat_fee'
                suffix={(refBonus !== 0 ? `%  (${refBonus.toString()}% ${translate('ReceiveDTokenScreen', 'Ref bonus')})` : '%')}
              />
              <View style={tailwind('mb-6')} />
            </>
          )}
        </>
      )}
    </ThemedScrollView>
  )
}
