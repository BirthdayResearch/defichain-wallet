import AsyncStorage from '@react-native-async-storage/async-storage'
import { defaultDefichainURL } from '@screens/AppNavigator/screens/Settings/screens/ServiceProviderScreen'

const KEY = 'WALLET.SERVICE_PROVIDER_URL'

async function set (url: NonNullable<string>): Promise<void> {
  await AsyncStorage.setItem(KEY, url)
}

async function get (): Promise<string> {
  const val = await AsyncStorage.getItem(KEY)
  return val != null ? val : defaultDefichainURL
}

export const ServiceProviderPersistence = {
  get, 
  set
}