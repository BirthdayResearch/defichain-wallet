import { DarkTheme, DefaultTheme } from '@react-navigation/native'
import { Theme } from '@react-navigation/native/lib/typescript/src/types'
import { theme } from '../tailwind.config'

export function getDefaultTheme (isLight: boolean): Theme {
  const defaultTheme = isLight ? DefaultTheme : DarkTheme
  return {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: isLight ? theme.extend.colors.primary[500] : theme.extend.colors.dfxred[500],
      card: isLight ? defaultTheme.colors.card : theme.extend.colors.dfxblue[900],
      border: isLight ? defaultTheme.colors.border : theme.extend.colors.dfxblue[800],
      background: isLight ? defaultTheme.colors.background : theme.extend.colors.dfxblue[900] // TODO: (thabrad) check => should remove?
    }
  }
}
