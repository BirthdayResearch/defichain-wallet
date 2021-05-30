import {} from 'cypress'

context('cypress example', () => {
  beforeEach(() => {
    cy.viewport(1000, 800)
    cy.visit(Cypress.env('URL'))
    cy.get('[data-testid="playground_wallet_abandon"]').click()
  })

  it('should click and update count', () => {
    cy.get('[data-testid="count_btn"]').click()
    cy.get('[data-testid="count_text"]').contains('Count: 2')
    cy.wait(3000)

    cy.get('[data-testid="count_btn"]').click()
    cy.get('[data-testid="count_text"]').contains('Count: 4')
    cy.wait(3000)

    cy.get('[data-testid="count_btn"]').click()
    cy.get('[data-testid="count_text"]').contains('Count: 6')
    cy.wait(3000)

    cy.get('[data-testid="count_btn"]').click()
    cy.get('[data-testid="count_text"]').contains('Count: 8')
  })
})
