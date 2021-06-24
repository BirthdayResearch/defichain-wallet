context('app/transactions/detail', () => {
  before(() => {
    cy.createEmptyWallet()

    // setup transactions history
    const baseURL = '/v0/playground/rpc'
    cy.intercept(`${baseURL}/sendtoaddress`).as('sendToAddress')
    cy.getByTestID('playground_wallet_top_up').click()
    cy.wait(['@sendToAddress'])

    // balances to be mined
    cy.wait(3100)

    // go to page for testing
    cy.getByTestID('bottom_tab_transactions').click()
  })

  it('should display', () => {
    cy.getByTestID('transaction_row_0').click()
  })
})
