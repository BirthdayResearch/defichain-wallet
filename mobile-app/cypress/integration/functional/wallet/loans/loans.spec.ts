context('Wallet - Loans', () => {
  it('should have loans in bottom tab navigator', function () {
    cy.getByTestID('bottom_tab_loans').should('exist')
  })

  it('should display loans screen', function () {
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('loans_screen').should('exist')
    cy.getByTestID('loans_tabs').should('exist')
    cy.getByTestID('loans_cards').should('exist')
  })
})
