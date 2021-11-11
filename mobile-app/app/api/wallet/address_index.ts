import { SecuredStoreAPI } from '@api'

const KEY = 'WALLET_ADDRESS.INDEX'

export type AddressIndexType = 'max' | 'active'

async function get (type: AddressIndexType): Promise<number> {
  const str = await SecuredStoreAPI.getItem(`${KEY}.${type}`)
  return str === undefined ? 0 : Number(str)
}

async function set (type: AddressIndexType, count: number): Promise<void> {
  await SecuredStoreAPI.setItem(`${KEY}.${type}`, `${count}`)
}

/**
 * max index to know how many addresses have been generated.
 * active index to know which index's address is active.
 */
export const WalletAddressIndexPersistence = {
  set,
  get
}
