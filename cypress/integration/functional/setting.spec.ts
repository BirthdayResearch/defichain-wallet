import {} from 'cypress'

context('wallet/settings', () => {
  beforeEach(() => {
    cy.viewport(1000, 800)
    cy.visit(Cypress.env('URL'))
    cy.get('[data-testid="playground_wallet_abandon"]').click()
    cy.get('[data-testid="bottom_tab_settings"]').click()
  })

  it('should exit wallet when clicked', () => {
    cy.get('[data-testid="setting_exit_wallet"]').click()
    cy.get('[data-testid="wallet_setup"]').contains('Wallet Setup')
  })
})
