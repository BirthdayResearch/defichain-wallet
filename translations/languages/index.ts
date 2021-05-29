import { zhHans } from './zh-Hans'
import { zhHant } from './zh-Hant'
import { de } from './de'

export interface Translation {
  [screen: string]: {
    [english: string]: string
  }
}

export const languages: Record<string, Translation> = {
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  de: de
}
