declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * @description Create a vault
       * @param {string} loanScheme - loanScheme of the vault
       */
      createVault: (loanScheme: number) => Chainable<Element>
    }
  }
}

Cypress.Commands.add('createVault', (loanScheme: number = 0) => {
  cy.getByTestID('bottom_tab_loans').click()
  cy.getByTestID('button_create_vault').click()
  cy.getByTestID(`loan_scheme_option_${loanScheme}`).click()
  cy.getByTestID('create_vault_submit_button').click()
  cy.getByTestID('button_confirm_create_vault').click().wait(3000)
  cy.closeOceanInterface()
})
