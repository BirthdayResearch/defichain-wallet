context('wallet/settings', () => {
  it('should change network when clicked', function () {
    cy.createEmptyWallet(true).wait(10000)
    cy.getByTestID('bottom_tab_settings').click()
    cy.getByTestID('button_network_RemotePlayground').click()
    cy.getByTestID('button_network_RemotePlayground_check').should('exist')
  })

  it('should exit wallet when clicked', function () {
    cy.createEmptyWallet(true).wait(10000)
    cy.getByTestID('bottom_tab_settings').click()
    cy.getByTestID('setting_exit_wallet').click()
    cy.getByTestID('wallet_onboarding').contains('No wallets')
  })
})
