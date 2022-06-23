import { DarkTheme, DefaultTheme } from '@react-navigation/native'
import { Theme } from '@react-navigation/native/lib/typescript/src/types'

export function getDefaultTheme (isLight: boolean): Theme {
  const defaultTheme = isLight ? DefaultTheme : DarkTheme
  return {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: isLight ? '#121212' : '#F2F2F2',
      card: isLight ? defaultTheme.colors.card : '#262626'
    }
  }
}
