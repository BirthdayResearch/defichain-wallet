import { Network } from '@defichain/jellyfish-network'
import { MnemonicHdNodeProvider, mnemonicToSeed } from '@defichain/jellyfish-wallet-mnemonic'
import { WalletData, WalletType } from './persistence'

function createProvider (data: WalletData, options: Network): MnemonicHdNodeProvider {
  const seed = Buffer.from(data.raw, 'hex')

  return MnemonicHdNodeProvider.fromSeed(seed, {
    bip32: {
      public: options.bip32.publicPrefix,
      private: options.bip32.privatePrefix
    },
    wif: options.wifPrefix
  })
}

export function createWalletData (mnemonic: string[]): WalletData {
  const seed = mnemonicToSeed(mnemonic)
  const hex = seed.toString('hex')
  return {
    version: 'v1',
    type: WalletType.MNEMONIC_UNPROTECTED,
    raw: hex
  }
}

export function createWalletDataAbandon23 (): WalletData {
  return createWalletData([
    'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'art'
  ])
}

export const Mnemonic = {
  createProvider,
  createWalletData,
  createWalletDataAbandon23
}
