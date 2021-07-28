import { StorageAPI } from '../storage'

const KEY = 'PASSCODE_ERROR.count'

async function get (): Promise<number> {
  const str = await StorageAPI.getItem(KEY)
  return str === undefined ? 0 : Number(str)
}

/**
 * @param wallets to set, override previous set wallet
 */
async function set (count: number): Promise<void> {
  await StorageAPI.setItem(KEY, `${count}`)
}

/**
 * Multi Wallet Persistence Layer
 */
export const PasscodeAttemptCounter = {
  set,
  get
}
