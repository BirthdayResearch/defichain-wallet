import { MnemonicHdNodeProvider, mnemonicToSeed } from '@defichain/jellyfish-wallet-mnemonic'
import { getItem, removeItem, setItem } from '../storage'
import { getNetworkOptions } from './network'

const KEY = 'MNEMONIC_SEED'

async function getSeed (): Promise<Buffer | undefined> {
  const seed: string | null = await getItem(KEY)
  if (seed == null) {
    return undefined
  }

  return Buffer.from(seed, 'hex')
}

export async function getMnemonicHdNodeProvider (): Promise<MnemonicHdNodeProvider> {
  const seed = await getSeed()
  if (seed === undefined) {
    throw new Error('attempting to getMnemonicHdNodeProvider() without having any seed stored')
  }

  const network = await getNetworkOptions()
  return MnemonicHdNodeProvider.fromSeed(seed, {
    bip32: {
      public: network.bip32.publicPrefix,
      private: network.bip32.privatePrefix
    },
    wif: network.wifPrefix
  })
}

export async function setMnemonicHdNodeProvider (mnemonic: string[]): Promise<void> {
  const seed = mnemonicToSeed(mnemonic)
  const hex = seed.toString('hex')
  await setItem(KEY, hex)
}

export async function hasMnemonicHdNodeProvider (): Promise<boolean> {
  return await getItem(KEY) !== null
}

export async function clearMnemonicHdNodeProvider (): Promise<void> {
  await removeItem(KEY)
}
