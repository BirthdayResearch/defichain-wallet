import React, { createContext, useContext, useEffect, useState } from 'react'
import { ColorSchemeName } from 'react-native'
import { Logging, ThemePersistence } from '@api'

interface ThemeLoader {
  theme: NonNullable<ColorSchemeName>
  isThemeLoaded: boolean
}

export function useTheme (): ThemeLoader {
  // const colorScheme = useColorScheme() //  TODO(david): re-enable
  const [isThemeLoaded, setIsThemeLoaded] = useState<boolean>(false)
  const [theme, setTheme] = useState<NonNullable<ColorSchemeName>>('dark')

  useEffect(() => {
    ThemePersistence.get().then((t) => {
      let currentTheme: NonNullable<ColorSchemeName> = 'dark'
      if (t !== null && t !== undefined) {
        currentTheme = t as NonNullable<ColorSchemeName>
      // } else if (colorScheme !== null && colorScheme !== undefined) {
      //   currentTheme = colorScheme
      }
      setTheme(currentTheme)
    }).catch((err) => Logging.error(err)).finally(() => setIsThemeLoaded(true))
  }, [])

  return {
    isThemeLoaded,
    theme
  }
}

interface Theme {
  theme: NonNullable<ColorSchemeName>
  setTheme: (theme: NonNullable<ColorSchemeName>) => void
  isLight: boolean
}

const ThemeContext = createContext<Theme>(undefined as any)

export function useThemeContext (): Theme {
  return useContext(ThemeContext)
}

export function ThemeProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { theme } = useTheme()
  const [currentTheme, setTheme] = useState<NonNullable<ColorSchemeName>>(theme)

  useEffect(() => {
    setTheme(theme)
  }, [theme])

  const context: Theme = {
    theme: currentTheme,
    setTheme,
    isLight: currentTheme === 'light'
  }

  return (
    <ThemeContext.Provider value={context}>
      {props.children}
    </ThemeContext.Provider>
  )
}
