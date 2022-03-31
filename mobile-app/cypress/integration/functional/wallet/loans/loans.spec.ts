import { LoanToken } from '@defichain/whale-api-client/dist/api/loan'
import {
  checkCollateralDetailValues,
  checkVaultDetailValues
} from '../../../../support/loanCommands'
import { VaultStatus } from '../../../../../app/screens/AppNavigator/screens/Loans/VaultStatusTypes'
import { checkValueWithinRange } from '../../../../support/walletCommands'
import BigNumber from 'bignumber.js'

function addCollateral (): void {
  cy.go('back')
  cy.wait(2000)
  cy.getByTestID('vault_card_0_status').contains('READY')
  cy.getByTestID('vault_card_0_collateral_token_group_DFI').should('exist')
  cy.getByTestID('vault_card_0_collateral_token_group_dBTC').should('exist')
  cy.getByTestID('vault_card_0_total_collateral').contains('$1,500.00')
}

function sendTokenToRandomAddress (tokenId: string): void {
  const randomAddress = 'bcrt1qnr4cxeu5dx6nk0u8qr5twppzd0uq7m5wygfhz3'
  cy.getByTestID('bottom_tab_balances').click().wait(4000)
  cy.getByTestID(`balances_row_${tokenId}`).click()
  cy.getByTestID('send_button').click()
  cy.getByTestID('address_input').clear().type(randomAddress).blur()
  cy.getByTestID('amount_input').clear().type('10').blur()
  cy.getByTestID('button_confirm_send_continue').click()
  cy.getByTestID('button_confirm_send').click().wait(3000)
  cy.closeOceanInterface()
}

function validate50PercentButton (loanTokenSymbol: string, paymentTokenSymbol: string, hasSufficientBalance: boolean = false): void {
  cy.getByTestID('50%_amount_button').click()
  if (hasSufficientBalance) {
    cy.getByTestID('payback_input_text_error').should('not.exist')
    cy.getByTestID('button_confirm_payback_loan_continue').should('not.have.attr', 'aria-disabled')
  } else {
    cy.getByTestID('payback_input_text_error').should('have.text', `Insufficient ${paymentTokenSymbol} to pay for the entered amount`)
    cy.getByTestID('button_confirm_payback_loan_continue').should('have.attr', 'aria-disabled')
  }
  cy.getByTestID('loan_outstanding_balance').invoke('text').then(text => {
    const outstandingBalance = new BigNumber(text.replace(loanTokenSymbol, '').trim())
    cy.getByTestID('payback_input_text').should('have.value', outstandingBalance.div(2).toFixed(8))
    cy.getByTestID('loan_payment_percentage').should('have.text', '50.00%')
  })
}

function validateMaxButtonWith0Balance (): void {
  const availableBalance = new BigNumber(0)
  cy.getByTestID('MAX_amount_button').click()
  cy.getByTestID('button_confirm_payback_loan_continue').should('have.attr', 'aria-disabled')
  cy.getByTestID('payback_input_text').should('have.value', availableBalance.toFixed(8))
  cy.getByTestID('loan_payment_percentage').should('have.text', '0%')
}

function validateMaxButtonWithSufficientBalance (loanTokenSymbol: string): void {
  cy.getByTestID('MAX_amount_button').click()
  cy.getByTestID('payback_input_text_error').should('not.exist')
  cy.getByTestID('button_confirm_payback_loan_continue').should('not.have.attr', 'aria-disabled')
  cy.getByTestID('loan_outstanding_balance').invoke('text').then(text => {
    const outstandingBalance = new BigNumber(text.replace(loanTokenSymbol, '').trim())
    cy.getByTestID('payback_input_text').should('have.value', outstandingBalance.toFixed(8))
    cy.getByTestID('loan_payment_percentage').should('have.text', '100.00%')
  })
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
    // Topping up DUSD-DFI to increase total liquidity of DUSD
    cy.sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['BTC', 'DUSD-DFI', 'DUSD-DFI', 'DUSD-DFI']).wait(6000)
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

context('Wallet - Loans - Payback DUSD Loans', () => {
  let vaultId = ''
  const walletTheme = { isDark: false }
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFITokentoWallet().sendDFITokentoWallet().sendTokenToWallet(['BTC']).wait(6000)
    cy.setWalletTheme(walletTheme)
    cy.go('back')
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('close_dex_guidelines').click()
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

  it('should add DUSD loan', function () {
    cy.getByTestID('vault_card_0_manage_loans_button').click()
    cy.getByTestID('button_browse_loans').click()
    cy.getByTestID('loan_card_DUSD').click()
    cy.getByTestID('form_input_borrow').clear().type('10').blur()
    cy.wait(3000)
    cy.getByTestID('borrow_loan_submit_button').click()
    cy.getByTestID('text_borrow_amount').contains('10.00000000')
    cy.getByTestID('text_borrow_amount_suffix').contains('DUSD')
    cy.getByTestID('button_confirm_borrow_loan').click().wait(3000)
    cy.getByTestID('txn_authorization_description')
      .contains('Borrowing 10.00000000 DUSD')
    cy.closeOceanInterface()
  })

  it('should show payment tokens for DUSD loans regardless of wallet balance', function () {
    cy.intercept('**/tokens ? size =* ', {
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

  it('should display loan amount and its USD value', function () {
    cy.getByTestID('loan_outstanding_balance').invoke('text').then(text => {
      const outstandingBalance = new BigNumber(text.replace('DUSD', '').trim())
      checkValueWithinRange(text, outstandingBalance.toFixed(8), 0.05)
    })
    cy.getByTestID('loan_outstanding_balance_usd').should('have.text', '≈ $10.00')
  })

  /* Paying DUSD with 0 available DUSD */
  it('should have 0 available DUSD', () => {
    sendTokenToRandomAddress('12') // Empty out DUSD in wallet
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('available_token_balance').should('have.text', '0.00000000 DUSD')
  })

  it('should display 50% of loan amount if 50% button is pressed with 0 DUSD', () => {
    validate50PercentButton('DUSD', 'DUSD')
  })

  it('should cap to available DUSD balance if MAX button is pressed with 0 DUSD', () => {
    validateMaxButtonWith0Balance()
  })

  /* Paying DFI with sufficient DFI */
  it('should display 50% of loan amount if 50% button is pressed with sufficient DFI', () => {
    cy.getByTestID('payment_token_card_DFI').click()
    cy.getByTestID('50%_amount_button').click()
    cy.getByTestID('button_confirm_payback_loan_continue').should('not.have.attr', 'aria-disabled')
    cy.getByTestID('payback_input_text').invoke('val').then(text => {
      checkValueWithinRange(text, '0.05', 0.0005)
    })
    cy.getByTestID('loan_payment_percentage').should('have.text', '50.00%')
  })

  it('should cap to available DFI balance if MAX button is pressed with sufficient DFI', () => {
    cy.getByTestID('MAX_amount_button').click()
    cy.getByTestID('button_confirm_payback_loan_continue').should('not.have.attr', 'aria-disabled')
    cy.getByTestID('payback_input_text').invoke('val').then(text => {
      checkValueWithinRange(text, '0.1', 0.0005)
    })
  })

  /* Paying DUSD sufficient DUSD */
  it('should update available balance on top up', () => {
    cy.sendTokenToWallet(['DUSD', 'DUSD']).wait(3000)
  })

  it('should display 50% of loan amount if 50% button is pressed with sufficient DUSD', () => {
    cy.getByTestID('payment_token_card_DUSD').click()
    cy.getByTestID('50%_amount_button').click()
    cy.getByTestID('payback_input_text_error').should('not.exist')
    cy.getByTestID('button_confirm_payback_loan_continue').should('not.have.attr', 'aria-disabled')
    cy.getByTestID('loan_outstanding_balance').invoke('text').then(text => {
      const outstandingBalance = new BigNumber(text.replace('DUSD', '').trim())
      cy.getByTestID('payback_input_text').should('have.value', outstandingBalance.div(2).toFixed(8))
      cy.getByTestID('loan_payment_percentage').should('have.text', '50.00%')
    })
  })

  it('should display 100% of loan amount if MAX button is pressed with sufficient DUSD', () => {
    validateMaxButtonWithSufficientBalance('DUSD')
  })

  it('should display excess amount details when paying with DUSD', () => {
    cy.getByTestID('payback_input_text').clear().type('20').blur()
    cy.getByTestID('loan_outstanding_balance').invoke('text').then(text => {
      const outstandingBalance = new BigNumber(text.replace('DUSD', '').trim())
      const excessAmount = new BigNumber(20).minus(outstandingBalance)
      cy.getByTestID('text_excess_amount').should('have.text', excessAmount.toFixed(8))
    })
  })

  it('should be able to payback DUSD loans by DUSD', function () {
    cy.getByTestID('payback_input_text').clear().type('11').blur()
    cy.getByTestID('loan_outstanding_balance').invoke('text').then(text => {
      const outstandingBalance = new BigNumber(text.replace('DUSD', '').trim())
      cy.getByTestID('button_confirm_payback_loan_continue').click().wait(3000)
      cy.getByTestID('text_transaction_type').contains('Loan payment')
      cy.getByTestID('text_payment_amount').contains('11.00000000')
      cy.getByTestID('text_payment_amount_suffix').contains('DUSD')
      cy.getByTestID('text_excess_amount').contains(new BigNumber(11).minus(outstandingBalance).toFixed(8))
      cy.getByTestID('text_resulting_loan_amount').contains('0.00000000')
      cy.getByTestID('text_resulting_loan_amount_suffix').contains('DUSD')
      cy.getByTestID('tokens_to_pay').contains('11.00000000')
      cy.getByTestID('tokens_to_pay_suffix').contains('DUSD')
    })

    cy.getByTestID('text_vault_id').contains(vaultId)
    // cy.getByTestID('text_current_collateral_ratio').contains('N/A')
    cy.getByTestID('button_confirm_payback_loan').click().wait(4000)
    cy.getByTestID('txn_authorization_description')
      .contains('Paying 11.00000000 DUSD')
    cy.closeOceanInterface()
    cy.wait(3000)
  })
})

context('Wallet - Loans Payback Non-DUSD Loans - 0 balance', () => {
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
    cy.sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['BTC']).wait(6000)
    cy.setWalletTheme(walletTheme)
    cy.go('back')
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

  it('should borrow dTU10 loan', function () {
    cy.getByTestID('vault_card_0_manage_loans_button').click()
    cy.getByTestID('button_browse_loans').click()
    cy.getByTestID('loan_card_dTU10').click()
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

  it('should show payment tokens for dTU10 loans regardless of wallet balance', function () {
    cy.intercept('**/tokens?size=*', {
      body: {
        data: []
      }
    }).as('getTokens')
    cy.getByTestID('loans_tabs_YOUR_VAULTS').click()
    cy.getByTestID('vault_card_0_manage_loans_button').click()
    cy.getByTestID('loan_card_dTU10_payback_loan').click()
    cy.wait('@getTokens').then(() => {
      cy.getByTestID('payment_token_card_dTU10').should('exist')
      cy.getByTestID('payment_token_card_DUSD').should('exist')
    })
  })

  it('should display loan amount and its USD value', function () {
    cy.getByTestID('loan_outstanding_balance').invoke('text').then(text => {
      const outstandingBalance = new BigNumber(text.replace('dTU10', '').trim())
      checkValueWithinRange(outstandingBalance.toFixed(8), new BigNumber(10).toFixed(8), 0.05)
    })
    cy.getByTestID('loan_outstanding_balance_usd').invoke('text').then(text => {
      const outstandingBalanceUSD = new BigNumber(text.replace('≈ $', '').trim())
      checkValueWithinRange(outstandingBalanceUSD.toFixed(2), new BigNumber(100).toFixed(2), 5)
    })
  })

  /* Paying dTU10 with 0 available dTU10 */
  it('should have 0 available dTU10', () => {
    sendTokenToRandomAddress('13') // Empty out dTU10 in wallet
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('available_token_balance').should('have.text', '0.00000000 dTU10')
  })

  it('should display 50% of loan amount if 50% button is pressed with 0 dTU10', () => {
    validate50PercentButton('dTU10', 'dTU10')
  })

  it('should cap to available dTU10 balance if MAX button is pressed with 0 dTU10', () => {
    validateMaxButtonWith0Balance()
  })

  /* Paying DUSD with 0 available DUSD */
  it('should display 50% of loan amount if 50% button is pressed with 0 DUSD', () => {
    cy.getByTestID('payment_token_card_DUSD').click()
    validate50PercentButton('dTU10', 'DUSD')
  })

  it('should cap to available DUSD balance if MAX button is pressed with 0 DUSD', () => {
    validateMaxButtonWith0Balance()
  })

  /* Paying dTU10 with sufficient dTU10 balance */
  it('should borrow dTU10', () => {
    getLoanTokenToPayback()
  })

  it('should display 50% of loan amount if 50% button is pressed with sufficient dTU10', () => {
    validate50PercentButton('dTU10', 'dTU10', true)
  })

  it('should display 100% of loan amount if MAX button is pressed with sufficient dTU10', () => {
    validateMaxButtonWithSufficientBalance('dTU10')
  })
})

context('Wallet - Loans Payback Non-DUSD Loans - Sufficient Balance', () => {
  let vaultId = ''
  const walletTheme = { isDark: false }

  function getLoanTokenToPayback (): void {
    cy.createVault(0, true)
    cy.getByTestID('vault_card_1_edit_collaterals_button').click()
    cy.addCollateral('20', 'DFI')
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
    cy.go('back')
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

  it('should borrow dTU10 loan', function () {
    cy.getByTestID('vault_card_0_manage_loans_button').click()
    cy.getByTestID('button_browse_loans').click()
    cy.getByTestID('loan_card_dTU10').click()
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

  /* Paying dTU10 with sufficient dTU10 balance */
  it('should borrow dTU10 to pay for previous loan', () => {
    getLoanTokenToPayback()
  })

  it('should be able to payback dTU10 loans', function () {
    cy.getByTestID('vault_card_1').click()
    cy.getByTestID('vault_detail_tabs_LOANS').click()
    cy.getByTestID('loan_card_dTU10_payback_loan').click()
    cy.getByTestID('payback_input_text').clear().type('12').blur()
    cy.getByTestID('button_confirm_payback_loan_continue').click().wait(3000)
    cy.getByTestID('confirm_title').contains('You are paying')
    cy.getByTestID('text_payment_amount').contains('12.00000000')
    cy.getByTestID('text_payment_amount_suffix').contains('dTU10')
    cy.getByTestID('text_transaction_type').contains('Loan payment')
    cy.getByTestID('tokens_to_pay').contains('12.00000000')
    cy.getByTestID('tokens_to_pay_suffix').contains('dTU10')
    cy.getByTestID('text_resulting_loan_amount').contains('0.00000000')
    cy.getByTestID('text_resulting_loan_amount_suffix').contains('dTU10')
    cy.getByTestID('text_vault_id').contains(vaultId)
    // cy.getByTestID('text_current_collateral_ratio').contains('N/A')
    cy.getByTestID('button_confirm_payback_loan').click().wait(4000)
    cy.getByTestID('txn_authorization_description')
      .contains('Paying 12.00000000 dTU10')
    cy.closeOceanInterface()
    cy.wait(3000)
    cy.checkVaultTag('READY', VaultStatus.Ready, 'vault_card_1_status', walletTheme.isDark)
  })
})
