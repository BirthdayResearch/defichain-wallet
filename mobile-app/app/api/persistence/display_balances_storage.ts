import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'WALLET.IS_BALANCES_DISPLAYED'

async function set (isBalancesDisplayed: boolean): Promise<void> {
  await AsyncStorage.setItem(KEY, isBalancesDisplayed.toString())
}

async function get (): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEY)
  return val !== 'false'
}

export const DisplayBalancesPersistence = {
  set,
  get
}
