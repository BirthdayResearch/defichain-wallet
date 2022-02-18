import '@testing-library/cypress/add-commands'
import './onboardingCommands'
import './walletCommands'
import './loanCommands'

/* eslint-disable @typescript-eslint/no-var-requires */
const compareSnapshotCommand = require('cypress-image-diff-js/dist/command')
compareSnapshotCommand()

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
      getByTestID: (value: string, opts?: any) => Chainable<Element>

      /**
       * @description Redirects to main page and creates an empty wallet for testing. Useful on starts of tests.
       * @param {boolean} [isRandom=false] default = false, creates randomly generated mnemonic seed or abandon x23
       * @example cy.createEmptyWallet(isRandom?: boolean)
       */
      createEmptyWallet: (isRandom?: boolean) => Chainable<Element>

      /**
       * @description Sends UTXO DFI to wallet.
       * @example cy.sendDFItoWallet().wait(4000)
       */
      sendDFItoWallet: () => Chainable<Element>

      /**
       * @description Sends DFI Token to wallet.
       * @example cy.sendDFITokentoWallet().wait(4000)
       */
      sendDFITokentoWallet: () => Chainable<Element>

      /**
       * @description Sends token to wallet. Accepts a list of token symbols to be sent.
       * @param {string[]} tokens to be sent
       * @example cy.sendTokenToWallet(['BTC', 'ETH']).wait(4000)
       */
      sendTokenToWallet: (tokens: string[]) => Chainable<Element>

      /**
       * @description Wait for the ocean interface to be confirmed then close the drawer
       * @param {string} pin - accepts optional pin
       * @example cy.closeOceanInterface('000000')
       */
      closeOceanInterface: (pin?: string) => Chainable<Element>

      /**
       * @description Exit current wallet
       * @example cy.exitWallet()
       */
      exitWallet: () => Chainable<Element>

      /**
       * @description Fetch wallet balance
       * @example cy.fetchWalletBalance()
       */
      fetchWalletBalance: () => Chainable<Element>

      /**
       * @description Switch networks via app
       * @param {string} network to be used
       * @example cy.switchToMainnet('MainNet')
       */
      switchNetwork: (network: string) => Chainable<Element>

      /**
       * @description Stores local storage for dependent tests
       */
      saveLocalStorage: () => Chainable<Element>

      /**
       * @description Restores local storage for dependent tests
       */
      restoreLocalStorage: () => Chainable<Element>

      /**
       * @description Compare snapshot from image
       */
      compareSnapshot: (element?: string) => Chainable<Element>

      /**
       * @description setWalletTheme
       * @param {any} walletTheme
       */
      setWalletTheme: (walletTheme: any) => Chainable<Element>
    }
  }
}

Cypress.Commands.add('getByTestID', (selector: string, opts?: any) => {
  /* eslint-disable @typescript-eslint/restrict-template-expressions */
  const args = opts != null ? opts : { timeout: 10000 }
  return cy.get(`[data-testid=${Cypress.$.escapeSelector(selector)}]`, args)
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
  cy.intercept('/v0/playground/wallet/tokens/0/send').as('sendToAddress')
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

Cypress.Commands.add('closeOceanInterface', (pin?: string) => {
  const inputPin = pin !== undefined ? pin : '000000'
  cy.getByTestID('pin_authorize').type(inputPin)
  cy.wait(7000).getByTestID('oceanInterface_close').should('exist').click().wait(2000)
})

Cypress.Commands.add('exitWallet', () => {
  cy.getByTestID('playground_wallet_clear').click()
})

Cypress.Commands.add('fetchWalletBalance', () => {
  cy.getByTestID('playground_wallet_fetch_balances').click()
})

Cypress.Commands.add('switchNetwork', (network: string) => {
  cy.getByTestID('bottom_tab_balances').click()
  cy.getByTestID('header_settings').click()
  cy.getByTestID('button_selected_network').click()
  cy.getByTestID(`button_network_${network}`).click()
  cy.on('window:confirm', () => {})
})

const LOCAL_STORAGE_MEMORY = {}

Cypress.Commands.add('saveLocalStorage', () => {
  Object.keys(localStorage).forEach(key => {
    LOCAL_STORAGE_MEMORY[key] = localStorage[key]
  })
})

Cypress.Commands.add('restoreLocalStorage', () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key])
  })
})

Cypress.Commands.add('setWalletTheme', (walletTheme: any) => {
  cy.getByTestID('bottom_tab_balances').click()
  cy.getByTestID('header_settings').click()
  cy.getByTestID('light_mode_icon').then(($txt: any) => {
    walletTheme.isDark = $txt[0].style.color === 'rgb(212, 212, 212)'
  })
})
