import React, { createContext, useContext, useEffect, useState } from 'react'
import { ColorSchemeName, useColorScheme } from 'react-native'
import { Logging } from '../api'
import { ThemePersistence } from '../api/wallet/theme_storage'

interface ThemeLoader {
  theme: NonNullable<ColorSchemeName>
  isThemeLoaded: boolean
}

export function useTheme (): ThemeLoader {
  const colorScheme = useColorScheme()
  const [isThemeLoaded, setIsThemeLoaded] = useState<boolean>(false)
  const [theme, setTheme] = useState<NonNullable<ColorSchemeName>>('light')

  useEffect(() => {
    ThemePersistence.get().then((t) => {
      let currentTheme: NonNullable<ColorSchemeName> = 'light'
      if (t !== null && t !== undefined) {
        currentTheme = t as NonNullable<ColorSchemeName>
      } else if (colorScheme !== null && colorScheme !== undefined) {
        currentTheme = colorScheme
      }
      setTheme(currentTheme)
    }).catch((err) => Logging.error(err)).finally(() => setIsThemeLoaded(true))
  }, [])

  return {
    isThemeLoaded,
    theme
  }
}

const light: Record<string, string> = {
  'body-bg': 'bg-gray-100',
  'row-bg': 'bg-white',
  'row-border': 'border-b border-gray-200',
  'title-text': 'text-gray-500',
  'body-text': 'text-black',
  'subtitle-text': 'text-gray-600',
  'text-primary': 'text-primary'
}

const dark: Record<string, string> = {
  'body-bg': 'bg-dark',
  'row-bg': 'bg-darksurface',
  'row-border': 'border-b border-dark',
  'title-text': 'text-white text-opacity-90',
  'body-text': 'text-white text-opacity-90',
  'subtitle-text': 'text-white text-opacity-70',
  'text-primary': 'text-darkprimary'
}

interface Theme {
  theme: NonNullable<ColorSchemeName>
  setTheme: (theme: NonNullable<ColorSchemeName>) => void
  getThemeClass: (type: string) => string
}

const ThemeContext = createContext<Theme>(undefined as any)

export function useThemeContext (): Theme {
  return useContext(ThemeContext)
}

export function ThemeProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { theme } = useTheme()
  const [currentTheme, setTheme] = useState<NonNullable<ColorSchemeName>>(theme)

  function getThemeClass (type: string): string {
    const current = currentTheme === 'dark' ? dark : light
    const classList = type.split(' ')
    let classes = ''
    classList.forEach((c) => {
      classes = `${classes} ${current[c]}`
    })
    return classes
  }

  useEffect(() => {
    setTheme(theme)
  }, [theme])

  const context: Theme = {
    theme: currentTheme,
    setTheme,
    getThemeClass
  }

  return (
    <ThemeContext.Provider value={context}>
      {props.children}
    </ThemeContext.Provider>
  )
}
