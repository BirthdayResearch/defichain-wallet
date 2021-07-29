import { SimpleScryptsy, Scrypt } from '@defichain/jellyfish-wallet-encrypted'
import { Platform } from 'react-native'
import { scrypt as nativeScrypt } from './scrypt.native'

export const scrypt = Platform.OS === 'web'
  ? new Scrypt(new SimpleScryptsy())
  : nativeScrypt
