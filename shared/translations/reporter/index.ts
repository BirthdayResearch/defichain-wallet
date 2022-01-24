import * as findInFiles from 'find-in-files'
import { uniq } from 'lodash'
import * as fs from 'fs'
import { getAppLanguages } from '@translations'

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

const DIRECTORIES = ['components', 'navigation', 'screens']

function getAllTranslationsKeys (keys: string[], map: Map<string, string[]>): Map<string, string[]> {
  keys.forEach((k) => {
    let item = k.replace('translate(', '').replace(')', '').split(',')
    item = item.map((v) => v.trim().replace(/^'(.*)'$/, '$1'))
    if ((item[0] !== '' && item[0] != null) && (item[1] !== '' && item[1] != null)) {
      const list = map.get(item[0]) ?? []
      list.push(item[1])
      map.set(item[0], uniq(list))
    }
  })
  return map
}

async function updateBaseTranslations (baseTranslation: Map<string, string[]>): Promise<Map<string, string[]>> {
  const translationRegex = /translate\(.*,+.*\)/
  const find = async (directory: string): Promise<findInFiles.FindResult> => await findInFiles.find(translationRegex, directory, '.tsx$')
  // list of folders to check
  for (const dir of DIRECTORIES) {
    const result = await find(dir)
    Object.keys(result).forEach((k) => {
      baseTranslation = getAllTranslationsKeys(uniq(result[k].matches), baseTranslation)
    })
  }
  return baseTranslation
}

function checkTranslations (baseTranslation: Map<string, string[]>, missingTranslations: MissingLanguage): MissingLanguage {
  const languages = getAppLanguages().map(language => language.locale)
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
            languageTranslations.labels[screenName].push(baseLabel)
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
  let baseTranslation = new Map<string, string[]>()
  const missingTranslations: MissingLanguage = {}
  // Create base translation file
  baseTranslation = await updateBaseTranslations(baseTranslation)
  return checkTranslations(baseTranslation, missingTranslations)
}

findMissingTranslations().then(() => {}).catch(() => {})
