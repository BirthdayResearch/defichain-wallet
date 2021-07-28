import { StorageAPI } from '../storage'

const KEY = 'PASSCODE_ERROR.count'

async function get (): Promise<number> {
  const str = await StorageAPI.getItem(KEY)
  return str === undefined ? 0 : Number(str)
}

async function set (count: number): Promise<void> {
  await StorageAPI.setItem(KEY, `${count}`)
}

/**
 * Failed passcode input counter persistence layer
 */
export const PasscodeAttemptCounter = {
  set,
  get
}
