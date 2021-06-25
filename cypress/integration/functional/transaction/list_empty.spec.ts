context('app/transactions/list', () => {
  describe('new wallet', function () {
    before(() => {
      cy.createEmptyWallet()
      cy.getByTestID('bottom_tab_transactions').click()
    })

    it('should display 0 row', () => {
      cy.getByTestID('transactions_screen_list').should('exist')
      cy.getByTestID('transaction_row_0').should('not.exist')
    })

    it('LOAD MORE should not exist', () => {
      cy.getByTestID('transactions_list_loadmore').should('not.exist')
    })
  })
})
