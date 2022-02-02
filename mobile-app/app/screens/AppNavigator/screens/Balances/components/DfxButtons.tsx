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
import BtnGatewayDe from '@assets/images/dfx_buttons/btn_gateway_de.png'
import BtnGatewayEn from '@assets/images/dfx_buttons/btn_gateway_en.png'
import BtnOverviewDe from '@assets/images/dfx_buttons/btn_overview_de.png'
import BtnOverviewEn from '@assets/images/dfx_buttons/btn_overview_en.png'
import BtnTaxDe from '@assets/images/dfx_buttons/btn_tax_de.png'
import BtnTaxEn from '@assets/images/dfx_buttons/btn_tax_en.png'
import BtnDobbyDe from '@assets/images/dfx_buttons/btn_dobby_de.png'
import BtnDobbyEn from '@assets/images/dfx_buttons/btn_dobby_en.png'
import { WalletAddressIndexPersistence } from '@api/wallet/address_index'

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
        message: translate('screens/BalancesScreen', 'To activate Fiat exchange, we need you to enter your current passcode.'),
        loading: translate('screens/BalancesScreen', 'Verifying passcode...')
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

  const buttons: Array<{img: {[key: string]: ImageSourcePropType}, onPress: () => Promise<void>}> = [
    {
      img: {
        de: BtnGatewayDe,
        en: BtnGatewayEn
      },
      onPress: onGatewayButtonPress
    },
    {
      img: {
        de: BtnOverviewDe,
        en: BtnOverviewEn
      },
      onPress: onOverviewButtonPress
    },
    {
      img: {
        de: BtnTaxDe,
        en: BtnTaxEn
      },
      onPress: onTaxButtonPress
    },
    {
      img: {
        de: BtnDobbyDe,
        en: BtnDobbyEn
      },
      onPress: onDobbyButtonPress
    }
  ]

  return (
    <View style={tailwind('flex flex-row justify-evenly mt-6')}>
      {buttons.map((b, i) => <ImageButton key={i} source={b.img[language]} onPress={async () => await b.onPress()} />)}
    </View>
  )
}

interface ImageButtonProps extends TouchableOpacityProps {
    source: ImageSourcePropType
  }

export function ImageButton (props: ImageButtonProps): JSX.Element {
  const styles = StyleSheet.create({
    button: {
      aspectRatio: 1.235,
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
