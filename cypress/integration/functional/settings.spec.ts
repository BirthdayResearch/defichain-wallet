context('wallet/settings', () => {
  beforeEach(() => {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_settings').click()
  })

  it('should exit wallet when clicked', () => {
    cy.getByTestID('setting_exit_wallet').click()
    cy.getByTestID('wallet_onboarding').contains('No wallets')
  })

  it('should change network when clicked', () => {
    cy.getByTestID('button_network_RemotePlayground').click()
    cy.getByTestID('button_network_RemotePlayground_check').should('exist')
  })
})
