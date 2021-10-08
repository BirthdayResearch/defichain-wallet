import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'WALLET.TOGGLE_BALANCES'

async function set (isBalanceDisplayed: string): Promise<void> {
  await AsyncStorage.setItem(KEY, isBalanceDisplayed)
}

async function get (): Promise<string | null> {
  return await AsyncStorage.getItem(KEY)
}

export const ToggleBalancesPersistence = {
  set,
  get
}
