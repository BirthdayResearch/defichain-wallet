import { MnemonicHdNodeProvider, mnemonicToSeed } from '@defichain/jellyfish-wallet-mnemonic'
import { getJellyfishNetwork } from './network'
import { WalletData, WalletPersistence, WalletType } from './persistence'

export async function getMnemonicHdNodeProvider (data: WalletData): Promise<MnemonicHdNodeProvider> {
  const seed = Buffer.from(data.raw, 'hex')

  const network = await getJellyfishNetwork()
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
  await WalletPersistence.add({
    version: 'v1',
    type: WalletType.MNEMONIC_UNPROTECTED,
    raw: hex
  })
}
