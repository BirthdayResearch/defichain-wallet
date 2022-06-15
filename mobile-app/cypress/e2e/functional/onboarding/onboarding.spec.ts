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
    cy.getByTestID('create_recovery_words_button').should('have.attr', 'aria-disabled')

    // Learn More Recovery
    cy.getByTestID('recovery_words_button').click()
    cy.url().should('include', 'wallet/onboarding/guidelines/recovery')
    cy.getByTestID('recovery_words_faq').should('exist')
    cy.getByTestID('recovery_words_faq_accordion').should('exist')
    cy.go('back')

    cy.getByTestID('create_recovery_words_button').should('have.attr', 'aria-disabled')
    cy.getByTestID('guidelines_switch').click()
    cy.getByTestID('create_recovery_words_button').should('not.have.attr', 'disabled')
    cy.getByTestID('create_recovery_words_button').click()

    cy.url().should('include', 'wallet/mnemonic/create')
    cy.go('back')
    cy.on('window:confirm', () => {
    })
    cy.getByTestID('guidelines_switch').should('exist')
  })

  it('should be able to change network in create wallet page', function () {
    cy.getByTestID('create_wallet_button').click()
    cy.url().should('include', 'wallet/onboarding/guidelines')
    cy.getByTestID('header_active_network').first().click()
    cy.getByTestID('onboarding_network_selection_screen').should('exist')
    cy.getByTestID('button_network_Playground').click()
    cy.on('window:confirm', (message: string) => {
      expect(message).to.include('Playground')
    })
    cy.getByTestID('header_active_network').contains('Playground')
  })

  it('should redirect to restore wallet page', function () {
    cy.getByTestID('restore_wallet_button').click()
    cy.url().should('include', 'wallet/mnemonic/restore')
  })

  it('should be able to change network in restore wallet page', function () {
    cy.getByTestID('restore_wallet_button').click()
    cy.url().should('include', 'wallet/mnemonic/restore')
    cy.getByTestID('header_active_network').first().click()
    cy.getByTestID('onboarding_network_selection_screen').should('exist')
    cy.getByTestID('button_network_Playground').click()
    cy.on('window:confirm', (message: string) => {
      expect(message).to.include('Playground')
    })
    cy.getByTestID('header_active_network').contains('Playground')
  })
})
