import SecureStore from 'expo-secure-store'
import { getEnvironment } from '../environment'
import { getNetwork } from './storage'

async function getKey (key: string): Promise<string> {
  const env = getEnvironment()
  const network = await getNetwork()
  return `${env.name}.${network}.${key}`
}

/**
 * @param key {string} of item with 'environment' and 'network' prefixed
 * @return {string | null}
 */
export async function getItem (key: string): Promise<string | null> {
  return await SecureStore.getItemAsync(await getKey(key))
}

/**
 * @param key {string} of item with 'environment' and 'network' prefixed
 * @param value {string} to set
 */
export async function setItem (key: string, value: string): Promise<void> {
  return await SecureStore.setItemAsync(await getKey(key), value)
}

/**
 * @param key {string} of item with 'environment' and 'network' prefixed
 */
export async function removeItem (key: string): Promise<void> {
  await SecureStore.deleteItemAsync(await getKey(key))
}
