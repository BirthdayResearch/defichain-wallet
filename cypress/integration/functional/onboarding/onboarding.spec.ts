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
    cy.url().should('include', 'wallet/onboarding/guidelines')
    cy.getByTestID('create_recovery_words_button').should('have.attr', 'disabled')

    // Learn More Recovery
    cy.getByTestID('recovery_words_button').click()
    cy.url().should('include', 'wallet/onboarding/guidelines/recovery')
    cy.go('back')

    cy.getByTestID('guidelines_switch').click()
    cy.getByTestID('create_recovery_words_button').click()
    cy.url().should('include', 'wallet/mnemonic/create')
  })

  it('should redirect to restore wallet page', function () {
    cy.getByTestID('restore_wallet_button').click()
    cy.url().should('include', 'wallet/mnemonic/restore')
  })
})
