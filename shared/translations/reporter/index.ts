import { uniq } from 'lodash'
import * as fs from 'fs'
import { getAppLanguages, translations } from '../../translations'

interface MissingLanguageItem {
  totalCount: number
  missingCount: number
  labels: {
    [key: string]: string[]
  }
}

interface MissingLanguage {
  [key: string]: MissingLanguageItem
}

function getBaseTranslationsMap (): Map<string, string[]> {
  const BASE_TRANSLATION_LOCALE = 'de'
  const baseTranslations = translations[BASE_TRANSLATION_LOCALE]
  const map = new Map<string, string[]>()

  for (const scope of Object.keys(baseTranslations)) {
    const list = []

    for (const key of Object.keys(baseTranslations[scope])) {
      const value = baseTranslations[scope][key]
      if (value !== '' && value !== null && value !== undefined) {
        list.push(key)
      }
    }
    map.set(scope, uniq(list))
  }
  return map
}

function checkTranslations (baseTranslation: Map<string, string[]>, missingTranslations: MissingLanguage): MissingLanguage {
  const localeToCheck = ['zh-Hans', 'zh-Hant', 'fr']
  const languages = getAppLanguages().map(
    language => language.locale
  ).filter(
      locale => localeToCheck.includes(locale)
  )
  let totalCount = 0
  baseTranslation.forEach((labels, screenName) => {
    totalCount = totalCount + labels.length
    languages.forEach((language) => {
      const langItem: any = { ...translations }[language]
      const languageTranslations = missingTranslations[language] ?? { missingCount: 0, labels: {}, totalCount }
      const translationFile = langItem[screenName]
      if (translationFile == null) {
        languageTranslations.labels[screenName] = labels
        languageTranslations.missingCount = languageTranslations.missingCount + labels.length
      } else {
        labels.forEach((baseLabel) => {
          if (translationFile[baseLabel] == null) {
            languageTranslations.labels[screenName] = languageTranslations.labels[screenName] ?? []
            languageTranslations.labels[screenName].push(
              Buffer.from(baseLabel, 'base64').toString('utf8') // decode to show verbose translation key
            )
            languageTranslations.missingCount = languageTranslations.missingCount + 1
          }
        })
      }
      languageTranslations.totalCount = totalCount
      missingTranslations[language] = languageTranslations
    })
  })

  fs.writeFileSync('./missing_translations.json', JSON.stringify(missingTranslations, null, 4))
  return missingTranslations
}

export async function findMissingTranslations (): Promise<MissingLanguage> {
  const missingTranslations: MissingLanguage = {}
  const baseTranslation = getBaseTranslationsMap()
  return checkTranslations(baseTranslation, missingTranslations)
}

findMissingTranslations().then(() => {}).catch(() => {})
