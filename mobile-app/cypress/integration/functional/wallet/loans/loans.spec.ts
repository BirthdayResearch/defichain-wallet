import { LoanToken } from '@defichain/whale-api-client/dist/api/loan'
import { EnvironmentNetwork } from '../../../../../../shared/environment'
import { checkVaultDetailValues } from '../../../../support/loanCommands'

context('Wallet - Loans', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().wait(6000)
  })

  it('should display correct loans from API', function () {
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('button_create_vault').click()
    cy.getByTestID('loan_scheme_option_0').click()
    cy.getByTestID('create_vault_submit_button').click()
    cy.getByTestID('button_confirm_create_vault').click().wait(4000)
    cy.closeOceanInterface()
    cy.intercept('**/loans/tokens?size=200').as('loans')
    cy.wait(['@loans']).then((intercept: any) => {
      const data: any[] = intercept.response.body.data
      cy.getByTestID('loans_tabs_BROWSE_LOANS').click()
      data.forEach((loan: LoanToken, i) => {
        // const price = loan.activePrice?.active?.amount ?? 0
        cy.getByTestID(`loan_card_${i}_display_symbol`).contains(loan.token.displaySymbol)
        cy.getByTestID(`loan_card_${i}_interest_rate`).contains(`${loan.interest}%`)
        // TODO update to fix volatility
        /* cy.getByTestID(`loan_card_${i}_loan_amount`)
          .contains(price > 0 ? `$${Number(new BigNumber(price).toFixed(2)).toLocaleString()}` : '-') */
      })
    })
  })
})

context('Wallet - Loans Feature Gated', () => {
  it('should not have loans tab if loan feature is blocked', function () {
    cy.intercept('**/settings/flags', {
      body: []
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_loans').should('not.exist')
  })

  it('should not have loans tab if feature flag api does not contains loan', function () {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'foo',
          name: 'bar',
          stage: 'alpha',
          version: '>=0.0.0',
          description: 'foo',
          networks: [EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
          platforms: ['ios', 'android', 'web']
        }
      ]
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_loans').should('not.exist')
  })

  it('should not have loans tab if feature flag api failed', function () {
    cy.intercept('**/settings/flags', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_loans').should('not.exist')
  })

  it('should not have loans tab if loan feature is beta and not activated by user', function () {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'loan',
          name: 'Loan',
          stage: 'beta',
          version: '>=0.0.0',
          description: 'Loan',
          networks: [EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
          platforms: ['ios', 'android', 'web']
        }
      ]
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_loans').should('not.exist')
  })

  it('should have loans tab if loan feature is beta is activated by user', function () {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'loan',
          name: 'Loan',
          stage: 'beta',
          version: '>=0.0.0',
          description: 'Loan',
          networks: [EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
          platforms: ['ios', 'android', 'web']
        }
      ]
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('header_settings').click()
    cy.getByTestID('setting_navigate_About').click()
    cy.getByTestID('try_beta_features').click()
    cy.getByTestID('feature_loan_row').should('exist')
    cy.getByTestID('feature_loan_switch').click().should(() => {
      expect(localStorage.getItem('WALLET.ENABLED_FEATURES')).to.eq('["loan"]')
    })
    cy.getByTestID('bottom_tab_loans').should('exist')
    cy.getByTestID('feature_loan_switch').click().should(() => {
      expect(localStorage.getItem('WALLET.ENABLED_FEATURES')).to.eq('[]')
    })
  })

  it('should have loans tab if loan feature is public', function () {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'loan',
          name: 'Loan',
          stage: 'public',
          version: '>=0.0.0',
          description: 'Loan',
          networks: [EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
          platforms: ['ios', 'android', 'web']
        }
      ]
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_loans').should('exist')
  })
})

context('Wallet - Loans - Take Loans', () => {
  let vaultId = ''
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['BTC']).wait(6000)
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('empty_vault').should('exist')
    cy.createVault(0)
    cy.getByTestID('vault_card_0_manage_loans_button').should('not.exist')
    cy.getByTestID('vault_card_0_vault_id').then(($txt: any) => {
      vaultId = $txt[0].textContent
    })
    cy.getByTestID('vault_card_0_edit_collaterals_button').click()
    cy.addCollateral('10', 'DFI')
    cy.addCollateral('10', 'dBTC')
  })

  it('should add collateral', function () {
    cy.go('back')
    cy.wait(2000)
    cy.getByTestID('vault_card_0_status').contains('READY')
    cy.getByTestID('vault_card_0_collateral_token_group_DFI').should('exist')
    cy.getByTestID('vault_card_0_collateral_token_group_dBTC').should('exist')
    cy.getByTestID('vault_card_0_total_collateral').contains('$1,500.00')
  })

  it('should add loan', function () {
    cy.getByTestID('vault_card_0_manage_loans_button').click()
    checkVaultDetailValues('READY', vaultId, '$1,500.00', '$0.00', '5')
    cy.getByTestID('button_browse_loans').click()
    cy.getByTestID('loan_card_0').click()
    cy.getByTestID('form_input_borrow').type('1000').blur()
    cy.wait(3000)
    cy.getByTestID('text_input_usd_value').should('have.value', '1000.00')
    cy.getByTestID('form_input_borrow_error').contains('This amount may place the vault in liquidation')
    cy.getByTestID('text_resulting_col_ratio').contains('150.00%')
    cy.getByTestID('borrow_loan_submit_button').should('have.attr', 'aria-disabled')
    cy.getByTestID('form_input_borrow').clear().type('100').blur()
    cy.wait(3000)
    cy.getByTestID('text_input_usd_value').should('have.value', '100.00')
    cy.getByTestID('text_resulting_col_ratio').contains('1,500.00%')
    cy.getByTestID('borrow_loan_submit_button').click()
    cy.getByTestID('text_borrow_amount').contains('100.00000000')
    cy.getByTestID('text_borrow_amount_suffix').contains('DUSD')
    cy.getByTestID('text_transaction_type').contains('Borrow loan token')
    cy.getByTestID('tokens_to_borrow').contains('100.00000000')
    cy.getByTestID('tokens_to_borrow_suffix').contains('DUSD')
    cy.getByTestID('text_vault_id').contains(vaultId)
    cy.getByTestID('text_collateral_amount').contains('$1,500.00')
    cy.getByTestID('text_current_collateral_ratio').contains('N/A')
    cy.getByTestID('text_result_collateral_ratio').contains('1,500.00')
    cy.getByTestID('button_confirm_borrow_loan').click().wait(3000)
    cy.getByTestID('txn_authorization_description')
      .contains('Borrowing 100.00000000 DUSD')
    cy.closeOceanInterface()
  })

  it('should verify vault card', function () {
    cy.getByTestID('vault_card_0_status').contains('ACTIVE')
    cy.getByTestID('vault_card_0_col_ratio').contains('1,500%')
    cy.getByTestID('vault_card_0_min_ratio').contains('150%')
    cy.getByTestID('vault_card_0_total_loan').contains('$100')
    cy.getByTestID('vault_card_0_loan_symbol_DUSD').should('exist')
  })
})
