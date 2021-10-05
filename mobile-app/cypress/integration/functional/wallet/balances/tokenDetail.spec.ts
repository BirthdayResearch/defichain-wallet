context('Wallet - Token Detail', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_settings').click()
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(['BTC']).wait(10000)
    cy.getByTestID('bottom_tab_balances').click()
  })

  it('should be able to click token BTC', function () {
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('balances_row_1').should('exist')
    cy.getByTestID('balances_row_1_amount').contains(10)
    cy.getByTestID('balances_row_1').click()
    cy.getByTestID('token_detail_amount').contains(10)
    cy.getByTestID('send_button').should('exist')
    cy.getByTestID('receive_button').should('exist')
    cy.getByTestID('convert_button').should('not.exist')
  })
})
