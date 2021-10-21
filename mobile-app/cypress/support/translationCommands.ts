import '@testing-library/cypress/add-commands'
import { get } from 'lodash'
import { getTranslations } from '../../../shared/translations'

const translation = getTranslations()

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
       checkLnTextContent: (language: string, testId: string, ...translationPath: string[]) => Chainable<Element>
    }
  }
}


Cypress.Commands.add('switchLanguage', (language: string) => {
  cy.getByTestID('bottom_tab_settings').click()
  cy.getByTestID('setting_navigate_language_selection').click()
  cy.getByTestID(`button_language_${language}`).click()
  cy.on('window:confirm', () => {})
})

Cypress.Commands.add('checkLnTextContent', (language: string, testId: string, ...translationPath: string[]) => {
  cy.getByTestID(testId).should('have.text', get(translation, [language, ...translationPath]))
})
