import AsyncStorage from '@react-native-async-storage/async-storage'
import { PoolpairId } from '@screens/AppNavigator/screens/Dex/hook/FavouritePoolpairs'

const KEY = 'WALLET.FAVOURITE_POOLPAIRS'

async function set (poolpairs: PoolpairId[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(poolpairs))
}

async function get (): Promise<PoolpairId[]> {
  const features = await AsyncStorage.getItem(KEY) ?? '[]'
  return JSON.parse(features)
}

export const FavouritePoolpairsPersistence = {
  set,
  get
}
