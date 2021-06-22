context('wallet/balances', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_settings').click()

    cy.intercept('/v0/playground/rpc/sendtoaddress').as('sendToAddress')
    cy.intercept('/v0/playground/rpc/sendtokenstoaddress').as('sendTokensToAddress')
    cy.getByTestID('playground_wallet_top_up').click()
    cy.getByTestID('playground_token_BTC').click()
    cy.wait(['@sendToAddress', '@sendTokensToAddress'])
    cy.wait(4000)

    cy.getByTestID('playground_wallet_fetch_balances').click()
    cy.getByTestID('bottom_tab_balances').click()
  })

  it('should display DFI and BTC tokens with correct amounts', function () {
    cy.getByTestID('balances_list').should('exist')
    // Check if title exists
    cy.getByTestID('balances_title').should('exist').contains('Portfolio')
    // Check if DFI exists
    cy.getByTestID('balances_row_0').should('exist')
    // Check if tBTC exists
    cy.getByTestID('balances_row_1').should('exist')
    // Check if DFI amount is correct
    cy.getByTestID('balances_row_0_amount').contains(50)
    // Check if tBTC amount is correct
    cy.getByTestID('balances_row_1_amount').contains(100)
  })
})
