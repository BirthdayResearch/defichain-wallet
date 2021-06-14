import {} from 'cypress'

context('wallet/settings', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('URL'))
    cy.getByTestID('playground_wallet_abandon').click()
    cy.getByTestID('bottom_tab_settings').click()
  })

  it('should exit wallet when clicked', () => {
    cy.getByTestID('setting_exit_wallet').click()
    cy.getByTestID('wallet_onboarding').contains('No wallets')
  })
})
