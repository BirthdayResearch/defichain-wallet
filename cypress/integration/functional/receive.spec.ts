context('wallet/balances/receive', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('playground_wallet_top_up').click()
    cy.getByTestID('playground_wallet_fetch_balances').click()
    cy.getByTestID('playground_wallet_random').should('exist')
    // cy.getByTestID('bottom_tab_balances').click()
  })

  // Access receive button
  it('should display valid address when clicked', function () {
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('balances_row_0_utxo').click()
    cy.getByTestID('receive_button').click()
  })

  // Copy DFI address
  it('should copy address when clicked', function () {
    cy.getByTestID('qr_code_container').should('exist')
    cy.getByTestID('address_text').should('exist')
    cy.getByTestID('copy_button').should('exist')
    cy.getByTestID('copy_button').click()
  })
})
