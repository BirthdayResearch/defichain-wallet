import { ScryptProvider, Scrypt } from '@defichain/jellyfish-wallet-encrypted'
import * as crypto from 'expo-crypto'

// TODO: this is quick mock, required secured secret derivation
class Mock implements ScryptProvider {
  async passphraseToKey (nfcUtf8: string, salt: Buffer, desiredKeyLen: number): Promise<Buffer> {
    if (desiredKeyLen !== 64) throw new Error('This is mocked for jellyfish-wallet-encrypted v0.31.0 use only, pending for any length support')
    const hashString = await crypto.digestStringAsync(crypto.CryptoDigestAlgorithm.SHA512, nfcUtf8)
    return Buffer.from(hashString, 'hex')
  }
}

function randomBytes (len: number): Buffer {
  const buff = Buffer.alloc(len)
  for (let i = 0; i < len; i += 1) {
    buff[i] = Math.floor(256 * Math.random())
  }
  return buff
}

export const scrypt = new Scrypt(new Mock(), randomBytes)
