context('app/transactions/list', () => {
  describe('wallet has more than 1 page of transactions in history', function () {
    before(() => {
      cy.createEmptyWallet()

      // setup transactions history
      const baseURL = '/v1/playground/rpc'
      cy.intercept(`${baseURL}/sendtoaddress`).as('sendToAddress')

      // whale has default query limit of 30 per page
      for (let i = 0; i < 31; i++) {
        cy.getByTestID('playground_wallet_top_up').click()
        cy.wait(['@sendToAddress'])
      }
      cy.wait(4000)

      cy.getByTestID('bottom_tab_transactions').click()
      cy.wait(500)
    })

    it('should display 30 rows on first load and 1 more row after load more', () => {
      for (let i = 0; i < 30; i++) {
        cy.getByTestID(`transaction_row_${i}`).should('exist')
      }

      // 31st row
      cy.getByTestID('transaction_row_30').should('not.exist')

      // load page 2
      cy.getByTestID('transactions_list_loadmore').click()
      cy.wait(500)

      cy.getByTestID('transaction_row_30').should('exist')
    })
  })
})
