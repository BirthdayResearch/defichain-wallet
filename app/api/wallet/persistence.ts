import { StorageAPI } from '../storage'

export enum WalletType {
  MNEMONIC_UNPROTECTED = 'MNEMONIC_UNPROTECTED'
}

export interface WalletPersistenceData<T> {
  type: WalletType
  /* To migrate between app version upgrade */
  version: 'v1'
  /* Raw Data encoded in WalletType specified format */
  raw: T
}

async function get (): Promise<Array<WalletPersistenceData<any>>> {
  const json = await StorageAPI.getItem('WALLET')

  if (json !== null) {
    return JSON.parse(json)
  }

  return []
}

async function set (wallets: Array<WalletPersistenceData<any>>): Promise<void> {
  await StorageAPI.setItem('WALLET', JSON.stringify(wallets))
}

/**
 * Multi Wallet Persistence Layer
 */
export const WalletPersistence = {
  set,
  get
}
