// import { Scrypt } from '@defichain/jellyfish-wallet-encrypted'
import { scrypt as nativeScrypt } from './scrypt.native'

export const scrypt = nativeScrypt // new Scrypt(new SimpleScryptsy())
