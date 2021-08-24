import { DarkTheme, DefaultTheme } from '@react-navigation/native'
import { Theme } from '@react-navigation/native/lib/typescript/src/types'
import { ColorSchemeName } from 'react-native'

export function getDefaultTheme (theme: NonNullable<ColorSchemeName>): Theme {
  const isLight = theme === 'light'
  const defaultTheme = isLight ? DefaultTheme : DarkTheme
  return {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: isLight ? '#ff00af' : '#EE2CB1',
      card: isLight ? defaultTheme.colors.card : '#262626'
    }
  }
}
