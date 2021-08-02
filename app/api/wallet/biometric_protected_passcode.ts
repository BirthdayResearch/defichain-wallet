/**
 * @WARNING
 * This is a simple SecureStorage accessing API to read/write user's raw passcode
 * The storage is encrypted and only accessible if device is unlocked
 * These API should NOT be consumed if user's device is not protected by pin/biometric
 * These API should NOT be consumed for jailbroken device, the passcode (thus the wallet private key) is considered compromised
 *
 * MUST USE SECURE STORE ONLY
 */
import SecureStore from 'expo-secure-store'

const KEY = 'RAW_PASSCODE.value'

async function get (): Promise<string | null> {
  return await SecureStore.getItemAsync(KEY)
}

async function set (passcode: string): Promise<void> {
  await SecureStore.setItemAsync(KEY, passcode)
}

async function clear (): Promise<void> {
  await SecureStore.deleteItemAsync(KEY)
}

/**
 * Failed passcode input counter persistence layer
 */
export const PasscodeAttemptCounter = {
  set,
  get,
  clear
}
