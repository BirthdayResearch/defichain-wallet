import { Platform } from 'react-native'
import ExpoSecureStore from 'expo-secure-store'
import { ISecureStore, getKey } from './secure_store'

class NativeSecureStore implements ISecureStore {
  /**
   * @param key {string} of item with 'environment' and 'network' prefixed
   * @return {string | null}
   */
  async getItem (key: string): Promise<string | null> {
    return await ExpoSecureStore.getItemAsync(await getKey(key))
  }

  /**
   * @param key {string} of item with 'environment' and 'network' prefixed
   * @param value {string} to set
   */
  async setItem (key: string, value: string): Promise<void> {
    return await ExpoSecureStore.setItemAsync(await getKey(key), value)
  }

  /**
   * @param key {string} of item with 'environment' and 'network' prefixed
   */
  async removeItem (key: string): Promise<void> {
    await ExpoSecureStore.deleteItemAsync(await getKey(key))
  }
}

console.log(Platform.OS)
export const SecureStorage = new NativeSecureStore()
