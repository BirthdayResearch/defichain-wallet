import { SecuredStoreAPI } from '@api'

const KEY = 'PASSCODE_ATTEMPT.count'

async function get (): Promise<number> {
  const str = await SecuredStoreAPI.getItem(KEY)
  return str === undefined ? 0 : Number(str)
}

async function set (count: number): Promise<void> {
  await SecuredStoreAPI.setItem(KEY, `${count}`)
}

/**
 * Failed passcode input counter persistence layer
 */
export const PasscodeAttemptCounter = {
  set,
  get
}
