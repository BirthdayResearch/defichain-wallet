import AsyncStorage from '@react-native-async-storage/async-storage'
import { ColorSchemeName } from 'react-native'

const KEY = 'WALLET.THEME'

async function set (theme: NonNullable<ColorSchemeName>): Promise<void> {
  await AsyncStorage.setItem(KEY, theme)
}

async function get (): Promise<string | null> {
  return await AsyncStorage.getItem(KEY)
}

export const ThemePersistence = {
  set,
  get
}
