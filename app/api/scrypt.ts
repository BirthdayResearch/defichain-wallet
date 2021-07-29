import { Scrypt } from '@defichain/jellyfish-wallet-encrypted'
import { Platform } from 'react-native'
import { scrypt as nativeScrypt } from './scrypt.native'

export const scrypt = Platform.OS === 'web'
  // eslint-disable-next-line
  ? new Scrypt(new (require('@defichain/jellyfish-wallet-encrypted')).SimpleScryptsy())
  : nativeScrypt
