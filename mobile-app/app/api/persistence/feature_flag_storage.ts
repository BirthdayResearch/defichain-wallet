import AsyncStorage from '@react-native-async-storage/async-storage'
import { FEATURE_FLAG_ID } from '@shared-types/website'

const KEY = 'WALLET.ENABLED_FEATURES'

async function set (features: FEATURE_FLAG_ID[] = []): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(features))
}

async function get (): Promise<FEATURE_FLAG_ID[]> {
  const features = await AsyncStorage.getItem(KEY) ?? '[]'
  return JSON.parse(features)
}

export const FeatureFlagPersistence = {
  set,
  get
}
