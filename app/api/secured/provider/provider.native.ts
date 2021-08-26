import * as ExpoSecureStore from 'expo-secure-store'
import { IStorage } from './index'

export const Provider: IStorage = {
  getItem: ExpoSecureStore.getItemAsync,
  setItem: ExpoSecureStore.setItemAsync,
  removeItem: ExpoSecureStore.deleteItemAsync
}
