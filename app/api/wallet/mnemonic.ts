import { Bip32Options, MnemonicHdNodeProvider } from '@defichain/jellyfish-wallet-mnemonic'
import { EnvironmentNetwork } from '../../environment'
import { getJellyfishNetwork } from './network'
import { WalletData, WalletType } from './persistence'

function getBip32Option (envNetwork: EnvironmentNetwork): Bip32Options {
  const network = getJellyfishNetwork(envNetwork)
  return {
    bip32: {
      public: network.bip32.publicPrefix,
      private: network.bip32.privatePrefix
    },
    wif: network.wifPrefix
  }
}

function createProvider (data: WalletData, network: EnvironmentNetwork): MnemonicHdNodeProvider {
  if (data.type !== WalletType.MNEMONIC_UNPROTECTED || data.version !== 'v1') {
    throw new Error('Unexpected WalletData')
  }
  const [privKey, chainCode] = JSON.parse(data.raw)
  return MnemonicHdNodeProvider.fromData({
    words: [],
    privKey,
    chainCode
  }, getBip32Option(network))
}

export function createWalletData (mnemonic: string[], network: EnvironmentNetwork): WalletData {
  const mnemonicData = MnemonicHdNodeProvider.wordsToData(mnemonic, getBip32Option(network))
  return {
    version: 'v1',
    type: WalletType.MNEMONIC_UNPROTECTED,
    raw: JSON.stringify([mnemonicData.privKey, mnemonicData.chainCode])
  }
}

export function createWalletDataAbandon23 (network: EnvironmentNetwork): WalletData {
  return createWalletData([
    'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'art'
  ], network)
}

export const Mnemonic = {
  createProvider,
  createWalletData,
  createWalletDataAbandon23
}
