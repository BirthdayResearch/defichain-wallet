import { getItem, setItem } from '../storage'

export enum WalletType {
  MNEMONIC_UNPROTECTED = 'MNEMONIC_UNPROTECTED',
  MNEMONIC_ENCRYPTED = 'MNEMONIC_ENCRYPTED'
}

export interface WalletPersistenceData<T> {
  type: WalletType
  /* To migrate between app version upgrade */
  version: 'v1'
  /* Raw Data encoded in WalletType specified format */
  raw: T
}

async function get (): Promise<Array<WalletPersistenceData<any>>> {
  const json = await getItem('WALLET')
  if (json !== null) {
    return JSON.parse(json)
  }

  return []
}

async function set (wallets: Array<WalletPersistenceData<any>>): Promise<void> {
  await setItem('WALLET', JSON.stringify(wallets))
}

async function add (data: WalletPersistenceData<any>): Promise<void> {
  const wallets = await get()
  wallets.push(data)
  await set(wallets)
}

async function remove (index: number): Promise<void> {
  const wallets = await get()
  wallets.splice(index, 1)
  await set(wallets)
}

/**
 * Multi Wallet Persistence Layer
 */
export const WalletPersistence = {
  set,
  get,
  add,
  remove
}
