import AsyncStorage from '@react-native-async-storage/async-storage'
import BigNumber from 'bignumber.js'

const KEY = 'WALLET.SLIPPAGE_TOLERANCE'

async function set (slippageTolerance: NonNullable<BigNumber>): Promise<void> {
  await AsyncStorage.setItem(KEY, slippageTolerance.toFixed(8))
}
async function get (): Promise<string> {
  const slippageVal = await AsyncStorage.getItem(KEY) ?? '1'
  return JSON.parse(slippageVal)
}

export const SlippageTolerancePersistence = {
  set,
  get
}
