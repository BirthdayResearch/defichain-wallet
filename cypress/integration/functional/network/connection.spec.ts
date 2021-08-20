context('Network - Connection', () => {
  before(function () {
    cy.visit('/')
  })

  it('should display offline screen when no connection', () => {
    cy.goOffline()
    cy.getByTestID('connection_error').should('exist')
  })

  it('should hide offline screen when online', () => {
    cy.goOnline()
    cy.getByTestID('connection_error').should('not.exist')
  })
})
