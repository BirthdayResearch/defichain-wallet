import * as findInFiles from 'find-in-files'
import { uniq } from 'lodash'
import { translations } from '../constants'
import * as fs from 'fs'

interface MissingLanguage {
  [key: string]: {
    [key: string]: string[]
  }
}

const getAllTranslationsKeys = (keys: string[], map: Map<string, string[]>): Map<string, string[]> => {
  keys.forEach((k) => {
    let item = k.replace('translate(', '').replace(')', '').split(',')
    item = item.map((v) => v.trim().replace(/^'(.*)'$/, '$1'))
    if (item[0] != null && item[1] != null) {
      const list = ((map.get(item[0]) != null) || [])
      list.push(item[1])
      map.set(item[0], list)
    }
  })
  return map
}

const updateBaseTranslations = async (baseTranslation: Map<string, string[]>): Promise<Map<string, string[]>> => {
  const translationRegex = new RegExp(/translate\(.*,+.*\)/)
  const find = async (directory: string): Promise<findInFiles.FindResult> => await findInFiles.find(translationRegex, directory, '.tsx$')
  // list of folders to check
  const directories = ['components', 'navigation', 'screens']
  for (const dir of directories) {
    const result = await find(dir)
    Object.keys(result).forEach((k) => {
      baseTranslation = getAllTranslationsKeys(uniq(result[k].matches), baseTranslation)
    })
  }
  return baseTranslation
}

const checkTranslations = (baseTranslation: Map<string, string[]>, missingTranslations: MissingLanguage): void => {
  const languages = Object.keys(translations)
  baseTranslation.forEach((labels, screenName) => {
    languages.forEach((language) => {
      const langItem: any = { ...translations }[language]
      if (langItem[screenName] == null) {
        missingTranslations[language] = missingTranslations[language] ?? {}
        missingTranslations[language][screenName] = labels
      } else {
        labels.forEach((baseLabel) => {
          if (langItem[screenName][baseLabel] == null) {
            missingTranslations[language] = missingTranslations[language] ?? {}
            const missingLabels = missingTranslations[language][screenName] ?? []
            missingLabels.push(baseLabel)
            missingTranslations[language][screenName] = missingLabels
          }
        })
      }
    })
  })
  fs.writeFileSync('./missingTranslations.json', JSON.stringify(missingTranslations))
}

function findMissingTranslations (): void {
  const baseTranslation = new Map<string, string[]>()
  const missingTranslations: MissingLanguage = {}
  // Create base translation file
  updateBaseTranslations(baseTranslation)
    .then((baseTranslation) => {
      checkTranslations(baseTranslation, missingTranslations)
    }).catch((error) => console.log(error))
}

findMissingTranslations()
