import { PrivateKeyEncryption } from '@defichain/jellyfish-wallet-encrypted'

const WORDS_LENGTH = 24
/**
 * Android secure storage value limit: 2048 bytes
 * encrypted data must LTE 2048 ascii characters
 * 24 words + 23 spaces must  (~80 char per word after minus few encryption overhead)
 * concat words should not hit the limit
 */
const SECURE_STORE_MAX_LENGTH = 2048

class RawMnemonicEncryption {
  // jellyfish's PrivateKeyEncryption impl essentially work for infinite length of data
  constructor (private readonly encryption: PrivateKeyEncryption) {}

  static serialize (words: string[]): string {
    if (words.length !== WORDS_LENGTH) {
      throw new Error('Unexpected mnemonic word array length')
    }

    if (!(words.every(word => new RegExp('[a-z]').test(word)))) {
      throw new Error('Unexpected character')
    }

    let joined = words.join(' ')
    if (joined.length % 2 !== 0) {
      joined = `ODD${joined}`
    }
    return joined
  }

  static deserialize (joined: string): string[] {
    const words = joined.replace('ODD', '').split(' ')
    if (words.length !== WORDS_LENGTH) {
      throw new Error('Unexpected mnemonic word array length')
    }
    return words
  }

  async encrypt (words: string[], passphrase: string): Promise<string> {
    const joined = RawMnemonicEncryption.serialize(words)
    const buffer = Buffer.from(joined, 'ascii')
    const encrypted = await this.encryption.encrypt(buffer, passphrase)
    return encrypted.encode()
  }

  async decrypt (encrypted: string, passphrase: string): Promise<string[]> {
    const decrypted = await this.encryption.decrypt(encrypted, passphrase)
    const str = decrypted.toString('ascii')
    return RawMnemonicEncryption.deserialize(str)
  }
}

export const MnemonicWords = new RawMnemonicEncryption(new PrivateKeyEncryption())
