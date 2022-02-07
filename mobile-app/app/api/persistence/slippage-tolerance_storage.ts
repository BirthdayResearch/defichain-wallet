import AsyncStorage from '@react-native-async-storage/async-storage'
import BigNumber from 'bignumber.js'

const KEY = 'WALLET.SLIPPAGE_TOLERANCE'

async function set (slippageTolerance: NonNullable<BigNumber>): Promise<void> {
  await AsyncStorage.setItem(KEY, slippageTolerance.toString())
}
async function get (): Promise<BigNumber> {
  const slippageVal = await AsyncStorage.getItem(KEY) ?? '1'
  return JSON.parse(slippageVal)
}

export const SlippageTolerancePersistence = {
  set,
  get
}
