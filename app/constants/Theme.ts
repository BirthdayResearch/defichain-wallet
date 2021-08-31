import { DarkTheme, DefaultTheme } from '@react-navigation/native'
import { Theme } from '@react-navigation/native/lib/typescript/src/types'
import { theme } from '../tailwind.config'

export function getDefaultTheme (isLight: boolean): Theme {
  const defaultTheme = isLight ? DefaultTheme : DarkTheme
  return {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: isLight ? theme.extend.colors.primary[500] : theme.extend.colors.darkprimary[500],
      card: isLight ? defaultTheme.colors.card : theme.extend.colors.blue[900],
      border: isLight ? defaultTheme.colors.border : theme.extend.colors.blue[800]
    }
  }
}
