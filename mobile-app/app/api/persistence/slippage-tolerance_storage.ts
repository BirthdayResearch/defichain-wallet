import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'WALLET.SLIPPAGE_TOLERANCE'

async function set (slippageTolerance: NonNullable<string>): Promise<void> {
  await AsyncStorage.setItem(KEY, slippageTolerance)
}

async function get (): Promise<string> {
  const slippageVal = await AsyncStorage.getItem(KEY) ?? '1'
  return JSON.parse(slippageVal)
}

export const SlippageTolerancePersistence = {
  set,
  get
}
