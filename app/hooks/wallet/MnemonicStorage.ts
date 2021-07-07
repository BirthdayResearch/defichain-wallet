import { Network } from '@defichain/jellyfish-network'
import { MnemonicHdNodeProvider } from '@defichain/jellyfish-wallet-mnemonic'
import { mnemonicToSeed } from '@defichain/jellyfish-wallet-mnemonic/dist/mnemonic'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'MNEMONIC_WALLET_HD_NODE_SEED'

/**
 * Do not access MnemonicStorage directly access it through hooks for shared state
 * @deprecated
 */
export class MnemonicStorage {
  constructor (private readonly network: Network) {
  }

  async getHdNodeProvider (): Promise<MnemonicHdNodeProvider> {
    const seed = await MnemonicStorage.getSeed()
    if (seed === undefined) {
      throw new Error('attempting to getHdNodeProvider() without having any seed stored')
    }
    return MnemonicHdNodeProvider.fromSeed(seed, {
      bip32: {
        public: this.network.bip32.publicPrefix,
        private: this.network.bip32.privatePrefix
      },
      wif: this.network.wifPrefix
    })
  }

  static async clear (): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY)
  }

  static async setMnemonic (mnemonic: string[]): Promise<void> {
    const seed = mnemonicToSeed(mnemonic)
    await MnemonicStorage.setSeed(seed)
  }

  static async hasSeed (): Promise<boolean> {
    const seed = await AsyncStorage.getItem(STORAGE_KEY)
    return seed != null
  }

  private static async getSeed (): Promise<Buffer | undefined> {
    const seed: string | null = await AsyncStorage.getItem(STORAGE_KEY)
    if (seed == null) {
      return undefined
    }
    return Buffer.from(seed, 'hex')
  }

  private static async setSeed (seed: Buffer): Promise<void> {
    // TODO(fuxingloh): need to introduce encryption at rest
    const hex = seed.toString('hex')
    await AsyncStorage.setItem(STORAGE_KEY, hex)
  }
}
