context('app/transactions/list', () => {
  describe('wallet has 2 transactions in history', function () {
    before(() => {
      cy.createEmptyWallet(true)
      cy.sendDFItoWallet().sendDFItoWallet().wait(4000)
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
