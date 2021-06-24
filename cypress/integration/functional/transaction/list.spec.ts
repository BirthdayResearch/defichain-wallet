context('app/transactions/list', () => {
  describe('wallet has 2 transactions in history', function () {
    before(() => {
      cy.createEmptyWallet()

      // setup transactions history, topup twice
      const baseURL = '/v0/playground/rpc'
      cy.intercept(`${baseURL}/sendtoaddress`).as('sendToAddress')
      cy.getByTestID('playground_wallet_top_up').click()
      cy.wait(['@sendToAddress'])
      cy.getByTestID('playground_wallet_top_up').click()
      cy.wait(['@sendToAddress'])

      // balances to be mined
      cy.wait(3100)

      // go to page for testing
      cy.getByTestID('bottom_tab_transactions').click()
    })

    it('should display 2 rows', () => {
      cy.getByTestID('transactions_screen_list').should('exist')
      cy.getByTestID('transaction_row_0').should('exist')
      cy.getByTestID('transaction_row_1').should('exist')
      // seems to be crashing (when trying to get element if testid not found)
      // cy.getByTestID('transaction_row_2').should('not.exist')
    })
  })
})
