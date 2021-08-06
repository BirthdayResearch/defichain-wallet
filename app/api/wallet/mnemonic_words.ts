import { PrivateKeyEncryption } from '@defichain/jellyfish-wallet-encrypted'
import { StorageAPI } from '../storage'

const KEY = 'RAW_MNEMONIC_V0.space_separated_values'
const WORDS_LENGTH = 24
/**
 * Android secure storage value limit: 2048 bytes
 * encrypted data must LTE 2048 ascii characters
 * 24 words + 23 spaces must  (~80 char per word after minus few encryption overhead)
 * concat words should not hit the limit
 */
const SECURE_STORE_MAX_LENGTH = 2048

/**
 * Raw mnemonic words encryption implementation reside in light wallet
 */
class RawMnemonicEncryption {
  // jellyfish's PrivateKeyEncryption impl essentially work for infinite length of data
  constructor (private readonly encryption: PrivateKeyEncryption) {}

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
    const joined = RawMnemonicEncryption.serialize(words)
    const buffer = Buffer.from(joined, 'ascii')
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
    const str = decrypted.toString('ascii')
    return RawMnemonicEncryption.deserialize(str)
  }

  /**
   * Encrypt mnemonic words, and store into persistent storage.
   *
   * @param {string[]} words
   * @param {string} passphrase
   */
  async encrypt (words: string[], passphrase: string): Promise<void> {
    const encrypted = await this._encrypt(words, passphrase)
    if (encrypted.length > SECURE_STORE_MAX_LENGTH) throw new Error('Data exceeded secure storage limit')
    await StorageAPI.setItem(KEY, encrypted)
  }

  /**
   * Retrieve encrypted value from secure store, deserialize, decrypt, deserialize buffer (decryption result) into words array
   *
   * @param {string} passphrase
   * @returns {string[]}
   */
  async decrypt (passphrase: string): Promise<string[]> {
    const encrypted = await StorageAPI.getItem(KEY)
    if (encrypted === null) throw new Error('NO_MNEMONIC_BACKUP')
    return await this._decrypt(encrypted, passphrase)
  }
}

export const MnemonicWords = new RawMnemonicEncryption(new PrivateKeyEncryption())
