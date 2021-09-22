import { SecuredStoreAPI } from '@api'

const KEY = 'PRIVACY_LOCK.enrolled'

async function set (enabled: boolean): Promise<void> {
  const val = enabled ? 'TRUE' : 'FALSE'
  await SecuredStoreAPI.setItem(KEY, val)
}

async function isEnabled (): Promise<boolean> {
  return await SecuredStoreAPI.getItem(KEY) === 'TRUE'
}

/**
 * Failed passcode input counter persistence layer
 */
export const PrivacyLockPersistence = {
  set,
  isEnabled
}
