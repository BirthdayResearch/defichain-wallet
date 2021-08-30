context('Wallet - DEX - Add Liquidity', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_dex').click()
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(['BTC']).wait(3000)

    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('pool_pair_add_DFI-BTC').click()
    cy.wait(100)
    cy.getByTestID('token_balance_primary').contains('10')
    cy.getByTestID('token_balance_secondary').contains('10')
  })

  it('should update both token and build summary when click on max amount button', function () {
    cy.getByTestID('MAX_amount_button').first().click()
    cy.getByTestID('token_input_primary').should('have.value', '10.00000000')
    cy.getByTestID('token_input_secondary').should('have.value', '10.00000000')
    cy.getByTestID('a_per_b_price').contains('1.00000000 BTC per DFI')
    cy.getByTestID('b_per_a_price').contains('1.00000000 DFI per BTC')
    cy.getByTestID('share_of_pool').contains('1.00000000%')
  })

  it('should update both token and build summary when click on half amount button', function () {
    cy.getByTestID('token_input_primary').clear()
    cy.getByTestID('50%_amount_button').first().click()
    cy.getByTestID('token_input_primary').should('have.value', '5.00000000')
    cy.getByTestID('token_input_secondary').should('have.value', '5.00000000')
    cy.getByTestID('a_per_b_price').contains('1.00000000 BTC per DFI')
    cy.getByTestID('b_per_a_price').contains('1.00000000 DFI per BTC')
    cy.getByTestID('share_of_pool').contains('0.50000000%')
  })

  it('should update both token and build summary base on primary token input', function () {
    cy.getByTestID('token_input_primary').clear().invoke('val').should(text => expect(text).to.contain(''))
    cy.getByTestID('token_input_secondary').invoke('val').should(text => expect(text).to.contain('0'))

    cy.getByTestID('token_input_primary').clear().type('3')
    cy.getByTestID('token_input_secondary').should('have.value', '3.00000000')

    cy.getByTestID('a_per_b_price').contains('1.00000000 BTC per DFI')
    cy.getByTestID('b_per_a_price').contains('1.00000000 DFI per BTC')
    cy.getByTestID('share_of_pool').contains('0.30000000%')
  })

  it('should update both token and build summary base on secondary token input', function () {
    cy.getByTestID('token_input_secondary').clear().type('2')

    cy.getByTestID('token_input_primary').should('have.value', '2.00000000')

    cy.getByTestID('a_per_b_price').contains('1.00000000 BTC per DFI')
    cy.getByTestID('b_per_a_price').contains('1.00000000 DFI per BTC')
    cy.getByTestID('share_of_pool').contains('0.20000000%')
    cy.getByTestID('button_continue_add_liq').click()
  })

  it('should have correct confirm info', function () {
    cy.getByTestID('text_add_amount').contains('2.00000000 DFI-BTC')
    cy.getByTestID('a_amount_unit').contains('DFI')
    cy.getByTestID('a_amount').contains('2.00000000')
    cy.getByTestID('b_amount_unit').contains('BTC')
    cy.getByTestID('b_amount').contains('2.00000000')
    cy.getByTestID('percentage_pool').contains('0.20000000%')
    cy.getByTestID('button_cancel_add').click()
  })

  it('should have updated confirm info', function () {
    cy.getByTestID('token_input_primary').clear().type('10')
    cy.getByTestID('button_continue_add_liq').click()
    cy.getByTestID('text_add_amount').contains('10.00000000 DFI-BTC')
    cy.getByTestID('a_amount_unit').contains('DFI')
    cy.getByTestID('a_amount').contains('10.00000000')
    cy.getByTestID('b_amount_unit').contains('BTC')
    cy.getByTestID('b_amount').contains('10.00000000')
    cy.getByTestID('percentage_pool').contains('1.00000000%')
    cy.getByTestID('button_confirm_add').click().wait(3000)
    cy.closeOceanInterface()
  })

  it('should have displayed pooled info', function () {
    cy.getByTestID('your_DFI-BTC').contains('10.00000000 DFI-BTC')
    cy.getByTestID('tokenA_DFI').contains('9.99999999 DFI')
    cy.getByTestID('tokenB_BTC').contains('9.99999999 BTC')

    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('balances_row_6').should('exist')
  })
})
