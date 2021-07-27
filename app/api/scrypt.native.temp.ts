import rnScrypt from 'react-native-scrypt'
import { ScryptProvider, ScryptParams, Scrypt } from '@defichain/jellyfish-wallet-encrypted'

const DEFAULT_SCRYPT_PARAMS: ScryptParams = {
  N: 16384,
  r: 8,
  p: 8
}

class NativeScryptModule implements ScryptProvider {
  passphraseToKey (nfcUtf8: string, salt: Buffer, desiredKeyLen: number): Buffer {
    let result: Buffer | null = null
    let err: Error | null = null
    rnScrypt(
      Buffer.from(nfcUtf8, 'ascii'),
      salt,
      DEFAULT_SCRYPT_PARAMS.N,
      DEFAULT_SCRYPT_PARAMS.r,
      DEFAULT_SCRYPT_PARAMS.p,
      desiredKeyLen,
      'buffer'
    )
      .then(buffer => { result = buffer })
      .catch((e: Error) => { err = e })

    const start = Date.now()
    while (true) {
      if (result !== null) {
        return result
      }
      if (err !== null || (Date.now() > start + 10000)) throw new Error()
    }
  }
}

export const scrypt = new Scrypt(new NativeScryptModule())
