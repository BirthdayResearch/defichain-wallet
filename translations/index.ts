import i18n from 'i18n-js'
import * as Localization from 'expo-localization'

import zh_hans from './languages/zh-Hans'
import zh_hant from './languages/zh-Hant'
import de from './languages/de'

export const translations = {
  'zh-Hans': zh_hans,
  'zh-Hant': zh_hant,
  de: de
}

/**
 * For testing compatibility, will always be initialized.
 */
let init = false

/**
 * Internationalisation for DeFi Wallet, DeFi Blockchain Light Wallet.
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
  i18n.translations = {
    en: {},
    ...translations
  }
  i18n.locale = Localization.locale
  i18n.fallbacks = true
  i18n.missingBehaviour = 'guess'
}

/**
 * @param path translation path, can follow file location
 * @param text english text for internationalisation
 */
export function translate (path: string, text: string): string {
  if (!init) {
    initI18n()
  }
  return i18n.translate(`${path}.${text}`)
}

// TODO(thedoublejay): add CI workflow to find missing translation and report it
//  simple regex will be able to detect. ideally to be done in TypeScript for translations comparison
