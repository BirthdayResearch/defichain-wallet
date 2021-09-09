import React, { createContext, useContext, useEffect, useState } from 'react'
import * as Localization from 'expo-localization'
import i18n from 'i18n-js'
import { Logging } from '../api'
import { LanguagePersistence } from '../api/persistence/language_storage'

interface LanguageLoader {
  isLanguageLoaded: boolean
  language: NonNullable<string>
}

export function useLanguage (): LanguageLoader {
  const locale = Localization.locale
  const defaultLanguage = 'en'
  const [isLanguageLoaded, setIsLanguageLoaded] = useState<boolean>(false)
  const [language, setLanguage] = useState<NonNullable<string>>(defaultLanguage)

  useEffect(() => {
    LanguagePersistence.get().then((l) => {
      let currentLanguage: NonNullable<string> = defaultLanguage
      if (l !== null && l !== undefined) {
        currentLanguage = l
      } else if (locale !== null && locale !== undefined) {
        currentLanguage = locale // use device's locale on first app install
      }
      setLanguage(currentLanguage)
    }).catch((err) => Logging.error(err)).finally(() => setIsLanguageLoaded(true))
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
  setLanguage: (language: NonNullable<string>) => void
}

const LanguageContext = createContext<Language>(undefined as any)

export function useLanguageContext (): Language {
  return useContext(LanguageContext)
}

export function LanguageProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { language } = useLanguage()
  const [currentLanguage, setLanguage] = useState<NonNullable<string>>(language)

  useEffect(() => {
    setLanguage(language)
  }, [language])

  useEffect(() => {
    i18n.locale = currentLanguage
  }, [currentLanguage])

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
