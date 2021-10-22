context('Wallet - DEX - guidelines', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_dex').click()
    cy.url().should('include', 'app/DEX/DexScreen')
  })

  it('should show dex guidelines on first load', function () {
    cy.getByTestID('dex_guidelines_screen').should('exist')
  })

  it('should able to close dex guidelines from close button at bottom and on next dex click, dex listing screen should visible', function () {
    cy.url().should('include', 'app/DEX/DexScreen')
    cy.getByTestID('dex_guidelines_screen').should('exist')
    cy.getByTestID('close_dex_guidelines').click()
    cy.url().should('include', 'app/DEX/DexScreen')
    cy.getByTestID('liquidity_screen_list').should('exist')
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('bottom_tab_dex').click()
    cy.url().should('include', 'app/DEX/DexScreen')
  })
})

context('Wallet - DEX - guidelines translation check', () => {
  before(function () {
    cy.createEmptyWallet(true)
  })

  it('should verify all translation for DEX - guidelines', function () {
    cy.checkLnTextContent((): void => {
      cy.getByTestID('bottom_tab_dex').click()
      cy.getByTestID('dex_guidelines_screen').should('exist')
    }, 'screens/DexGuidelines')
  })
})
