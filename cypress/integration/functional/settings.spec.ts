context('wallet/settings', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true).wait(3000)
    cy.getByTestID('bottom_tab_settings').click()
  })

  it('should change network when clicked', function () {
    cy.getByTestID('button_network_RemotePlayground').click()
    cy.getByTestID('button_network_RemotePlayground_check').should('exist')
  })

  it('should exit wallet when clicked', function () {
    cy.getByTestID('setting_exit_wallet').click()
    cy.getByTestID('wallet_onboarding').contains('No wallets')
  })
})
