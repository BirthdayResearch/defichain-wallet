context('Wallet - Transaction - Empty', () => {
  describe('new wallet', function () {
    before(() => {
      cy.createEmptyWallet(true)
      cy.getByTestID('bottom_tab_transactions').click()
    })

    it('should display 0 row', () => {
      cy.getByTestID('transactions_screen_list').should('not.exist')
      cy.getByTestID('transaction_row_0').should('not.exist')
    })

    it('LOAD MORE should not exist', () => {
      cy.getByTestID('transactions_list_loadmore').should('not.exist')
    })

    it('should display empty transaction text', () => {
      cy.getByTestID('empty_transaction').should('exist')
    })

    it('should display RECEIVE TOKENS', () => {
      cy.getByTestID('button_receive_coins').should('exist')
    })

    it('should navigate to receive screen', () => {
      cy.getByTestID('button_receive_coins').should('exist').click()
      cy.getByTestID('receive_screen').should('exist')
    })
  })
})
