import { AdvertisementInfo } from '@hooks/useAdvertisement'
import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'APP.ADVERTISEMENT'

async function set (settings: AdvertisementInfo): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings))
}

async function get (): Promise<AdvertisementInfo> {
  const features = await AsyncStorage.getItem(KEY) ?? '{}'
  return JSON.parse(features)
}

export const AdvertisementPersistence = {
  set,
  get
}
