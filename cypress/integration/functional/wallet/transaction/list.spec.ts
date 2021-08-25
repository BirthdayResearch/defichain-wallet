context('Wallet - Transaction - List', () => {
  describe('wallet has 2 transactions in history', function () {
    before(() => {
      cy.visit('/')
      cy.createEmptyWallet(true)
      cy.sendDFItoWallet().sendDFItoWallet().wait(4000)
      cy.getByTestID('bottom_tab_transactions').click()
    })

    it('should display skeleton loader when API has yet to return', () => {
      cy.intercept('**/transactions?size=*', {
        body: {
          data: [
            {}
          ]
        },
        delay: 3000
      })
      cy.getByTestID('transaction_skeleton_loader').should('exist')
    })

    it('should not display skeleton loader when API has return', () => {
      cy.intercept('**/transactions?size=*').as('getTransactions')
      cy.wait('@getTransactions').then(() => {
        cy.getByTestID('transaction_skeleton_loader').should('not.exist')
      })
    })

    it('should display 2 rows', () => {
      cy.getByTestID('transactions_screen_list').should('exist')
      cy.getByTestID('transaction_row_0').should('exist')
      cy.getByTestID('transaction_row_1').should('exist')
      // seems to be crashing (when trying to get element if testid not found)
      // cy.getByTestID('transaction_row_2').should('not.exist')
    })

    it('should not display empty transaction text', () => {
      cy.getByTestID('empty_transaction').should('not.exist')
    })

    it('RECEIVE COINS should not exist', () => {
      cy.getByTestID('button_receive_coins').should('not.exist')
    })
  })
})
