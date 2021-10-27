import { PrivateKeyEncryption, Scrypt } from '@defichain/jellyfish-wallet-encrypted'
import { entropyAsMnemonic, mnemonicAsEntropy } from '@defichain/jellyfish-wallet-mnemonic'
import { getRandomBytes } from 'expo-random'
import { SecuredStoreAPI } from '@api'

const KEY = 'ENCRYPTED_MNEMONIC_STORAGE.entropy'

/**
 * Raw mnemonic words encryption implementation reside in light wallet
 */
class EncryptedMnemonicStorage {
  /**
   * jellyfish's PrivateKeyEncryption impl essentially work for infinite length of data
   */
  private readonly encryption: PrivateKeyEncryption

  constructor () {
    this.encryption = new PrivateKeyEncryption(new Scrypt(), numOfBytes => {
      const bytes = getRandomBytes(numOfBytes)
      return Buffer.from(bytes)
    })
  }

  /**
   * Encrypt mnemonic words, and store into persistent storage.
   *
   * @param {string[]} words
   * @param {string} passphrase
   */
  async set (words: string[], passphrase: string): Promise<void> {
    const buffer = mnemonicAsEntropy(words)
    const encryptedData = await this.encryption.encrypt(buffer, passphrase)
    const encoded = encryptedData.encode()
    await SecuredStoreAPI.setItem(KEY, encoded)
  }

  /**
   * Retrieve encrypted value from secure store, deserialize, decrypt, deserialize buffer (decryption result) into words array
   *
   * @param {string} passphrase
   * @returns {string[]}
   */
  async get (passphrase: string): Promise<string[]> {
    const encrypted = await SecuredStoreAPI.getItem(KEY)
    if (encrypted === null || encrypted === undefined) {
      throw new Error('NO_MNEMONIC_BACKUP')
    }

    const buffer = await this.encryption.decrypt(encrypted, passphrase)
    return entropyAsMnemonic(buffer)
  }
}

export const MnemonicStorage = new EncryptedMnemonicStorage()
