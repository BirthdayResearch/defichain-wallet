context('wallet/onboarding', () => {
  beforeEach(function () {
    cy.visit('/')
    cy.getByTestID('playground_wallet_clear').click()
  })

  it('should display elements', function () {
    cy.getByTestID('onboarding_carousel').should('exist')
    cy.getByTestID('create_wallet_button').should('exist')
    cy.getByTestID('restore_wallet_button').should('exist')
  })

  //* Will be expanded once other screens are ready
  it('should be able to create wallet', function () {
    cy.getByTestID('create_wallet_button').click()
    cy.url().should('include', 'wallet/mnemonic/create')
  })

  //* Will be expanded once other screens are ready
  it('should be able to restore wallet', function () {
    cy.getByTestID('restore_wallet_button').click()
    cy.url().should('include', 'wallet/mnemonic/restore')
  })
})
