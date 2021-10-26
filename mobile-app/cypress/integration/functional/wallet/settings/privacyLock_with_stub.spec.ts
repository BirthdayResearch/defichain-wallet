/*
// import * as LocalAuthentication from 'expo-local-authentication'

context.skip('Wallet - Privacy Lock', () => {
  before(function () {
    /!**
     * FIXME:
     * stub LocalAuthentication require recompile
     * error: `require appropriate loader` when local authentication import direct from react-native
     *!/
    // cy.stub(LocalAuthentication, 'hasHardwareAsync').returns(true)
    // cy.stub(LocalAuthentication, 'getEnrolledLevelAsync').returns(1) // 0: unprotected, 1: pin, 2: biometric
    // cy.stub(LocalAuthentication, 'authenticateAsync').returns({ success: true })
  })

  it('should be able to enable privacy lock', function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('text_privacy_lock').should('exist').contains('Privacy Lock')
    cy.getByTestID('switch_privacy_lock').should('exist')

    cy.getByTestID('switch_privacy_lock').within(() => {
      cy.get('input').should('not.have.attr', 'disabled')
      cy.get('input').should('not.be.checked')
    })
    cy.getByTestID('switch_privacy_lock').click() // followed with prompt and mocked result
    cy.getByTestID('switch_privacy_lock').within(() => {
      cy.get('input').should('be.checked')
    })
  })

  it('should be able to disable privacy lock', function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('switch_privacy_lock').click()
    cy.getByTestID('switch_privacy_lock').within(() => {
      cy.get('input').should('not.be.checked')
    })
  })
})
*/
