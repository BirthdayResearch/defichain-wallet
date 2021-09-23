import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Display dex guideline storage provider
*/
const KEY = 'WALLET.DISPLAY_DEXGUIDELINES'

async function set (dexVisited: boolean): Promise<void> {
  await AsyncStorage.setItem(KEY, dexVisited.toString())
}

async function get (): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEY)
  return val !== 'false'
}

export const DisplayDexGuidelinesPersistence = {
  set,
  get
}
