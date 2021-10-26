/*
function enablePrivacyLock (): void {
  localStorage.setItem('Development.Local.PRIVACY_LOCK.enrolled', 'TRUE')
  cy.wait(500)
  expect(localStorage.getItem('Development.Local.PRIVACY_LOCK.enrolled')).equal('TRUE')
}

context('Wallet - Privacy Lock', () => {
  it('should be disabled by default for new wallet, action = enable', function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('switch_privacy_lock').should('not.exist')
  })

  it.skip('wallet independent, when enabled, action = disable', function () {
    enablePrivacyLock()
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('switch_privacy_lock').within(() => {
      cy.get('input').should('have.attr', 'aria-disabled')
      cy.get('input').should('be.checked')
    })
  })
})
*/
