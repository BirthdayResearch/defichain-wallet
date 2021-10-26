context('Wallet - Token Detail', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
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

context('Wallet - Token Detail Defiscan redirection', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
  })

  it('should able to redirect to defiscan for BTC', function () {
    cy.sendTokenToWallet(['BTC']).wait(10000)
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('balances_row_1').should('exist')
    cy.getByTestID('balances_row_1_amount').contains(10)
    cy.getByTestID('balances_row_1').click().wait(3000)
    cy.getByTestID('token_detail_explorer_url').should('exist')
  })
})
