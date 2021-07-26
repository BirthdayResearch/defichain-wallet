import AsyncStorage from '@react-native-async-storage/async-storage'
import { IStorage } from './index'

/**
 * NOTE: We don't officially support web platform yet.
 */
export const Provider: IStorage = {
  getItem: AsyncStorage.getItem,
  setItem: AsyncStorage.setItem,
  removeItem: AsyncStorage.removeItem
}
