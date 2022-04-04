import AsyncStorage from '@react-native-async-storage/async-storage'

class StorageServiceClass {
  public Keys = {
    Ref: 'ref',
    WalletId: 'wallet_id',
    Credentials: 'credentials'
  }

  public async storeValue<T>(key: string, value: T): Promise<T> {
    return await AsyncStorage.setItem(key, JSON.stringify(value)).then(() => value)
  }

  public async getValue<T>(key: string): Promise<T> {
    return await AsyncStorage.getItem(key).then((data) => JSON.parse(data ?? '{}'))
  }

  public async getPrimitive<T>(key: string): Promise<T | undefined> {
    return await AsyncStorage.getItem(key)
      .then((data) => (data !== null ? JSON.parse(data) : undefined))
      .catch(() => undefined)
  }

  public async deleteValue (key: string): Promise<void> {
    return await AsyncStorage.removeItem(key)
  }
}

export const StorageService = new StorageServiceClass()
