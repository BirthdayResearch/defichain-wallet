import {} from 'cypress'

context('wallet/settings', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('URL'))
    cy.getBySel('playground_wallet_abandon').click()
    cy.getBySel('bottom_tab_settings').click()
  })

  it('should exit wallet when clicked', () => {
    cy.getBySel('setting_exit_wallet').click()
    cy.getBySel('wallet_onboarding').contains('No wallets')
  })
})
