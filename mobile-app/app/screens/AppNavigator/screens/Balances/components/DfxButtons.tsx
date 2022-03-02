import * as React from 'react'
import { tailwind } from '@tailwind'
import { WalletHdNodeProvider } from '@defichain/jellyfish-wallet'
import { MnemonicHdNode } from '@defichain/jellyfish-wallet-mnemonic'
import { StyleSheet, ImageSourcePropType, Linking, TouchableOpacity, TouchableOpacityProps, Image, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { initJellyfishWallet, MnemonicEncrypted, MnemonicUnprotected } from '@api/wallet'
import { getJellyfishNetwork } from '@shared-api/wallet/network'
import { WalletType } from '@shared-contexts/WalletPersistenceContext'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWalletNodeContext } from '@shared-contexts/WalletNodeProvider'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { authentication, Authentication } from '@store/authentication'
import { translate } from '@translations'
import { signAsync } from 'bitcoinjs-message'
import { getEnvironment } from '@environment'
import { useLanguageContext } from '@shared-contexts/LanguageProvider'
import * as Updates from 'expo-updates'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { WalletAddressIndexPersistence } from '@api/wallet/address_index'

import BtnGatewayEn from '@assets/images/dfx_buttons/btn_gateway_en.png'
import BtnOverviewEn from '@assets/images/dfx_buttons/btn_overview_en.png'
import BtnTaxEn from '@assets/images/dfx_buttons/btn_tax_en.png'
import BtnDobbyEn from '@assets/images/dfx_buttons/btn_dobby_en.png'

import BtnGatewayDe from '@assets/images/dfx_buttons/btn_gateway_de.png'
import BtnOverviewDe from '@assets/images/dfx_buttons/btn_overview_de.png'
import BtnTaxDe from '@assets/images/dfx_buttons/btn_tax_de.png'
import BtnDobbyDe from '@assets/images/dfx_buttons/btn_dobby_de.png'

import BtnGatewayFr from '@assets/images/dfx_buttons/btn_gateway_fr.png'
import BtnOverviewFr from '@assets/images/dfx_buttons/btn_overview_fr.png'
import BtnTaxFr from '@assets/images/dfx_buttons/btn_tax_fr.png'
import BtnDobbyFr from '@assets/images/dfx_buttons/btn_dobby_fr.png'

import BtnGatewayIt from '@assets/images/dfx_buttons/btn_gateway_it.png'
import BtnOverviewIt from '@assets/images/dfx_buttons/btn_overview_it.png'
import BtnTaxIt from '@assets/images/dfx_buttons/btn_tax_it.png'
import BtnDobbyIt from '@assets/images/dfx_buttons/btn_dobby_it.png'

import BtnGatewayEs from '@assets/images/dfx_buttons/btn_gateway_es.png'
import BtnOverviewEs from '@assets/images/dfx_buttons/btn_overview_es.png'
import BtnTaxEs from '@assets/images/dfx_buttons/btn_tax_es.png'
import BtnDobbyEs from '@assets/images/dfx_buttons/btn_dobby_es.png'

export function DfxButtons (): JSX.Element {
  const logger = useLogger()
  const { network } = useNetworkContext()
  const { address } = useWalletContext()
  const { data: providerData } = useWalletNodeContext()
  const whaleApiClient = useWhaleApiClient()
  const dispatch = useDispatch()
  const { language } = useLanguageContext()

  // TODO(davidleomay): use useCallback?
  async function onGatewayButtonPress (): Promise<void> {
    if (providerData.type === WalletType.MNEMONIC_UNPROTECTED) {
      const provider = MnemonicUnprotected.initProvider(providerData, network)
      const signature = await signMessage(provider)
      await onMessageSigned(signature)
    } else if (providerData.type === WalletType.MNEMONIC_ENCRYPTED) {
      const auth: Authentication<Buffer> = {
        consume: async passphrase => {
          const provider = MnemonicEncrypted.initProvider(providerData, network, { prompt: async () => passphrase })
          return await signMessage(provider)
        },
        onAuthenticated: onMessageSigned,
        onError: e => logger.error(e),
        message: translate('screens/UnlockWallet', 'To access DFX Services, we need you to enter your passcode.'),
        loading: translate('screens/TransactionAuthorization', 'Verifying access')
      }
      dispatch(authentication.actions.prompt(auth))
    } else {
      throw new Error('Missing wallet provider data handler')
    }
  }

  async function onMessageSigned (signature: Buffer): Promise<void> {
    const sig = signature.toString('base64')
    const walletId = 1
    const lang = language.split('-').find(() => true) ?? 'de'
    const baseUrl = getEnvironment(Updates.releaseChannel).dfxPaymentUrl

    const url = `${baseUrl}/login?address=${encodeURIComponent(address)}&signature=${encodeURIComponent(sig)}&walletId=${walletId}&lang=${lang}`
    await Linking.openURL(url)
  }

  async function signMessage (provider: WalletHdNodeProvider<MnemonicHdNode>): Promise<Buffer> {
    const activeIndex = await WalletAddressIndexPersistence.getActive()
    const account = initJellyfishWallet(provider, network, whaleApiClient).get(activeIndex)

    const privKey = await account.privateKey()
    const messagePrefix = getJellyfishNetwork(network).messagePrefix
    const message = `By signing this message, you confirm that you are the sole owner of the provided DeFiChain address and are in possession of its private key. Your ID: ${address}`
      .split(' ')
      .join('_')

    return await signAsync(message, privKey, true, messagePrefix)
  }

  async function onOverviewButtonPress (): Promise<void> {
    const url = `https://defichain-income.com/address/${encodeURIComponent(address)}`
    await Linking.openURL(url)
  }

  async function onTaxButtonPress (): Promise<void> {
    const url = `https://dfi.tax/adr/${encodeURIComponent(address)}`
    await Linking.openURL(url)
  }

  async function onDobbyButtonPress (): Promise<void> {
    const url = `https://defichain-dobby.com/#/setup/${encodeURIComponent(address)}`
    await Linking.openURL(url)
  }

  const buttons: Array<{hide?: boolean, img: {[key: string]: ImageSourcePropType}, onPress: () => Promise<void>}> = [
    {
      img: {
        de: BtnGatewayDe,
        en: BtnGatewayEn,
        fr: BtnGatewayFr,
        it: BtnGatewayIt,
        es: BtnGatewayEs
      },
      onPress: onGatewayButtonPress
    },
    {
      img: {
        de: BtnOverviewDe,
        en: BtnOverviewEn,
        fr: BtnOverviewFr,
        it: BtnOverviewIt,
        es: BtnOverviewEs
      },
      onPress: onOverviewButtonPress
    },
    {
      img: {
        de: BtnTaxDe,
        en: BtnTaxEn,
        fr: BtnTaxFr,
        it: BtnTaxIt,
        es: BtnTaxEs
      },
      onPress: onTaxButtonPress
    },
    {
      hide: true, // TODO(davidleomay)
      img: {
        de: BtnDobbyDe,
        en: BtnDobbyEn,
        fr: BtnDobbyFr,
        it: BtnDobbyIt,
        es: BtnDobbyEs
      },
      onPress: onDobbyButtonPress
    }
  ]

  return (
    <View style={tailwind('flex flex-row justify-evenly mt-6')}>
      {buttons.filter((b) => !(b.hide ?? false)).map((b, i) => <ImageButton key={i} source={b.img[language] ?? b.img.en} onPress={async () => await b.onPress()} />)}
    </View>
  )
}

interface ImageButtonProps extends TouchableOpacityProps {
    source: ImageSourcePropType
  }

export function ImageButton (props: ImageButtonProps): JSX.Element {
  const styles = StyleSheet.create({
    button: {
      aspectRatio: 1.5, // 1.235, // TODO(davidleomay)
      flex: 1
    },
    image: {
      height: '100%',
      resizeMode: 'contain',
      width: '100%'
    }
  })

  return (
    <TouchableOpacity style={styles.button} {...props}>
      <Image
        source={props.source}
        style={styles.image}
      />
    </TouchableOpacity>
  )
}
