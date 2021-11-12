import { SecuredStoreAPI } from '@api'

const KEY = 'WALLET_ADDRESS.INDEX'

async function getLength (): Promise<number> {
  const str = await SecuredStoreAPI.getItem(`${KEY}.length`)
  return str === undefined ? 0 : Number(str)
}

async function setLength (count: number): Promise<void> {
  await SecuredStoreAPI.setItem(`${KEY}.length`, `${count}`)
}

async function getActive (): Promise<number> {
  const str = await SecuredStoreAPI.getItem(`${KEY}.active`)
  return str === undefined ? 0 : Number(str)
}

async function setActive (count: number): Promise<void> {
  await SecuredStoreAPI.setItem(`${KEY}.active`, `${count}`)
}

/**
 * max index to know how many addresses have been generated.
 * active index to know which index's address is active.
 */
export const WalletAddressIndexPersistence = {
  getLength,
  setLength,
  getActive,
  setActive
}
