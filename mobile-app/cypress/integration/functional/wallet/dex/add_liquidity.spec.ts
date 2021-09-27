import BigNumber from 'bignumber.js'

function setupWallet (): void {
  cy.createEmptyWallet(true)
  cy.getByTestID('bottom_tab_dex').click()
  cy.getByTestID('close_dex_guidelines').click()
  cy.sendDFItoWallet()
    .sendDFITokentoWallet()
    .sendTokenToWallet(['BTC']).wait(3000)

  cy.getByTestID('bottom_tab_dex').click()
  cy.getByTestID('pool_pair_add_dBTC-DFI').click()
  cy.wait(100)
  cy.getByTestID('token_balance_primary').contains('10')
  cy.getByTestID('token_balance_secondary').contains('10')
}

context('Wallet - DEX - Add Liquidity', () => {
  before(function () {
    setupWallet()
  })

  it('should update both token and build summary when click on max amount button', function () {
    cy.getByTestID('MAX_amount_button').first().click()
    cy.getByTestID('token_input_primary').should('have.value', '10.00000000')
    cy.getByTestID('token_input_secondary').should('have.value', '10.00000000')
    cy.getByTestID('a_per_b_price').contains('1.00000000 DFI per dBTC')
    cy.getByTestID('b_per_a_price').contains('1.00000000 dBTC per DFI')
    cy.getByTestID('share_of_pool').contains('1.00000000%')
  })

  it('should update both token and build summary when click on half amount button', function () {
    cy.getByTestID('token_input_primary_clear_button').click()
    cy.getByTestID('50%_amount_button').first().click()
    cy.getByTestID('token_input_primary').should('have.value', '5.00000000')
    cy.getByTestID('token_input_secondary').should('have.value', '5.00000000')
    cy.getByTestID('a_per_b_price').contains('1.00000000 DFI per dBTC')
    cy.getByTestID('b_per_a_price').contains('1.00000000 dBTC per DFI')
    cy.getByTestID('share_of_pool').contains('0.50000000%')
  })

  it('should update both token and build summary base on primary token input', function () {
    cy.getByTestID('token_input_primary_clear_button').click()
    cy.getByTestID('token_input_primary').invoke('val').should(text => expect(text).to.contain(''))
    cy.getByTestID('token_input_secondary').invoke('val').should(text => expect(text).to.contain('0'))

    cy.getByTestID('token_input_primary').type('3')
    cy.getByTestID('token_input_secondary').should('have.value', '3.00000000')

    cy.getByTestID('a_per_b_price').contains('1.00000000 DFI per dBTC')
    cy.getByTestID('b_per_a_price').contains('1.00000000 dBTC per DFI')
    cy.getByTestID('share_of_pool').contains('0.30000000%')
  })

  it('should update both token and build summary base on secondary token input', function () {
    cy.getByTestID('token_input_secondary_clear_button').click()
    cy.getByTestID('token_input_secondary').type('2')

    cy.getByTestID('token_input_primary').should('have.value', '2.00000000')

    cy.getByTestID('a_per_b_price').contains('1.00000000 DFI per dBTC')
    cy.getByTestID('b_per_a_price').contains('1.00000000 dBTC per DFI')
    cy.getByTestID('share_of_pool').contains('0.20000000%')
    cy.getByTestID('button_continue_add_liq').click()
  })

  it('should have correct confirm info', function () {
    cy.getByTestID('text_add_amount').contains('2.00000000 dBTC-DFI')
    cy.getByTestID('a_amount_unit').contains('dBTC')
    cy.getByTestID('a_amount').contains('2.00000000')
    cy.getByTestID('b_amount_unit').contains('DFI')
    cy.getByTestID('b_amount').contains('2.00000000')
    cy.getByTestID('percentage_pool').contains('0.20000000%')
    cy.getByTestID('button_cancel_add').click()
  })
})

context('Wallet - DEX - Combine Add and Confirm Liquidity Spec', () => {
  before(function () {
    setupWallet()
  })

  it('should get disabled submit button when value is zero', function () {
    cy.getByTestID('token_input_primary').type('0')
    cy.getByTestID('button_continue_add_liq').should('have.attr', 'disabled')
    cy.getByTestID('token_input_secondary_clear_button').click()
    cy.getByTestID('token_input_secondary').type('0')
    cy.getByTestID('button_continue_add_liq').should('have.attr', 'disabled')
  })

  it('should get disabled submit button when value is nan', function () {
    cy.getByTestID('token_input_primary_clear_button').click()
    cy.getByTestID('token_input_primary').type('test value')
    cy.getByTestID('button_continue_add_liq').should('have.attr', 'disabled')
    cy.getByTestID('token_input_secondary_clear_button').click()
    cy.getByTestID('token_input_secondary').type('test value')
    cy.getByTestID('button_continue_add_liq').should('have.attr', 'disabled')
  })

  it('should get disabled submit button when value is more than input token A and token B', function () {
    cy.getByTestID('token_input_primary_clear_button').click()
    cy.getByTestID('token_input_primary').type('20.00000000')
    cy.getByTestID('button_continue_add_liq').should('have.attr', 'disabled')
    cy.getByTestID('token_input_secondary_clear_button').click()
    cy.getByTestID('token_input_secondary').type('15.00000000')
    cy.getByTestID('button_continue_add_liq').should('have.attr', 'disabled')
  })

  it('should get disabled submit button when max for token A, while token B doesn\'t have enough balanceB', function () {
    cy.sendTokenToWallet(['BTC']).wait(3000)
    cy.getByTestID('MAX_amount_button').first().click()
    cy.getByTestID('button_continue_add_liq').should('have.attr', 'disabled')
  })

  it('should get disabled submit button when max for token B, while token A doesn\'t have enough balanceB', function () {
    cy.sendDFITokentoWallet().sendDFITokentoWallet().wait(3000)
    cy.getByTestID('MAX_amount_button').eq(1).click()
    cy.getByTestID('button_continue_add_liq').should('have.attr', 'disabled')
  })

  it('should get redirect to confirm page after clicking on continue', function () {
    cy.getByTestID('MAX_amount_button').first().click()
    cy.getByTestID('button_continue_add_liq').should('not.have.attr', 'disabled')
    cy.getByTestID('button_continue_add_liq').click()
    cy.url().should('include', 'DEX/ConfirmAddLiquidity')
  })
})

context('Wallet - DEX - Add Liquidity Confirm Txn', () => {
  beforeEach(function () {
    setupWallet()
  })

  afterEach(function () {
    cy.getByTestID('your_dBTC-DFI').contains('10.00000000')
    cy.getByTestID('tokenA_dBTC').contains('9.99999999')
    cy.getByTestID('tokenB_DFI').contains('9.99999999')

    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('balances_row_6').should('exist')
    cy.getByTestID('balances_row_6_symbol').contains('dBTC-DFI')
    // Remove added liquidity
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('pool_pair_remove_dBTC-DFI').click()
    cy.getByTestID('button_slider_max').click().wait(1000)
    cy.getByTestID('button_continue_remove_liq').click()
    cy.getByTestID('button_confirm_remove').click().wait(2000)
    cy.closeOceanInterface()
  })

  it('should have updated confirm info', function () {
    cy.getByTestID('token_input_primary').type('10')
    cy.getByTestID('button_continue_add_liq').click()
    cy.getByTestID('text_add_amount').contains('10.00000000 dBTC-DFI')
    cy.getByTestID('a_amount_unit').contains('dBTC')
    cy.getByTestID('a_amount').contains('10.00000000')
    cy.getByTestID('b_amount_unit').contains('DFI')
    cy.getByTestID('b_amount').contains('10.00000000')
    cy.getByTestID('percentage_pool').contains('1.00000000%')
    cy.getByTestID('button_confirm_add').click().wait(3000)
    cy.closeOceanInterface()
  })

  it('should be able to add correct liquidity when user cancel a tx and updated some inputs', function () {
    const oldAmount = '5.00000000'
    const newAmount = '10.00000000'
    cy.getByTestID('token_input_primary').type(oldAmount)
    cy.getByTestID('button_continue_add_liq').click()
    cy.getByTestID('text_add_amount').contains(`${oldAmount} dBTC-DFI`)
    cy.getByTestID('a_amount_unit').contains('dBTC')
    cy.getByTestID('a_amount').contains(oldAmount)
    cy.getByTestID('b_amount_unit').contains('DFI')
    cy.getByTestID('b_amount').contains(oldAmount)
    cy.getByTestID('percentage_pool').contains('0.50000000%')
    cy.getByTestID('text_fee').should('exist')
    cy.getByTestID('button_confirm_add').click().wait(3000)
    // Check for authorization page description
    cy.getByTestID('txn_authorization_description')
      .contains(`Adding ${new BigNumber(oldAmount).toFixed(8)} dBTC - ${new BigNumber(oldAmount).toFixed(8)} DFI`)
    // Cancel send on authorisation page
    cy.getByTestID('cancel_authorization').contains('CANCEL').click()
    cy.getByTestID('button_cancel_add').click()
    // Update the input amount
    cy.getByTestID('token_input_primary_clear_button').click()
    cy.getByTestID('token_input_primary').type(newAmount)
    cy.getByTestID('button_continue_add_liq').click()
    cy.getByTestID('text_add_amount').contains(`${newAmount} dBTC-DFI`)
    cy.getByTestID('a_amount_unit').contains('dBTC')
    cy.getByTestID('a_amount').contains(newAmount)
    cy.getByTestID('b_amount_unit').contains('DFI')
    cy.getByTestID('b_amount').contains(newAmount)
    cy.getByTestID('percentage_pool').contains('1.00000000%')
    cy.getByTestID('text_fee').should('exist')
    cy.getByTestID('button_confirm_add').click().wait(3000)
    // Check for authorization page description
    cy.getByTestID('txn_authorization_description')
      .contains(`Adding ${new BigNumber(newAmount).toFixed(8)} dBTC - ${new BigNumber(newAmount).toFixed(8)} DFI`)
    cy.closeOceanInterface()
  })
})
