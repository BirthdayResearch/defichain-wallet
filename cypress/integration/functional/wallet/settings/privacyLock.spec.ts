function enablePrivacyLock (): void {
  localStorage.setItem('Development.Local.PRIVACY_LOCK.enrolled', 'TRUE')
  cy.wait(500)
  expect(localStorage.getItem('Development.Local.PRIVACY_LOCK.enrolled')).equal('TRUE')
}

context('Wallet - Privacy Lock', () => {
  it('should be disabled by default for new wallet, action = enable', function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_settings').click()
    cy.getByTestID('view_toggle_privacy_lock').should('exist')
    cy.getByTestID('view_toggle_privacy_lock').contains('Enable Privacy Lock')
  })

  it('wallet independent, when enabled, action = disable', function () {
    enablePrivacyLock()
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_settings').click()
    cy.getByTestID('view_toggle_privacy_lock').should('exist')
    cy.getByTestID('view_toggle_privacy_lock').contains('Disable Privacy Lock')
  })
})
