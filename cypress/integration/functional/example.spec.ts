import {} from 'cypress'

context('cypress example', () => {
  beforeEach(() => {
    cy.viewport(375, 667)
    cy.visit(Cypress.env('URL'))
  })

  // TODO(wallet): need a way to get element consistently
  it('should click and update count', () => {
    cy.contains('Click').click()
    cy.contains('Count: 2')
  })
})
