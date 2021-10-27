import * as React from 'react'
import { WalletHdNodeProvider } from '@defichain/jellyfish-wallet'
import { MnemonicHdNode } from '@defichain/jellyfish-wallet-mnemonic'
import { Linking } from 'react-native'
import { useDispatch } from 'react-redux'
import { Logging } from '../../../../api'
import { getJellyfishNetwork, initJellyfishWallet, MnemonicEncrypted, MnemonicUnprotected, WalletType } from '../../../../api/wallet'
import { useNetworkContext } from '../../../../contexts/NetworkContext'
import { useWalletContext } from '../../../../contexts/WalletContext'
import { useWalletNodeContext } from '../../../../contexts/WalletNodeProvider'
import { useWhaleApiClient } from '../../../../contexts/WhaleContext'
import { authentication, Authentication } from '@store/authentication'
import { translate } from '@translations'
import { Button } from '../../../../components/Button'
import { signAsync } from 'bitcoinjs-message'
import { getEnvironment } from '@environment'
import { useLanguage } from '@contexts/LanguageProvider'
import * as Updates from 'expo-updates'

export function BuyWithFiat (): JSX.Element {
  const { network } = useNetworkContext()
  const { address } = useWalletContext()
  const { data: providerData } = useWalletNodeContext()
  const whaleApiClient = useWhaleApiClient()
  const dispatch = useDispatch()
  const { language } = useLanguage()

  // TODO(davidleomay): use useCallback?
  async function onBuyWithFiat (): Promise<void> {
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
        onError: e => Logging.error(e),
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
    const account = initJellyfishWallet(provider, network, whaleApiClient).get(0)

    const privKey = await account.privateKey()
    const messagePrefix = getJellyfishNetwork(network).messagePrefix
    const message = `By signing this message, you confirm that you are the sole owner of the provided DeFiChain address and are in possession of its private key. Your ID: ${address}`
      .split(' ')
      .join('_')

    return await signAsync(message, privKey, true, messagePrefix)
  }

  return (
    <Button
      testID='button_buy_with_fiat'
      title='Buy with FIAT'
      onPress={onBuyWithFiat}
      label={translate('screens/BalancesScreen', 'BUY WITH FIAT')}
    />
  )
}
