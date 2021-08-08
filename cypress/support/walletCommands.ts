import { DeFiAddress } from "@defichain/jellyfish-address";
import '@testing-library/cypress/add-commands'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * @description Verify wallet address if it's a valid
       * @param {string} network - network of wallet
       * @example cy.restoreMnemonicWords(recoveryWords)
       */
      verifyWalletAddress (network: string): Chainable<Element>
    }
  }
}

Cypress.Commands.add('verifyWalletAddress', (network: string) => {
  cy.getByTestID('bottom_tab_balances').click()
  cy.getByTestID('balances_row_0_utxo').click()
  cy.getByTestID('receive_button').click()
  cy.getByTestID('address_text').then(($txt: any) => {
    const address = $txt[0].textContent
    expect(DeFiAddress.from(network, address).valid).eq(true)
  })
})
