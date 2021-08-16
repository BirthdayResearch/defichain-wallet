import { PrivateKeyEncryption, Scrypt } from '@defichain/jellyfish-wallet-encrypted'
import { getRandomBytes } from 'expo-random'
import { StorageAPI } from '../storage'

const KEY = 'RAW_MNEMONIC_V0.space_separated_values'
const WORDS_LENGTH = 24

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
   * Serialize words into single string
   * Private, API consumer not meant to alter any the serialization
   *
   * @param {string[]} words
   * @returns {string}
   * @throws Error if words array is not 24 items long
   * @throws Error if any word has non lower case alphabet (case insensitive, and no special character allowed)
   */
  private static serialize (words: string[]): string {
    if (words.length !== WORDS_LENGTH) {
      throw new Error('Unexpected mnemonic word array length')
    }

    if (!(words.every(word => new RegExp('[a-z]').test(word)))) {
      throw new Error('Unexpected character')
    }

    let joined = words.join(' ')
    if (joined.length % 2 !== 0) {
      joined = `ODD${joined}` // encryption library require input to has even number length
    }
    return joined
  }

  /**
   * Reverse `serialize`
   * Private, API consumer not meant to alter any the serialization
   *
   * @param {string} joined
   * @returns {string[]}
   */
  private static deserialize (joined: string): string[] {
    const words = joined.replace('ODD', '').split(' ')
    if (words.length !== WORDS_LENGTH) {
      throw new Error('Unexpected mnemonic word array length')
    }
    return words
  }

  /**
   * Serialize mnemonic words, encrypt, serialize encrypted (in buffer) into ascii string to be stored
   *
   * @param {string[]} words
   * @param {string} passphrase
   * @returns {string}
   */
  private async _encrypt (words: string[], passphrase: string): Promise<string> {
    const joined = EncryptedMnemonicStorage.serialize(words)
    const buffer = Buffer.from(joined, 'utf-8')
    const encrypted = await this.encryption.encrypt(buffer, passphrase)
    return encrypted.encode()
  }

  /**
   * Decrypt serialized encryption result back to mnemonic words
   * Reverse `_encrypt`
   *
   * @param {string} encrypted
   * @param {string} passphrase
   * @returns {string[]}
   */
  private async _decrypt (encrypted: string, passphrase: string): Promise<string[]> {
    const decrypted = await this.encryption.decrypt(encrypted, passphrase)
    const str = decrypted.toString('utf-8')
    return EncryptedMnemonicStorage.deserialize(str)
  }

  /**
   * Encrypt mnemonic words, and store into persistent storage.
   *
   * @param {string[]} words
   * @param {string} passphrase
   */
  async set (words: string[], passphrase: string): Promise<void> {
    const encrypted = await this._encrypt(words, passphrase)
    await StorageAPI.setItem(KEY, encrypted)
  }

  /**
   * Retrieve encrypted value from secure store, deserialize, decrypt, deserialize buffer (decryption result) into words array
   *
   * @param {string} passphrase
   * @returns {string[]}
   */
  async get (passphrase: string): Promise<string[]> {
    const encrypted = await StorageAPI.getItem(KEY)
    if (encrypted === null) throw new Error('NO_MNEMONIC_BACKUP')
    return await this._decrypt(encrypted, passphrase)
  }
}

export const MnemonicStorage = new EncryptedMnemonicStorage()
