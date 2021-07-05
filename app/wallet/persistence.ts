import { getItem, setItem } from '../storage'

const KEY = 'WALLET'

export enum WalletType {
  MNEMONIC_UNPROTECTED = 'MNEMONIC_UNPROTECTED',
  // MNEMONIC_PASSWORD = 'MNEMONIC_PASSWORD',
  // MNEMONIC_BIOMETRIC = 'MNEMONIC_BIOMETRIC',
  // LEDGER_BLUE = 'LEDGER_BLUE',
}

export interface WalletData {
  type: WalletType
  /* To migrate between app version upgrade */
  version: 'v1'
  /* Raw Data encoded in WalletType specified format */
  raw: string
}

async function get (): Promise<WalletData[]> {
  const json = await getItem(KEY)
  if (json !== null) {
    return JSON.parse(json)
  }

  return []
}

async function set (wallets: WalletData[]): Promise<void> {
  await setItem(KEY, JSON.stringify(wallets))
}

async function add (data: WalletData): Promise<void> {
  const wallets = await get()
  wallets.push(data)
  await set(wallets)
}

async function remove (index: number): Promise<void> {
  const wallets = await get()
  wallets.splice(index, 1)
  await set(wallets)
}

export const WalletStorage = {
  get,
  add,
  remove
}
