import { LoanScheme } from '@defichain/whale-api-client/dist/api/loan'
import BigNumber from 'bignumber.js'
import { VaultStatus } from '../../../../../app/screens/AppNavigator/screens/Loans/VaultStatusTypes'

context('Wallet - Loans - Create vault', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().wait(6000)
  })

  it('should display empty vault screen', function () {
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('empty_vault').should('exist')
  })

  it('should navigate to create vault screen', function () {
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('button_create_vault').click()
    cy.getByTestID('create_vault_screen').should('exist')
  })

  it('should display correct loan schemes in create vault screen', function () {
    cy.intercept('**/loans/schemes?size=50').as('loanSchemes')
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('button_create_vault').click()
    cy.getByTestID('create_vault_submit_button').should('have.attr', 'aria-disabled')
    cy.getByTestID('loan_scheme_options').should('exist')
    cy.wait(['@loanSchemes']).then((intercept: any) => {
      const data: any[] = intercept.response.body.data
      data.sort((a, b) => new BigNumber(a.minColRatio).minus(b.minColRatio).toNumber()).forEach((scheme: LoanScheme, i) => {
        cy.getByTestID(`min_col_ratio_value_${i}`).contains(`${Number(scheme.minColRatio).toLocaleString()}%`)
        cy.getByTestID(`interest_rate_value_${i}`).contains(`${scheme.interestRate}% APR`)
      })
    })
  })

  it('should allow to submit', function () {
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('create_vault_header_button').click()
    cy.getByTestID('loan_scheme_option_0').click()
    cy.getByTestID('create_vault_submit_button').should('not.have.attr', 'disabled')
    cy.getByTestID('create_vault_submit_button').click()
    cy.url().should('include', 'ConfirmCreateVaultScreen')
  })
})

context('Wallet - Loans - Confirm create vault', () => {
  const walletTheme = { isDark: false }
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().wait(6000)
    cy.setWalletTheme(walletTheme)
  })

  it('should navigate to confirm create vault screen and create a vault', function () {
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('button_create_vault').click()
    cy.getByTestID('loan_scheme_option_0').click()
    cy.getByTestID('create_vault_submit_button').click()
    cy.getByTestID('confirm_create_vault_screen').should('exist')
    cy.getByTestID('confirm_min_col_ratio_value').should('contain', '150.00')
    cy.getByTestID('confirm_interest_rate_value').should('contain', '5.00')
    cy.getByTestID('button_confirm_create_vault').click().wait(4000)
    cy.getByTestID('txn_authorization_description').should('contain', 'Creating vault with min. collateralization ratio of 150% and interest rate of 5% APR')

    // Cancel first selection
    cy.getByTestID('cancel_authorization').click()
    cy.getByTestID('button_cancel_create_vault').click()
    cy.getByTestID('loan_scheme_option_1').click()
    cy.getByTestID('create_vault_submit_button').click()
    cy.getByTestID('confirm_min_col_ratio_value').should('contain', '175.00')
    cy.getByTestID('confirm_interest_rate_value').should('contain', '3.00')
    cy.getByTestID('button_confirm_create_vault').click().wait(4000)
    cy.getByTestID('txn_authorization_description').should('contain', 'Creating vault with min. collateralization ratio of 175% and interest rate of 3% APR')
    cy.closeOceanInterface()
  })

  it('should verify if vault was created', function () {
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('loans_tabs_YOUR_VAULTS').click()
    cy.getByTestID('vault_card_0').should('exist')
    cy.checkVaultTag('EMPTY', VaultStatus.Empty, 'vault_card_0_status', walletTheme.isDark)
    cy.getByTestID('vault_card_0_collateral_none').contains('None')
    cy.getByTestID('vault_card_0_total_loan').contains('$0.00')
    cy.getByTestID('vault_card_0_total_collateral').contains('$0.00')
  })
})
