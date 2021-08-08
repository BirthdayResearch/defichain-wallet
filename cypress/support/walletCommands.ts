import { DeFiAddress } from "@defichain/jellyfish-address";
import '@testing-library/cypress/add-commands'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * @description Verify wallet address if it's a valid
       * @param {string} network - network of wallet
       * @param {string} addressObject - optional address if needs to be used on next steps
       * @example cy.verifyWalletAddress(recoveryWords, address)
       */
      verifyWalletAddress (network: string, addressObject?: { address: string }): Chainable<Element>

      /**
       * @description Verify if connected to correct network
       * @param {string} network - network of wallet
       * @example cy.isNetworkConnected('MainNet')
       */
      isNetworkConnected (network: string): Chainable<Element>
    }
  }
}

Cypress.Commands.add('verifyWalletAddress', (network: string, addressObject?: { address: string }) => {
  cy.getByTestID('bottom_tab_balances').click()
  cy.getByTestID('balances_row_0_utxo').click()
  cy.getByTestID('receive_button').click()
  cy.getByTestID('address_text').then(($txt: any) => {
    const a = $txt[0].textContent
    if (addressObject) {
      addressObject.address = a
    }
    expect(DeFiAddress.from(network, a).valid).eq(true)
  })
})

Cypress.Commands.add('isNetworkConnected', (network: string) => {
  cy.getByTestID('playground_active_network').then(($txt: any) => {
    const network = $txt[0].textContent
    expect(network).eq('MainNet')
  })
  cy.getByTestID('playground_status_indicator').should('have.css', 'background-color', 'rgb(16, 185, 129)')
})
