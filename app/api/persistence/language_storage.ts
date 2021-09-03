import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'WALLET.LANGUAGE'

async function set (language: NonNullable<string>): Promise<void> {
  await AsyncStorage.setItem(KEY, language)
}

async function get (): Promise<string | null> {
  return await AsyncStorage.getItem(KEY)
}

export const LanguagePersistence = {
  set,
  get
}
