context('Wallet - Transaction - Detail', () => {
  before(() => {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().wait(4000)
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
