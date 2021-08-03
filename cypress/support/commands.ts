import '@testing-library/cypress/add-commands'
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * @description Custom command to select DOM element by data-testid attribute.
			 * @example cy.getByTestID('settings')
			 */
			getByTestID (value: string): Chainable<Element>
	
			/**
			 * @description Redirects to main page and creates an empty wallet for testing. Useful on starts of tests.
			 * @param {boolean} [isRandom=false] default = false, creates randomly generated mnemonic seed or abandon x23
			 * @example cy.createEmptyWallet(isRandom?: boolean)
			 */
			createEmptyWallet (isRandom?: boolean): Chainable<Element>
	
			/**
			 * @description Sends UTXO DFI to wallet.
			 * @example cy.sendDFItoWallet().wait(4000)
			 */
			sendDFItoWallet (): Chainable<Element>
	
			/**
			 * @description Sends DFI Token to wallet.
			 * @example cy.sendDFITokentoWallet().wait(4000)
			 */
			sendDFITokentoWallet (): Chainable<Element>
	
			/**
			 * @description Sends token to wallet. Accepts a list of token symbols to be sent.
			 * @param {string[]} tokens to be sent
			 * @example cy.sendTokenToWallet(['BTC', 'ETH']).wait(4000)
			 */
			sendTokenToWallet (tokens: string[]): Chainable<Element>
		}
	}
}

Cypress.Commands.add('getByTestID', (selector, ...args) => {
  return cy.get(`[data-testid=${Cypress.$.escapeSelector(selector)}]`, ...args)
})

Cypress.Commands.add('createEmptyWallet', (isRandom: boolean = false) => {
  cy.visit('/')
  cy.getByTestID(isRandom ? 'playground_wallet_random' : 'playground_wallet_abandon').click()
})

Cypress.Commands.add('sendDFItoWallet', () => {
  cy.intercept('/v0/playground/rpc/sendtoaddress').as('sendToAddress')
  cy.getByTestID('playground_wallet_top_up').click()
  cy.wait(['@sendToAddress'])
})

Cypress.Commands.add('sendDFITokentoWallet', () => {
  cy.intercept('/v0/playground/wallet/tokens/dfi/sendtoaddress').as('sendToAddress')
  cy.getByTestID('playground_token_DFI').click()
  cy.wait(['@sendToAddress'])
})

Cypress.Commands.add('sendTokenToWallet', (tokens: string[]) => {
  cy.intercept('/v0/playground/rpc/sendtokenstoaddress').as('sendTokensToAddress')
  tokens.forEach((t: string) => {
    cy.getByTestID(`playground_token_${t}`).click()
  })
  cy.wait(['@sendTokensToAddress'])
})
