context('Wallet - Confirm Add Liquidity', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)

    cy.getByTestID('bottom_tab_settings').click()
    // fund DFI token involve multiple actions, ready in 2 blocks
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(['BTC']).wait(10000)

    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('pool_pair_add_DFI-BTC').click()
    cy.wait(100)
    cy.getByTestID('token_balance_primary').contains('10')
    cy.getByTestID('token_balance_secondary').contains('10')

    cy.getByTestID('token_input_secondary').invoke('attr', 'type', 'text').type('7.8')
    cy.getByTestID('button_continue_add_liq').click()
  })

  it('should be able to complete add liquidity', function () {
    cy.getByTestID('confirm-root').should('exist')
    cy.getByTestID('button_cancel_add').click()
    cy.getByTestID('token_input_primary').should('exist')
    cy.getByTestID('button_continue_add_liq').click()

    cy.getByTestID('a_amount').contains('7.80000000')
    cy.getByTestID('b_amount').contains('7.80000000')

    cy.getByTestID('text_fee').should('exist')

    cy.getByTestID('price_a').contains('1.00000000 BTC per DFI')
    cy.getByTestID('price_b').contains('1.00000000 DFI per BTC')

    // lm token amount and % is calculated = percentage * total pool, may vary like 7.7999999 or 7.80000001
    cy.getByTestID('text_add_amount').contains('7.').contains('DFI-BTC')

    cy.getByTestID('button_confirm_add').click()
    cy.closeOceanInterface()

    // redirected back to dex root page
    cy.getByTestID('liquidity_screen_list').should('exist')

    // wait balance update
    cy.wait(3100)
    cy.getByTestID('bottom_tab_settings').click()
    cy.fetchWalletBalance()
    cy.getByTestID('bottom_tab_dex').click()

    cy.getByTestID('pool_pair_row_your').contains('7.80000000 DFI-BTC')
  })
})
