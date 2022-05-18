import i18n, { TranslateOptions } from 'i18n-js'
import de from './languages/de.json'
import zhHans from './languages/zh-Hans.json'
import zhHant from './languages/zh-Hant.json'
import fr from './languages/fr.json'
import es from './languages/es.json'
import it from './languages/it.json'

/**
 * For testing compatibility, will always be initialized.
 */
let init = false

/**
 * Internationalisation for DeFiChain Wallet, DeFi Blockchain Light Wallet.
 *
 * Translation matrix should be keyed as such:
 *
 * en | file location        | text/key | translation
 * ---|----------------------|----------|--------------
 * zh | screens/ScreenName   | Hello    | 你好
 * zh | screens/ScreenName   | Bye      | 再见
 * de | screens/ScreenName   | Bye      | Tschüss
 *
 * In this matrix, the key will always be the english representation of the text. Hence the 'key' it must be verbose.
 * Similarly following the Android Native String resources design.
 *
 * The benefits of this design allows:
 *
 * 1. Improved developer experience:
 * The components/screens will always have up to date english presentation of what you see on the app.
 * This allow developers with all levels of experience, to CMD/CTRL + SHIFT + F and find responsible code easily.
 *
 * 2. Improved translation experience:
 * Translator will be translating from the english text instead of 'keys' which is suboptimal.
 * When the english text change [context/meaning], it will always require all translations to be updated.
 *
 * @see translate
 */
export function initI18n (): void {
  init = true
  i18n.translations = translations
  i18n.fallbacks = true
}

export const translations = {
  en: {},
  de: deepEncode(de),
  'zh-Hans': deepEncode(zhHans),
  'zh-Hant': deepEncode(zhHant),
  fr: deepEncode(fr),
  es: deepEncode(es),
  it: deepEncode(it)
}

/**
 * @param {string} scope translation path, can follow file location
 * @param {string} text english text for internationalisation, also acts as fallback
 * @param {TranslateOptions} options
 */
export function translate (scope: string, text: string, options?: TranslateOptions): string {
  if (!init) {
    initI18n()
  }

  return i18n.translate(`${scope}.${encodeScope(text)}`, {
    defaultValue: text,
    ...options
  })
}

function deepEncode (obj: any): any {
  for (const [scope, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      obj[encodeScope(scope)] = value
      // eslint-disable-next-line
      delete obj[scope] // remove original key-value pair to avoid duplicate entries
    }
    if (typeof value === 'object') {
      obj[scope] = deepEncode(value)
    }
  }

  return obj
}

/**
 * Encode a text as scope that is safe to use as a path
 */
export function encodeScope (text: string): string {
  return Buffer.from(text).toString('base64')
}

export enum AppLanguage {
  English = 'English',
  German = 'German',
  ChineseSimplified = 'Chinese (Simplified)',
  ChineseTraditional = 'Chinese (Traditional)',
  French = 'French',
  Spanish = 'Spanish',
  Italian = 'Italian'
}

export interface AppLanguageItem {
  language: AppLanguage
  displayName: string
  locale: string
}

export function getAppLanguages (): AppLanguageItem[] {
  return [
    {
      language: AppLanguage.English,
      displayName: 'English',
      locale: 'en'
    },
    {
      language: AppLanguage.German,
      displayName: 'Deutsch',
      locale: 'de'
    },
    {
      language: AppLanguage.ChineseSimplified,
      displayName: '简体中文',
      locale: 'zh-Hans'
    },
    {
      language: AppLanguage.ChineseTraditional,
      displayName: '繁體中文',
      locale: 'zh-Hant'
    },
    {
      language: AppLanguage.French,
      displayName: 'Français',
      locale: 'fr'
    },
    {
      language: AppLanguage.Spanish,
      displayName: 'Español',
      locale: 'es'
    },
    {
      language: AppLanguage.Italian,
      displayName: 'Italiano',
      locale: 'it'
    }
  ]
}
