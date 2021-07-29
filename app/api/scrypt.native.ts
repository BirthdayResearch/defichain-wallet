import rnScrypt from 'react-native-scrypt'
import { ScryptProvider, ScryptParams, Scrypt } from '@defichain/jellyfish-wallet-encrypted'

const DEFAULT_SCRYPT_PARAMS: ScryptParams = {
  N: 16384,
  r: 8,
  p: 8
}

class NativeScryptModule implements ScryptProvider {
  async passphraseToKey (nfcUtf8: string, salt: Buffer, desiredKeyLen: number): Promise<Buffer> {
    return await rnScrypt(
      Buffer.from(nfcUtf8, 'ascii'),
      salt,
      DEFAULT_SCRYPT_PARAMS.N,
      DEFAULT_SCRYPT_PARAMS.r,
      DEFAULT_SCRYPT_PARAMS.p,
      desiredKeyLen,
      'buffer'
    )
  }
}

export const scrypt = new Scrypt(new NativeScryptModule())
