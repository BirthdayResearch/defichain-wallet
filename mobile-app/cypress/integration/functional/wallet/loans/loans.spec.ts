import { LoanToken } from '@defichain/whale-api-client/dist/api/loan'
import {
  checkCollateralDetailValues,
  checkVaultDetailValues
} from '../../../../support/loanCommands'
import { VaultStatus } from '../../../../../app/screens/AppNavigator/screens/Loans/VaultStatusTypes'
import BigNumber from 'bignumber.js'

function addCollateral (): void {
  cy.go('back')
  cy.wait(2000)
  cy.getByTestID('vault_card_0_status').contains('READY')
  cy.getByTestID('vault_card_0_collateral_token_group_DFI').should('exist')
  cy.getByTestID('vault_card_0_collateral_token_group_dBTC').should('exist')
  cy.getByTestID('vault_card_0_total_collateral').contains('$1,500.00')
}

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

context('Wallet - Loans - Take Loans', () => {
  let vaultId = ''
  const walletTheme = { isDark: false }
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['BTC']).wait(6000)
    cy.setWalletTheme(walletTheme)
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
    addCollateral()
  })

  it('should add loan', function () {
    let annualInterest: string
    cy.getByTestID('vault_card_0_manage_loans_button').click()
    checkVaultDetailValues('READY', vaultId, '$1,500.00', '$0.00', '5')
    cy.getByTestID('button_browse_loans').click()
    cy.getByTestID('loan_card_DUSD').click()
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
    cy.getByTestID('text_estimated_annual_interest').then(($txt: any) => {
      annualInterest = $txt[0].textContent.replace(' DUSD', '').replace(',', '')
    })
    cy.getByTestID('text_total_loan_with_annual_interest').then(($txt: any) => {
      const totalLoanWithAnnualInterest = $txt[0].textContent.replace(' DUSD', '').replace(',', '')
      expect(new BigNumber(totalLoanWithAnnualInterest).toFixed(8)).to.be.equal(new BigNumber('100').plus(annualInterest).toFixed(8))
    })
    cy.getByTestID('borrow_loan_submit_button').click()
    cy.getByTestID('text_borrow_amount').contains('100.00000000')
    cy.getByTestID('text_borrow_amount_suffix').contains('DUSD')
    cy.getByTestID('text_transaction_type').contains('Borrow loan token')
    cy.getByTestID('tokens_to_borrow').contains('100.00000000')
    cy.getByTestID('tokens_to_borrow_suffix').contains('DUSD')
    cy.getByTestID('text_vault_id').contains(vaultId)
    cy.getByTestID('text_collateral_amount').contains('$1,500.00')
    cy.getByTestID('text_current_collateral_ratio').contains('N/A')
    cy.getByTestID('text_resulting_col_ratio').contains('1,500.00')
    cy.getByTestID('button_confirm_borrow_loan').click().wait(3000)
    cy.getByTestID('txn_authorization_description')
      .contains('Borrowing 100.00000000 DUSD')
    cy.closeOceanInterface()
  })

  it('should verify vault card', function () {
    cy.checkVaultTag('ACTIVE', VaultStatus.Healthy, 'vault_card_0_status', walletTheme.isDark)
    cy.getByTestID('vault_card_0_col_ratio').contains('1,500%')
    cy.getByTestID('vault_card_0_min_ratio').contains('150%')
    cy.getByTestID('vault_card_0_total_loan').contains('$100')
    cy.getByTestID('vault_card_0_loan_symbol_DUSD').should('exist')
    cy.getByTestID('vault_card_0_total_collateral').contains('$1,500.00')
  })

  it('should borrow more loan', function () {
    let annualInterest: string
    cy.getByTestID('vault_card_0').click()
    cy.getByTestID('vault_detail_tabs_LOANS').click()
    cy.getByTestID('loan_card_DUSD_borrow_more').click()
    cy.getByTestID('loan_symbol').contains('DUSD')
    cy.getByTestID('loan_outstanding_balance').contains('100')
    cy.getByTestID('vault_id').contains(vaultId)
    cy.checkVaultTag('ACTIVE', VaultStatus.Healthy, 'vault_status_tag', walletTheme.isDark)
    cy.getByTestID('loan_col_ratio').contains('1,500.00%')
    cy.getByTestID('loan_min_col').contains('150.00%')
    cy.getByTestID('loan_add_input').type('1000').blur()
    cy.getByTestID('loan_add_input_error').contains('This amount may place the vault in liquidation')
    cy.getByTestID('text_input_usd_value').should('have.value', '1000.00')
    cy.getByTestID('text_resulting_col_ratio').contains('136')
    cy.getByTestID('borrow_more_button').should('have.attr', 'aria-disabled')
    cy.getByTestID('text_estimated_annual_interest').then(($txt: any) => {
      annualInterest = $txt[0].textContent.replace(' DUSD', '').replace(',', '')
    })
    cy.getByTestID('text_total_loan_with_annual_interest').then(($txt: any) => {
      const totalLoanWithAnnualInterest = $txt[0].textContent.replace(' DUSD', '').replace(',', '')
      expect(new BigNumber(totalLoanWithAnnualInterest).toFixed(8)).to.be.equal(new BigNumber('1000').plus(annualInterest).toFixed(8))
    })
    cy.getByTestID('text_total_loan_with_annual_interest_suffix').contains('DUSD')
    cy.getByTestID('loan_add_input').clear().type('648').blur()
    cy.getByTestID('text_resulting_col_ratio').contains('200')
    cy.getByTestID('borrow_more_button').click()
    // check confirm page
    cy.getByTestID('text_borrow_amount').contains('648.00000000')
    cy.getByTestID('text_borrow_amount_suffix').contains('DUSD')
    cy.getByTestID('text_transaction_type').contains('Borrow loan token')
    cy.getByTestID('tokens_to_borrow').contains('648.00000000')
    cy.getByTestID('tokens_to_borrow_suffix').contains('DUSD')
    cy.getByTestID('text_vault_id').contains(vaultId)
    cy.getByTestID('text_collateral_amount').contains('$1,500.00')
    cy.getByTestID('text_resulting_col_ratio').contains('200')
    cy.getByTestID('button_confirm_borrow_loan').click().wait(3000)
    cy.getByTestID('txn_authorization_description').contains('Borrowing 648.00000000 DUSD')
    cy.closeOceanInterface()
  })

  it('should verify vault card after adding loans', function () {
    cy.checkVaultTag('ACTIVE', VaultStatus.AtRisk, 'vault_card_0_status', walletTheme.isDark)
    cy.getByTestID('vault_card_0_col_ratio').contains('201%')
    cy.getByTestID('vault_card_0_min_ratio').contains('150%')
    cy.getByTestID('vault_card_0_total_loan').contains('$748')
    cy.getByTestID('vault_card_0_loan_symbol_DUSD').should('exist')
    cy.getByTestID('vault_card_0_total_collateral').contains('$1,500.00')
  })

  it('should verify collaterals page', function () {
    cy.getByTestID('vault_card_0_edit_collaterals_button').click()
    checkCollateralDetailValues('ACTIVE', '$1,500.00', '$748.00', 201.00, '%', '150.00', '5.00')
  })

  it('should verify resulting collateralization after taking loan', function () {
    cy.removeCollateral('1', 'DFI', 187.17)
    checkCollateralDetailValues('ACTIVE', '$1,400.00', '$748', 187.16, '%', '150.00', '5.00')
    cy.removeCollateral('1', 'DFI', 173.80)
    checkCollateralDetailValues('ACTIVE', '$1,300.00', '$748', 173.79, '%', '150.00', '5.00')
  })

  it('should borrow another loan token', function () {
    cy.go('back')
    cy.wait(2000)
    cy.getByTestID('loans_tabs_BROWSE_LOANS').click()
    cy.getByTestID('header_loans_search').click()
    cy.getByTestID('loans_search_input').type('dTS25').blur()
    cy.getByTestID('loan_card_dTS25').click()
    cy.getByTestID('borrow_loan_vault').click()
    cy.wait(2000)
    cy.getByTestID('select_vault_0').click()
    cy.getByTestID('form_input_borrow').clear().type('3').blur()
    cy.wait(3000)
    cy.getByTestID('text_input_usd_value').should('have.value', '75.00')
    cy.getByTestID('text_resulting_col_ratio').contains('157.96')
    cy.getByTestID('borrow_loan_submit_button').click()
    cy.getByTestID('button_confirm_borrow_loan').click().wait(3000)
    cy.getByTestID('txn_authorization_description').contains('Borrowing 3.00000000 dTS25')
    cy.closeOceanInterface()
    cy.getByTestID('loans_tabs_YOUR_VAULTS').click()
    cy.checkVaultTag('ACTIVE', VaultStatus.NearLiquidation, 'vault_card_0_status', walletTheme.isDark)
    cy.getByTestID('vault_card_0_col_ratio').contains('158%')
    cy.getByTestID('vault_card_0_min_ratio').contains('150%')
    cy.getByTestID('vault_card_0_total_loan').contains('$823')
    cy.getByTestID('vault_card_0_loan_symbol_DUSD').should('exist')
    cy.getByTestID('vault_card_0_loan_symbol_dTS25').should('exist')
    cy.getByTestID('vault_card_0_total_collateral').contains('$1,300.00')
  })
})

context('Wallet - Loans - Payback Loans', () => {
  let vaultId = ''
  const walletTheme = { isDark: false }

  function getLoanTokenToPayback (): void {
    cy.createVault(0, true)
    cy.getByTestID('vault_card_1_edit_collaterals_button').click()
    cy.addCollateral('10', 'DFI')
    cy.go('back')
    cy.getByTestID('vault_card_1_manage_loans_button').click()
    cy.getByTestID('button_browse_loans').click()
    cy.getByTestID('loan_card_dTU10').click()
    cy.getByTestID('max_loan_amount_text').invoke('text').then((text: string) => {
      const maxLoanAmount = new BigNumber(text).minus(1).toFixed(0, 1) // use 0dp and round down
      cy.getByTestID('form_input_borrow').clear().type(maxLoanAmount).blur() // force vault to be in near liquidation so that the order will be deterministic after sorting
    })
    cy.wait(3000)
    cy.getByTestID('borrow_loan_submit_button').click()
    cy.getByTestID('button_confirm_borrow_loan').click().wait(3000)
    cy.closeOceanInterface()
  }

  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendDFITokentoWallet().sendDFITokentoWallet().sendDFITokentoWallet().sendTokenToWallet(['BTC']).wait(6000)
    cy.setWalletTheme(walletTheme)
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
    addCollateral()
  })

  it('should add loan', function () {
    cy.getByTestID('vault_card_0_manage_loans_button').click()
    cy.getByTestID('button_browse_loans').click()
    cy.getByTestID('loan_card_DUSD').click()
    cy.getByTestID('form_input_borrow').clear().type('100').blur()
    cy.wait(3000)
    cy.getByTestID('borrow_loan_submit_button').click()
    cy.getByTestID('text_borrow_amount').contains('100.00000000')
    cy.getByTestID('text_borrow_amount_suffix').contains('DUSD')
    cy.getByTestID('button_confirm_borrow_loan').click().wait(3000)
    cy.getByTestID('txn_authorization_description')
      .contains('Borrowing 100.00000000 DUSD')
    cy.closeOceanInterface()

    cy.getByTestID('loans_tabs_BROWSE_LOANS').click()
    cy.getByTestID('loan_card_dTU10').click()
    cy.getByTestID('borrow_loan_vault').click()
    cy.wait(2000)
    cy.getByTestID('select_vault_0').click()
    cy.getByTestID('form_input_borrow').clear().type('10').blur()
    cy.wait(3000)
    cy.getByTestID('borrow_loan_submit_button').click()
    cy.getByTestID('text_borrow_amount').contains('10.00000000')
    cy.getByTestID('text_borrow_amount_suffix').contains('dTU10')
    cy.getByTestID('button_confirm_borrow_loan').click().wait(3000)
    cy.getByTestID('txn_authorization_description')
      .contains('Borrowing 10.00000000 dTU10')
    cy.closeOceanInterface()
  })

  it('should show payment tokens for DUSD loans regardless of wallet balance', function () {
    cy.intercept('**/tokens?size=*', {
      body: {
        data: []
      }
    }).as('getTokens')
    cy.getByTestID('loans_tabs_YOUR_VAULTS').click()
    cy.getByTestID('vault_card_0_manage_loans_button').click()
    cy.getByTestID('loan_card_DUSD_payback_loan').click()
    cy.wait('@getTokens').then(() => {
      cy.getByTestID('payment_token_card_DUSD').should('exist')
      cy.getByTestID('payment_token_card_DFI').should('exist')
    })
  })

  it('should hide payment tokens for non-DUSD loans', function () {
    cy.go('back')
    cy.getByTestID('loan_card_dTU10_payback_loan').click()
    cy.getByTestID('payment_token_card_DUSD').should('not.exist')
    cy.getByTestID('payment_token_card_DFI').should('not.exist')
  })

  it('should show correct max/half amount of loan', function () {
    cy.go('back')
    cy.getByTestID('loan_card_DUSD_payback_loan').click()
    cy.getByTestID('loan_outstanding_balance').invoke('text').then(text => {
      const outstandingBalance = new BigNumber(text.replace('DUSD', '').trim())
      cy.getByTestID('payback_input_text').should('have.value', outstandingBalance.toFixed(8))

      cy.getByTestID('50%_amount_button').click()
      cy.getByTestID('payback_input_text').should('have.value', outstandingBalance.div(2).toFixed(8))

      cy.getByTestID('MAX_amount_button').click()
      cy.getByTestID('payback_input_text').should('have.value', outstandingBalance.toFixed(8))
    })
  })

  it('should not allow payment if balance is enough', function () {
    cy.getByTestID('payback_input_text_error').should('have.text', 'Insufficient DUSD to pay for the entered amount')
    cy.getByTestID('payback_input_text').clear().type('10000').blur()
    cy.getByTestID('payment_token_card_DFI').click()
    cy.getByTestID('payback_input_text_error').should('have.text', 'Insufficient DFI to pay for the entered amount')

    cy.getByTestID('50%_amount_button').click()
    cy.getByTestID('payback_input_text_error').should('not.exist')
    cy.getByTestID('payment_token_card_DUSD').click()
    cy.getByTestID('payback_input_text_error').should('not.exist')
  })

  it('should display tx details in paying DUSD w/o excess payment', function () {
    cy.getByTestID('payback_input_text').clear().type('100').blur()
    cy.getByTestID('payback_input_text_error').should('not.exist')
    cy.getByTestID('text_penalty_fee_warning').should('not.exist')
    cy.getByTestID('text_amount_to_pay').should('not.exist')
    cy.getByTestID('text_amount_to_pay_suffix').should('not.exist')
    cy.getByTestID('text_amount_to_pay_converted').should('have.text', '100.00000000')
    cy.getByTestID('text_amount_to_pay_converted_suffix').should('have.text', 'DUSD')
    cy.getByTestID('text_resulting_balance').should('have.text', '0.00000000')
    cy.getByTestID('text_resulting_balance_suffix').should('have.text', 'DUSD')
    cy.getByTestID('text_resulting_balance_label').should('have.text', 'Resulting DUSD Balance')
    cy.getByTestID('text_vault_id').contains(vaultId)
    cy.getByTestID('loan_outstanding_balance').invoke('text').then(text => {
      const outstandingBalance = new BigNumber(text.replace('DUSD', '').trim())
      cy.getByTestID('text_resulting_loan_amount').should('have.text', outstandingBalance.minus(100).toFixed(8))
    })
    cy.getByTestID('text_excess_amount').should('not.exist')
    cy.getByTestID('estimated_fee').contains('0.0002')
    cy.getByTestID('estimated_fee_suffix').should('have.text', 'DFI')
    cy.getByTestID('button_confirm_payback_loan_continue').should('not.have.attr', 'aria-disabled')
  })

  it('should display tx details in paying DUSD with excess payment', function () {
    cy.sendTokenToWallet(['DUSD']).wait(3000)
    cy.getByTestID('payback_input_text').clear().type('102').blur()
    cy.getByTestID('text_amount_to_pay').should('not.exist')
    cy.getByTestID('text_amount_to_pay_suffix').should('not.exist')
    cy.getByTestID('text_amount_to_pay_converted').should('have.text', '102.00000000')
    cy.getByTestID('text_amount_to_pay_converted_suffix').should('have.text', 'DUSD')
    cy.getByTestID('text_resulting_balance_label').should('have.text', 'Resulting DUSD Balance')
    cy.getByTestID('text_resulting_balance_suffix').should('have.text', 'DUSD')
    cy.getByTestID('text_vault_id').contains(vaultId)
    cy.getByTestID('text_resulting_loan_amount').should('have.text', '0.00000000')
    cy.getByTestID('text_resulting_loan_amount_suffix').should('have.text', 'DUSD')
    cy.getByTestID('loan_outstanding_balance').invoke('text').then(text => {
      const outstandingBalance = new BigNumber(text.replace('DUSD', '').trim())
      const excessAmount = new BigNumber(102).minus(outstandingBalance)
      const resultingBalance = new BigNumber(110).minus(102).plus(excessAmount)
      cy.getByTestID('text_excess_amount').should('have.text', excessAmount.toFixed(8))
      // wallet balance - amount to pay + excess amount
      cy.getByTestID('text_resulting_balance').should('have.text', resultingBalance.toFixed(8))
    })
    cy.getByTestID('estimated_fee').contains('0.0002')
    cy.getByTestID('estimated_fee_suffix').should('have.text', 'DFI')
  })

  it('should display tx details in paying DFI w/o excess payment', function () {
    cy.getByTestID('payment_token_card_DFI').click()
    cy.getByTestID('payback_input_text').clear().type('50').blur()
    cy.getByTestID('payback_input_text_error').should('not.exist')
    cy.getByTestID('text_penalty_fee_warning').should('exist')
    cy.getByTestID('text_amount_to_pay').should('have.text', '50.50505051')
    cy.getByTestID('text_amount_to_pay_suffix').should('have.text', 'DUSD')
    cy.getByTestID('text_amount_to_pay_converted').should('have.text', '0.50505051')
    cy.getByTestID('text_amount_to_pay_converted_suffix').should('have.text', 'DFI')
    cy.getByTestID('text_resulting_balance_label').should('have.text', 'Resulting DFI Balance')
    cy.getByTestID('text_resulting_balance_suffix').should('have.text', 'DFI')
    /* TODO: Failing e2e - balances page not finishes loading */
    // cy.getByTestID('bottom_tab_balances').click()
    // cy.getByTestID('dfi_total_balance_amount').invoke('text').then(text => {
    //   const dfiBalance = new BigNumber(text)
    //   cy.getByTestID('bottom_tab_loans').click()
    //   cy.getByTestID('text_resulting_balance').should('have.text', dfiBalance.minus('0.50505051').toFixed(8))
    // })
    cy.getByTestID('text_vault_id').contains(vaultId)
    cy.getByTestID('loan_outstanding_balance').invoke('text').then(text => {
      const outstandingBalance = new BigNumber(text.replace('DUSD', '').trim())
      cy.getByTestID('text_resulting_loan_amount').should('have.text', outstandingBalance.minus('50.50505051').toFixed(8))
    })
    cy.getByTestID('text_resulting_loan_amount_suffix').should('have.text', 'DUSD')
    cy.getByTestID('text_excess_amount').should('not.exist')
    cy.getByTestID('estimated_fee').contains('0.0002')
    cy.getByTestID('estimated_fee_suffix').should('have.text', 'DFI')
    cy.getByTestID('button_confirm_payback_loan_continue').should('not.have.attr', 'aria-disabled')
  })

  it('should display conversion warning if DFI is not enough', function () {
    cy.getByTestID('payback_input_text').clear().type('2000').blur()
    cy.getByTestID('conversion_info_text').should('exist')

    cy.getByTestID('payback_input_text').clear().type('200000').blur()
    cy.getByTestID('conversion_info_text').should('not.exist')
  })

  it('should not display warning msg when input is NaN', function () {
    cy.getByTestID('payback_input_text').clear()
    cy.getByTestID('payback_input_text_error').should('not.exist')
  })

  it('should display tx details in paying DFI with excess payment', function () {
    /* Computations
      penalty = (100.00076104/0.99) - 100.00076104
      amountToPayWithPenalty = 200 + ((100.00076104/0.99) - 100.00076104)
      amountToPayInPaymentTokenWithPenalty = amountToPayWithPenalty * .01
    */
    cy.getByTestID('payback_input_text').clear().type('200').blur()
    cy.getByTestID('payback_input_text_error').should('not.exist')

    cy.getByTestID('payback_input_text').clear().type('200').blur()
    cy.getByTestID('payback_input_text_error').should('not.exist')
    cy.getByTestID('text_penalty_fee_warning').should('exist')
    cy.getByTestID('loan_outstanding_balance').invoke('text').then(text => {
      const outstandingBalance = new BigNumber(text.replace('DUSD', '').trim())
      const penalty = outstandingBalance.div(0.99).minus(outstandingBalance)
      const conversionRate = 0.01

      cy.getByTestID('text_amount_to_pay').should('have.text', penalty.plus('200').toFixed(8))
      const convertedPenalty = penalty.multipliedBy(conversionRate)
      const convertedAmountToPay = new BigNumber(200).multipliedBy(conversionRate)
      cy.getByTestID('text_amount_to_pay_converted').should('have.text', new BigNumber(convertedAmountToPay).plus(convertedPenalty).toFixed(8))
      cy.getByTestID('text_excess_amount').should('have.text', new BigNumber(penalty.plus('200')).minus(outstandingBalance).toFixed(8))

      const convertedOutstandingBalance = outstandingBalance.multipliedBy(conversionRate).plus(convertedPenalty)
      cy.getByTestID('dfi_total_balance_amount').invoke('text').then(dfiText => {
        const DFIBalance = new BigNumber(dfiText)
        const lockedDFI = 10
        cy.getByTestID('text_resulting_balance').should('have.text', DFIBalance.minus(convertedOutstandingBalance).minus(lockedDFI).toFixed(8))
      })
    })

    cy.getByTestID('text_amount_to_pay_suffix').should('have.text', 'DUSD')
    cy.getByTestID('text_amount_to_pay_converted_suffix').should('have.text', 'DFI')

    cy.getByTestID('text_resulting_balance_suffix').should('have.text', 'DFI')
    cy.getByTestID('text_resulting_balance_label').should('have.text', 'Resulting DFI Balance')
    cy.getByTestID('text_vault_id').contains(vaultId)
    cy.getByTestID('text_resulting_loan_amount').should('have.text', '0.00000000')
    cy.getByTestID('text_resulting_loan_amount_suffix').should('have.text', 'DUSD')

    cy.getByTestID('estimated_fee').contains('0.0002')
    cy.getByTestID('estimated_fee_suffix').should('have.text', 'DFI')
    cy.getByTestID('button_confirm_payback_loan_continue').should('not.have.attr', 'aria-disabled')
  })

  it('should not display payment options if loan is not DUSD', function () {
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('vault_card_0_manage_loans_button').click()
    cy.getByTestID('loan_card_dTU10_payback_loan').click()
    cy.getByTestID('payment_token_card_DUSD').should('not.exist')
    cy.getByTestID('payment_token_card_DFI').should('not.exist')
    cy.getByTestID('payment_token_card_dTU10').should('not.exist')
    cy.go('back')
  })

  it('should be able to payback loans', function () {
    getLoanTokenToPayback()
    cy.sendTokenToWallet(['DUSD']).wait(3000)
    cy.getByTestID('loans_tabs_YOUR_VAULTS').click()
    cy.getByTestID('vault_card_1').click()
    cy.getByTestID('vault_detail_tabs_LOANS').click()
    cy.getByTestID('loan_card_dTU10_payback_loan').click()
    cy.getByTestID('payback_input_text').clear().type('11').blur()
    cy.getByTestID('button_confirm_payback_loan_continue').click()
    cy.getByTestID('button_confirm_payback_loan').click().wait(4000)
    cy.closeOceanInterface()

    cy.wait(3000)
    cy.getByTestID('vault_card_1').click()
    cy.getByTestID('vault_detail_tabs_LOANS').click()
    cy.getByTestID('loan_card_DUSD_payback_loan').click()
    cy.getByTestID('payback_input_text').clear().type('100000').blur()
    cy.getByTestID('button_confirm_payback_loan_continue').should('have.attr', 'aria-disabled')
    cy.getByTestID('payback_input_text').clear().type('102').blur()
    cy.getByTestID('text_resulting_loan_amount').contains('0.00000000')
    cy.getByTestID('text_resulting_col_ratio').contains('N/A')
    cy.getByTestID('button_confirm_payback_loan_continue').click().wait(3000)
    cy.getByTestID('confirm_title').contains('You are paying')
    cy.getByTestID('text_payment_amount').contains('102.00000000')
    cy.getByTestID('text_payment_amount_suffix').contains('DUSD')
    cy.getByTestID('text_transaction_type').contains('Loan payment')
    cy.getByTestID('tokens_to_pay').contains('102.00000000')
    cy.getByTestID('tokens_to_pay_suffix').contains('DUSD')
    cy.getByTestID('text_resulting_loan_amount').contains('0.00000000')
    cy.getByTestID('text_resulting_loan_amount_suffix').contains('DUSD')
    cy.getByTestID('text_vault_id').contains(vaultId)
    cy.getByTestID('text_current_collateral_ratio').contains('N/A')
    cy.getByTestID('button_confirm_payback_loan').click().wait(4000)
    cy.getByTestID('txn_authorization_description')
      .contains('Paying 102.00000000 DUSD')
    cy.closeOceanInterface()
    cy.wait(3000)
    cy.checkVaultTag('READY', VaultStatus.Ready, 'vault_card_1_status', walletTheme.isDark)
  })
})
