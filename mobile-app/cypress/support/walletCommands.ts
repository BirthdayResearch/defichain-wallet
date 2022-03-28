import { DeFiAddress } from '@defichain/jellyfish-address'
import '@testing-library/cypress/add-commands'
import { BalanceTokenDetail } from '../integration/functional/wallet/balances/balances.spec'
import BigNumber from 'bignumber.js'

export function checkValueWithinRange (actualVal: string, expectedVal: string, range: number = 2): void {
  const value = new BigNumber(actualVal.replace(/[≈$,]/gi, '').trim())
  const expectedValue = new BigNumber(expectedVal)
  expect(value.gte(expectedValue.minus(range))).to.be.eq(true)
  expect(value.lte(expectedValue.plus(range))).to.be.eq(true)
}

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * @description Verify wallet address if it's a valid
       * @param {string} network - network of wallet
       * @param {string} addressObject - optional address if needs to be used on next steps
       * @example cy.verifyWalletAddress(recoveryWords, address)
       */
      verifyWalletAddress: (network: string, addressObject?: { address: string }) => Chainable<Element>

      /**
       * @description Verify if connected to correct network
       * @param {string} network - network of wallet
       * @example cy.isNetworkConnected('MainNet')
       */
      isNetworkConnected: (network: string) => Chainable<Element>

      /**
       * @description Verify balance row if it has correct values
       * @param {string} id - token
       * @param details - token to be verified
       * @param dynamicAmount - amount can be dynamic (e.g, additional rewards)
       * @example cy.checkBalanceRow('0_utxo', { name: 'DeFiChain', amount: '10.00000000', symbol: 'DFI (Token)' }, false)
       */
      checkBalanceRow: (id: string, details: BalanceTokenDetail, dynamicAmount?: boolean) => Chainable<Element>

      /**
       * @description Change passcode from settings page
       * @example cy.changePasscode()
       */
      changePasscode: () => Chainable<Element>

      /**
       * @description Validate Conversion details
       * @param {boolean} isTokenToUTXO
       * @param amountToConvert
       * @param resultingUTXO
       * @param resultingToken
       */
      validateConversionDetails: (isTokenToUTXO: boolean, amountToConvert: string, resultingUTXO: string, resultingToken: string) => Chainable<Element>

      /**
       * @description Change language from settings page
       * @param language - Language to be used
       * @example cy.changeLanguage('German')
       */
      changeLanguage: (language: string) => Chainable<Element>
    }
  }
}

Cypress.Commands.add('verifyWalletAddress', (network: string, addressObject?: { address: string }) => {
  cy.getByTestID('bottom_tab_balances').click()
  cy.getByTestID('receive_balance_button').click()
  cy.getByTestID('address_text').then(($txt: any) => {
    const a = $txt[0].textContent
    if (addressObject !== undefined) {
      addressObject.address = a
    }
    expect(DeFiAddress.from(network, a).valid).eq(true)
  })
})

Cypress.Commands.add('isNetworkConnected', (network: string) => {
  cy.getByTestID('header_active_network').then(($txt: any) => {
    const net = $txt[0].textContent
    expect(net).eq(network)
  })
  cy.getByTestID('header_status_indicator').should('have.css', 'background-color', 'rgb(16, 185, 129)')
})

Cypress.Commands.add('checkBalanceRow', (id: string, details: BalanceTokenDetail, dynamicAmount?: boolean) => {
  const testID = `balances_row_${id}`
  cy.getByTestID(testID).should('exist')
  cy.getByTestID(`${testID}_icon`).should('exist')
  cy.getByTestID(`${testID}_symbol`).should('have.text', details.displaySymbol)
  cy.getByTestID(`${testID}_name`).should('have.text', details.name)
  if (dynamicAmount === true) {
    cy.getByTestID(`${testID}_amount`).contains(details.amount)
    cy.getByTestID(`${testID}_available_percentage_text`).should('have.text', details.amount)
  } else {
    cy.getByTestID(`${testID}_amount`).should('have.text', details.amount)
  }
  if (details.usdAmount) {
    cy.getByTestID(`${testID}_usd_amount`).should('have.text', details.usdAmount)
  }
})

Cypress.Commands.add('changePasscode', () => {
  cy.getByTestID('bottom_tab_balances').click()
  cy.getByTestID('header_settings').click()
  cy.getByTestID('view_change_passcode').click()
  cy.getByTestID('pin_authorize').type('000000').wait(3000)
  cy.getByTestID('pin_input').type('696969').wait(3000)
  cy.getByTestID('pin_confirm_input').type('777777').wait(3000)
  cy.getByTestID('wrong_passcode_text').should('exist')
  cy.getByTestID('pin_confirm_input').type('696969').wait(3000)
})

Cypress.Commands.add('validateConversionDetails', (isTokenToUTXO: boolean, amountToConvert: string, resultingUTXO: string, resultingToken: string) => {
  cy.getByTestID('conversion_tag').should('exist')
  cy.getByTestID('title_conversion_detail').should('contain', 'CONVERSION DETAILS')
  cy.getByTestID('conversion_type').should('contain', isTokenToUTXO ? 'Token → UTXO' : 'UTXO → Token')
  cy.getByTestID('amount_to_convert').should('contain', amountToConvert)
  cy.getByTestID('resulting_utxo').should('contain', resultingUTXO)
  cy.getByTestID('resulting_token').should('contain', resultingToken)
  cy.getByTestID('conversion_breakdown_text').should('contain', 'Amount above are prior to transaction')
})

Cypress.Commands.add('changeLanguage', (language: string) => {
  cy.getByTestID('bottom_tab_balances').click()
  cy.getByTestID('header_settings').click()
  cy.getByTestID('setting_navigate_language_selection').click()
  cy.getByTestID('language_option_description').contains(language)
  cy.getByTestID(`button_language_${language}`).click()
  cy.on('window:confirm', (message: string) => {
    expect(message).to.include(language)
  })
})