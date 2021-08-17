context('Onboarding', () => {
  beforeEach(function () {
    cy.visit('/')
    cy.exitWallet()
  })

  it('should display elements', function () {
    cy.getByTestID('onboarding_carousel').should('exist')
    cy.getByTestID('create_wallet_button').should('exist').should('not.have.attr', 'disabled')
    cy.getByTestID('restore_wallet_button').should('exist').should('not.have.attr', 'disabled')
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

    cy.getByTestID('create_recovery_words_button').should('have.attr', 'disabled')
    cy.getByTestID('guidelines_switch').click()
    cy.getByTestID('create_recovery_words_button').should('not.have.attr', 'disabled')
    cy.getByTestID('create_recovery_words_button').click()

    cy.url().should('include', 'wallet/mnemonic/create')
    cy.go('back')
    cy.on('window:confirm', () => {
    })
    cy.getByTestID('guidelines_switch').should('exist')
    cy.getByTestID('create_recovery_words_button').click()
  })

  it('should redirect to restore wallet page', function () {
    cy.getByTestID('restore_wallet_button').click()
    cy.url().should('include', 'wallet/mnemonic/restore')
  })
})
