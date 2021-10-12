import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react'
import i18n from 'i18n-js'

interface LanguageLoader {
  isLanguageLoaded: boolean
  language: NonNullable<string>
}

interface LanguageContextI {
  api: {
    get: () => Promise<string | null>
    set: (language: NonNullable<string>) => Promise<void>
  }
  log: {
    error: (error: any) => void
  }
  locale: string
}

export function useLanguage ({ api, log, locale }: LanguageContextI): LanguageLoader {
  const defaultLanguage = 'en'
  const [isLanguageLoaded, setIsLanguageLoaded] = useState<boolean>(false)
  const [language, setLanguage] = useState<NonNullable<string>>(defaultLanguage)

  useEffect(() => {
    api.get().then((l) => {
      let currentLanguage: NonNullable<string> = defaultLanguage
      if (l !== null && l !== undefined) {
        currentLanguage = l
      } else if (locale !== null && locale !== undefined) {
        currentLanguage = locale // use device's locale on first app install
      }
      setLanguage(currentLanguage)
    })
    .catch((err) => log.error(err))
    .finally(() => setIsLanguageLoaded(true))
  }, [])

  useEffect(() => {
    i18n.locale = language
  }, [language])

  return {
    isLanguageLoaded,
    language
  }
}

interface Language {
  language: NonNullable<string>
  setLanguage: (language: NonNullable<string>) => Promise<void>
}

const LanguageContext = createContext<Language>(undefined as any)

export function useLanguageContext (): Language {
  return useContext(LanguageContext)
}

export function LanguageProvider (props: LanguageContextI & PropsWithChildren<any>): JSX.Element | null {
  const { api, log, locale } = props
  const { language } = useLanguage({ api, log, locale })
  const [currentLanguage, setCurrentLanguage] = useState<NonNullable<string>>(language)

  useEffect(() => {
    setCurrentLanguage(language)
  }, [language])

  useEffect(() => {
    i18n.locale = currentLanguage
  }, [currentLanguage])

  const setLanguage = async (locale: string): Promise<void> => {
    setCurrentLanguage(locale)
    await api.set(locale)
  }

  const context: Language = {
    language: currentLanguage,
    setLanguage
  }

  return (
    <LanguageContext.Provider value={context}>
      {props.children}
    </LanguageContext.Provider>
  )
}
