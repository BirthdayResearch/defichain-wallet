context('wallet/balances', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_settings').click()
    cy.sendDFItoWallet().sendTokenToWallet(['DFI', 'BTC', 'ETH']).wait(10000)
    cy.getByTestID('playground_wallet_fetch_balances').click()
    cy.getByTestID('bottom_tab_balances').click()
  })

  it('should display utxoDFI, DFI, BTC and ETH with correct amounts', function () {
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('balances_row_0_utxo').should('exist')
    cy.getByTestID('balances_row_0_utxo_amount').contains(10)
    cy.getByTestID('balances_row_0').should('exist')
    cy.getByTestID('balances_row_0_amount').contains(10)
    cy.getByTestID('balances_row_1').should('exist')
    cy.getByTestID('balances_row_1_amount').contains(10)
    cy.getByTestID('balances_row_2').should('exist')
    cy.getByTestID('balances_row_2_amount').contains(10)
  })

  it('should display navigation buttons and be able to redirect', function () {
    cy.getByTestID('button_RECEIVE').should('exist').click()
    cy.location().should((loc) => {
      expect(loc.href).contains('Receive')
    })
  })
})
