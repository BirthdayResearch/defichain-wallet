context('wallet/balances', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    const baseURL = '/v1/playground/rpc'
    cy.intercept(`${baseURL}/sendtoaddress`).as('sendToAddress')
    cy.intercept(`${baseURL}/sendtokenstoaddress`).as('sendTokensToAddress')
    cy.getByTestID('bottom_tab_settings').click()
    cy.getByTestID('playground_wallet_top_up').click()
    cy.getByTestID('playground_token_tBTC').click()
    cy.wait(['@sendToAddress', '@sendTokensToAddress'])
    cy.wait(4000)
    cy.getByTestID('playground_wallet_fetch_balances').click()
    cy.getByTestID('bottom_tab_balances').click()
  })

  it('should display DFI and BTC tokens with correct amounts', function () {
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('balances_title').should('exist').contains('Portfolio')
    cy.getByTestID('balances_row_0').should('exist')
    cy.getByTestID('balances_row_1').should('exist')
    cy.getByTestID('balances_row_0_amount').contains(50)
    cy.getByTestID('balances_row_1_amount').contains(100)
  })

  it('should display navigation buttons and be able to redirect', function () {
    cy.getByTestID('button_receive').should('exist').click()
    cy.location().contains('receive')
  })
})
