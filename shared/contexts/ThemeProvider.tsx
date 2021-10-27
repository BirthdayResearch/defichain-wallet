import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import React, { createContext, useContext, useEffect, useState } from 'react'

interface ThemeLoader {
  theme: NonNullable<ColorSchemeName>
  isThemeLoaded: boolean
}

type ColorSchemeName = 'light' | 'dark' | null | undefined

interface ThemeContextI {
  api: {
    get: () => Promise<string | null>
    set: (language: NonNullable<ColorSchemeName>) => Promise<void>
  }
  colorScheme?: ColorSchemeName
}

export function useTheme ({ api, colorScheme }: ThemeContextI): ThemeLoader {
  const logger = useLogger()
  const [isThemeLoaded, setIsThemeLoaded] = useState<boolean>(false)
  const [theme, setTheme] = useState<NonNullable<ColorSchemeName>>('light')

  useEffect(() => {
    api.get().then((t) => {
      let currentTheme: NonNullable<ColorSchemeName> = 'light'
      if (t !== null && t !== undefined) {
        currentTheme = t as NonNullable<ColorSchemeName>
      } else if (colorScheme !== null && colorScheme !== undefined) {
        currentTheme = colorScheme
      }
      setTheme(currentTheme)
    })
    .catch(logger?.error)
    .finally(() => setIsThemeLoaded(true))
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

export function ThemeProvider (props: ThemeContextI & React.PropsWithChildren<any>): JSX.Element | null {
  const { api, colorScheme } = props
  const { theme } = useTheme({ api, colorScheme })
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
