import { useEffect, useState } from 'react'
import { ColorSchemeName } from 'react-native'
import { Logging } from '../api'
import { ThemePersistence } from '../api/wallet/theme_storage'
import { useColorScheme } from './useColorScheme'

interface Theme {
  theme: NonNullable<ColorSchemeName>
  isThemeLoaded: boolean
  setTheme: (theme: NonNullable<ColorSchemeName>) => void
}

export function useTheme (): Theme {
  const colorScheme = useColorScheme()
  const [isThemeLoaded, setIsThemeLoaded] = useState<boolean>(false)
  const [theme, setTheme] = useState<NonNullable<ColorSchemeName>>('light')

  useEffect(() => {
    ThemePersistence.get().then((t) => {
      const currentTheme = (t === null || t === undefined) ? colorScheme : t as NonNullable<ColorSchemeName>
      setTheme(currentTheme)
    }).catch((err) => Logging.error(err)).finally(() => setIsThemeLoaded(true))
  }, [])

  return {
    isThemeLoaded,
    theme,
    setTheme
  }
}
