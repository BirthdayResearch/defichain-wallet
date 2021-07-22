import { getEnvironment } from '../environment'
import { getNetwork } from './storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

export async function getKey (key: string): Promise<string> {
  const env = getEnvironment()
  const network = await getNetwork()
  return `${env.name}.${network}.${key}`
}

export interface ISecureStore {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

class WebAsyncStorage implements ISecureStore {
  /**
   * @param key {string} of item with 'environment' and 'network' prefixed
   * @return {string | null}
   */
  async getItem (key: string): Promise<string | null> {
    return await AsyncStorage.getItem(await getKey(key))
  }

  /**
   * @param key {string} of item with 'environment' and 'network' prefixed
   * @param value {string} to set
   */
  async setItem (key: string, value: string): Promise<void> {
    return await AsyncStorage.setItem(await getKey(key), value)
  }

  /**
   * @param key {string} of item with 'environment' and 'network' prefixed
   */
  async removeItem (key: string): Promise<void> {
    await AsyncStorage.removeItem(await getKey(key))
  }
}

export const SecureStorage = new WebAsyncStorage()
