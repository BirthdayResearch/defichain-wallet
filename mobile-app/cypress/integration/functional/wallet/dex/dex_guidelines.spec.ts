context('Wallet - DEX - guidelines', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_dex').click()
    cy.url().should('include', 'app/DEX/DexGuidelines')
  })

  it('should show dex guidelines on first load', function () {
    cy.getByTestID('dex_guidelines_screen').should('exist')
  })

  it('should able to close dex guidelines from close button at bottom and on next dex click, dex listing screen should visible', function () {
    cy.url().should('include', 'app/DEX/DexGuidelines')
    cy.getByTestID('dex_guidelines_screen').should('exist')
    cy.getByTestID('close_dex_guidelines').click()
    cy.url().should('include', 'app/DEX/DexScreen')
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('bottom_tab_dex').click()
    cy.url().should('include', 'app/DEX/DexScreen')
  })

  it('should able to close dex guidelines from header close button and on next dex click, dex listing screen should visible', function () {
    cy.url().should('include', 'app/DEX/DexGuidelines')
    cy.getByTestID('dex_guidelines_screen').should('exist')
    cy.getByTestID('header_close_dex_guidelines').click().wait(1000)
    cy.url().should('include', 'app/DEX/DexScreen')
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('bottom_tab_dex').click()
    cy.url().should('include', 'app/DEX/DexScreen')
  })
})
