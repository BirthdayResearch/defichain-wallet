context('wallet/settings', () => {
  beforeEach(() => {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_settings').click()
  })

  it('should change network and exit wallet when clicked', () => {
    cy.getByTestID('button_network_RemotePlayground').click()
    cy.getByTestID('button_network_RemotePlayground_check').should('exist')
    cy.getByTestID('setting_exit_wallet').click()
    cy.getByTestID('wallet_onboarding').contains('No wallets')
  })
})
