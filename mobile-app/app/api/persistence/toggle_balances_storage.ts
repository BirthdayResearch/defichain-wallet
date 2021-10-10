import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'WALLET.TOGGLE_BALANCES'

async function set (isBalanceDisplayed: boolean): Promise<void> {
  await AsyncStorage.setItem(KEY, isBalanceDisplayed ? 'TRUE' : 'FALSE')
}

async function get (): Promise<boolean> {
  return await AsyncStorage.getItem(KEY) === 'TRUE'
}

export const ToggleBalancesPersistence = {
  set,
  get
}
