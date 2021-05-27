import {} from 'cypress'

context('cypress example', () => {
  beforeEach(() => {
    cy.viewport(1000, 800)
    cy.visit(Cypress.env('URL'))
  })

  // TODO(wallet): need a way to get element consistently
  //  we could use testID="example"
  //  select via data-testid="example"
  it('should click and update count', () => {
    cy.wait(1000)
    cy.contains('Click').click()
    cy.contains('Count: 2')
    cy.wait(1000)
  })
})
