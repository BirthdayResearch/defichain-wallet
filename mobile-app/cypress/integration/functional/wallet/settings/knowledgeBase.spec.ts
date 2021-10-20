context('Wallet - Settings', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('setting_navigate_About').click()
    cy.getByTestID('knowledge_base_link').should('exist').click()
  })

  it('should navigate to knowledge base page', function () {
    cy.url().should('include', 'app/KnowledgeBaseScreen')
    cy.getByTestID('knowledge_base_screen').should('exist')
  })

  it('should navigate to recovery words faq from knowledge base page', function () {
    cy.getByTestID('recovery_words_faq').should('exist').click()
    cy.url().should('include', 'app/RecoveryWordsFaq')
    cy.go('back')
    cy.url().should('include', 'app/KnowledgeBaseScreen')
  })

  it('should navigate to passcode faq from knowledge base page', function () {
    cy.getByTestID('passcode_faq').should('exist').click()
    cy.url().should('include', 'app/PasscodeFaq')
    cy.go('back')
    cy.url().should('include', 'app/KnowledgeBaseScreen')
  })

  it('should navigate to UTXO vs Token faq from knowledge base page', function () {
    cy.getByTestID('utxo_and_token_faq').should('exist').click()
    cy.url().should('include', 'app/TokensVsUtxo')
    cy.go('back')
    cy.url().should('include', 'app/KnowledgeBaseScreen')
  })
})
