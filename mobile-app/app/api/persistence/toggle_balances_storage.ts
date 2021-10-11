import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'WALLET.TOGGLE_BALANCES'

async function set (isBalanceDisplayed: boolean): Promise<void> {
  await AsyncStorage.setItem(KEY, isBalanceDisplayed.toString())
}

async function get (): Promise<boolean> {
  return ['true', null].includes(await AsyncStorage.getItem(KEY))
}

export const ToggleBalancesPersistence = {
  set,
  get
}
