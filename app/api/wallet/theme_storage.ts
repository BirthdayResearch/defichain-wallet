import { ColorSchemeName } from 'react-native'
import { StorageAPI } from '../storage'

const KEY = 'WALLET.THEME'

async function set (theme: NonNullable<ColorSchemeName>): Promise<void> {
  await StorageAPI.setItem(KEY, theme)
}

async function get (): Promise<string | null> {
  return await StorageAPI.getItem(KEY)
}

export const ThemePersistence = {
  set,
  get
}
