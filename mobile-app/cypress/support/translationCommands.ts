import '@testing-library/cypress/add-commands'
import { get } from 'lodash'
import { AppLanguageItem, getTranslations, getAppLanguages } from '../../../shared/translations'

const translation = getTranslations()
const languages = getAppLanguages().filter(({ locale }: { locale: string }) => locale !== 'en')

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * @description Switch language via app
       * @param {string} language to be used
       * @example cy.switchLanguage('German')
       */
      switchLanguage: (language: string) => Chainable<Element>
      /**
       * @description Check text content
       * @param {visitScreen} function contains steps to redirect to the screen
       * @param {screen} screen name to be used
       * @example cy.switchLanguage(() => { cy.getByTestID('bottom_tab_dex').click() }, 'screens/DexScreen')
       */
       checkLnTextContent: (visitScreen: () => void, screen: string ) => Chainable<Element>
    }
  }
}


Cypress.Commands.add('switchLanguage', (language: string) => {
  cy.getByTestID('bottom_tab_balances').click()
  cy.getByTestID('header_settings').click()
  cy.getByTestID('setting_navigate_language_selection').click()
  cy.getByTestID(`button_language_${language}`).click()
  cy.on('window:confirm', () => {})
})

Cypress.Commands.add('checkLnTextContent', (visitScreen: () => void, screen: string ) => {
  languages.forEach(function ({ language, locale }: AppLanguageItem) {
    cy.switchLanguage(language)
    visitScreen()
    const keyPrefix = `text-translation-${screen}=`
    cy.get(`[data-testid*="${keyPrefix}"]`).each(function ($el) {
      const text = $el.text()
      const testID = $el.attr('data-testid')
      if (testID) {
        const translationKey = testID.replace(keyPrefix, '')
        expect(text).eq(get(translation, [locale, screen, translationKey]))
      }
    })
  })
})
