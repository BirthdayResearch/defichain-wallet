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
    cy.getByTestID('transaction_row_0').click()
  })

  it('should display', () => {
    cy.getByTestID('transaction-detail-type').should('exist')
    cy.getByTestID('transaction-detail-amount').should('exist')
    cy.getByTestID('transaction-detail-block').should('exist')
    cy.getByTestID('transaction-detail-explorer-url').should('exist')
  })
})
