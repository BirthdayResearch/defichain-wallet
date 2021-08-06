import { StorageAPI } from '../storage'

const KEYS = {
  enrolled: 'BIOMETRIC.enrolled',
  passphrase: 'BIOMETRIC.passphrase'
}

async function get (): Promise<string | null> {
  if (!await isEnrolled()) return null
  return await StorageAPI.getItem(KEYS.passphrase)
}

async function set (passcode: string): Promise<void> {
  await StorageAPI.setItem(KEYS.enrolled, 'TRUE')
  await StorageAPI.setItem(KEYS.passphrase, passcode)
}

async function clear (): Promise<void> {
  await StorageAPI.removeItem(KEYS.enrolled)
  await StorageAPI.removeItem(KEYS.passphrase)
}

async function isEnrolled (): Promise<boolean> {
  return await StorageAPI.getItem(KEYS.enrolled) === 'TRUE'
}

/**
 * Failed passcode input counter persistence layer
 */
export const BiometricProtectedPasscode = {
  set,
  get,
  clear,
  isEnrolled
}
