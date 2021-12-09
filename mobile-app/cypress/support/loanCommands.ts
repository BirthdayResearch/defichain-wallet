import '@testing-library/cypress/add-commands'
import BigNumber from 'bignumber.js'

export function checkCollateralDetailValues (status: string, totalCollateral: string, totalLoans: string, totalColRatio: string, colRatioSuffix: string, totalMinCol: string, totalVaultInterest: string): void {
  cy.getByTestID('collateral_vault_tag').contains(status)
  cy.getByTestID('text_total_collateral_value').contains(totalCollateral)
  cy.getByTestID('text_total_loans_value').contains(totalLoans)
  cy.getByTestID('text_col_ratio_value').should('have.value', totalColRatio)
  cy.getByTestID('text_col_ratio_value_suffix').contains(colRatioSuffix)
  cy.getByTestID('text_min_col_ratio_value').contains(totalMinCol)
  cy.getByTestID('text_vault_interest_value').contains(totalVaultInterest)
}

export function checkCollateralFormValues (title: string, symbol: string, balance: string): void {
  cy.getByTestID('form_title').contains(title)
  cy.getByTestID(`token_symbol_${symbol}`).contains(symbol)
  cy.getByTestID('form_balance_text').contains(balance)
}

export function checkConfirmEditCollateralValues (title: string, vaultId: string, type: string, colFactor: string, symbol: string, amount: string, colValue: string, vaultShare: string): void {
  cy.getByTestID('edit_collateral_confirm_title').contains(title)
  cy.getByTestID('edit_collateral_confirm_vault_id').contains(vaultId)
  cy.getByTestID('text_transaction_type').contains(type)
  cy.getByTestID('collateral_factor').contains(colFactor)
  cy.getByTestID('text_token_id').contains(symbol)
  cy.getByTestID('collateral_amount').contains(amount)
  cy.getByTestID('collateral_amount_suffix').contains(symbol)
  cy.getByTestID('collateral_value').contains(colValue)
  cy.getByTestID('edit_collateral_confirm_vault_share').contains(vaultShare)
}

export function checkCollateralCardValues (symbol: string, amount: string, dollarValue: string, vaultShare: string): void {
  cy.getByTestID(`collateral_card_symbol_${symbol}`).contains(symbol)
  cy.getByTestID(`collateral_card_col_amount_${symbol}`).contains(amount)
  cy.getByTestID(`collateral_card_col_amount_usd_${symbol}`).contains(`/${dollarValue}`)
  cy.getByTestID(`collateral_card_vault_share_${symbol}`).contains(vaultShare)
}

export function checkVaultDetailValues (status: string, vaultID: string, totalCollateral: string, totalLoans: string, vaultInterest: string): void {
  cy.getByTestID(`vault_detail_status`).contains(status)
  cy.getByTestID(`vault_detail_id`).contains(vaultID)
  cy.getByTestID(`text_total_collateral_value`).contains(totalCollateral)
  cy.getByTestID(`text_total_loan_value`).contains(totalLoans)
  cy.getByTestID(`text_vault_interest`).contains(vaultInterest)
}

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * @description Create a vault
       * @param {string} loanScheme - loanScheme of the vault
       */
      createVault: (loanScheme: number) => Chainable<Element>

      /**
       * @description Add Collateral
       * @param {string} amount - amount to add
       * @param {string} symbol - symbol of token
       * */
      addCollateral: (amount: string, symbol: string) => Chainable<Element>

      /**
       * @description Remove Collateral
       * @param {string} amount - amount to add
       * @param {string} symbol - symbol of token
       * */
      removeCollateral: (amount: string, symbol: string) => Chainable<Element>
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

Cypress.Commands.add('addCollateral', (amount: string, symbol: string) => {
  cy.getByTestID('add_collateral_button').click()
  cy.getByTestID(`select_${symbol}`).click()
  cy.getByTestID('add_collateral_button_submit').should('have.attr', 'aria-disabled')
  cy.getByTestID('form_input_text').type(amount).blur()
  cy.getByTestID('add_collateral_button_submit').click()
  cy.getByTestID('button_confirm_confirm_edit_collateral').click().wait(3000)
  cy.closeOceanInterface()
})

Cypress.Commands.add('removeCollateral', (amount: string, symbol: string) => {
  cy.getByTestID(`collateral_card_remove_${symbol}`).click()
  cy.getByTestID('form_input_text').type('1').blur()
  cy.getByTestID('add_collateral_button_submit').click()
  cy.getByTestID('button_confirm_confirm_edit_collateral').click().wait(3000)
  cy.getByTestID('txn_authorization_description')
    .contains(`Removing ${new BigNumber(amount).toFixed(8)} ${symbol} collateral from vault`)
  cy.closeOceanInterface()
})
