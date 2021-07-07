context('app/dex/addLiquidity', () => {
  beforeEach(function () {
    cy.createEmptyWallet()

    cy.getByTestID('bottom_tab_settings').click()
    // fund DFI token involve multiple actions, ready in 2 blocks
    cy.sendDFItoWallet().sendTokenToWallet(['DFI', 'BTC']).wait(10000)
    cy.getByTestID('playground_wallet_fetch_balances').click()

    cy.getByTestID('bottom_tab_liquidity').click()
    cy.getByTestID('pool_pair_add_DFI-BTC').click()
    cy.wait(100)
    cy.getByTestID('token_balance_primary').contains('10')
    cy.getByTestID('token_balance_secondary').contains('10')

    cy.getByTestID('token_input_secondary').invoke('attr', 'type', 'text').type('7.8')
    cy.getByTestID('button_continue_add_liq').click()
  })

  it('should be able to complete add liquidity', function () {
    cy.getByTestID('confirm-root').should('exist')
    cy.getByTestID('text_adding_0').contains('7.8 DFI')
    cy.getByTestID('text_adding_1').contains('7.8 BTC')

    cy.getByTestID('text_fee_0').contains('0.0001')

    cy.getByTestID('text_price_0').contains('1 BTC / DFI')
    cy.getByTestID('text_price_1').contains('1 DFI / BTC')

    // lm token amount and % is calculated = percentage * total pool, may vary like 7.7999999 or 7.80000001
    cy.getByTestID('text_liquidity_tokens_received_0').contains('7.').contains('DFI-BTC')

    cy.getByTestID('button_confirm_add_liq').click()
    cy.wait(4000)

    // redirected back to dex root page
    cy.getByTestID('liquidity_screen_list').should('exist')

    // wait balance update
    cy.wait(3100)
    cy.getByTestID('bottom_tab_settings').click()
    cy.getByTestID('playground_wallet_fetch_balances').click()
    cy.getByTestID('bottom_tab_liquidity').click()

    cy.getByTestID('pool_pair_row_your').contains('7.80 DFI-BTC')
  })
})
