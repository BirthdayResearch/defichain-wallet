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
       * @param {string} language to be used
       * @param {screen} screen name to be used
       * @param {string} text to be used
       * @example cy.switchLanguage('German')
       */
       checkLnTextContent: (init: () => void, texts: { testID: string, path: string[] }[]) => Chainable<Element>
    }
  }
}


Cypress.Commands.add('switchLanguage', (language: string) => {
  cy.getByTestID('bottom_tab_settings').click()
  cy.getByTestID('setting_navigate_language_selection').click()
  cy.getByTestID(`button_language_${language}`).click()
  cy.on('window:confirm', () => {})
})

Cypress.Commands.add('checkLnTextContent', (init: () => void, texts ) => {
  languages.forEach(function ({ language, locale }: AppLanguageItem) {
    cy.switchLanguage(language)
    init()
    texts.forEach(function (text: {testID: string, path: string[]}) {
      cy.getByTestID(text.testID).should('have.text', get(translation, [locale, ...text.path]))
    })
  })
})
