context('wallet/settings', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_settings').click()
  })

  it('should change network when clicked', function () {
    cy.getByTestID('button_network_LocalPlayground_check').should('exist')
    cy.getByTestID('button_network_RemotePlayground').click()
  })

  it('should exit wallet when clicked', function () {
    cy.getByTestID('setting_exit_wallet').click()
    cy.getByTestID('wallet_onboarding').contains('No wallets')
  })
})
