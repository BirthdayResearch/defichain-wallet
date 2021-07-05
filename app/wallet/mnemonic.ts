import { MnemonicHdNodeProvider, mnemonicToSeed } from '@defichain/jellyfish-wallet-mnemonic'
import { getNetworkOptions } from './network'
import { WalletData, WalletStorage, WalletType } from './persistence'

export async function getMnemonicHdNodeProvider (data: WalletData): Promise<MnemonicHdNodeProvider> {
  const seed = Buffer.from(data.raw, 'hex')

  const network = await getNetworkOptions()
  return MnemonicHdNodeProvider.fromSeed(seed, {
    bip32: {
      public: network.bip32.publicPrefix,
      private: network.bip32.privatePrefix
    },
    wif: network.wifPrefix
  })
}

export async function addMnemonicHdNodeProvider (mnemonic: string[]): Promise<void> {
  const seed = mnemonicToSeed(mnemonic)
  const hex = seed.toString('hex')
  await WalletStorage.add({
    version: 'v1',
    type: WalletType.MNEMONIC_UNPROTECTED,
    raw: hex
  })
}
