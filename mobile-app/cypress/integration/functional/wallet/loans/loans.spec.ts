context('Wallet - Loans', () => {
  it('should have loans in bottom tab navigator', function () {
    cy.allowLoanFeature()
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_loans').should('exist')
  })
})

context('Wallet - Loans Feature Gated', () => {
  it('should not have loans tab if loan feature is blocked', function () {
    cy.intercept('**/settings/flags', {
      body: []
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_loans').should('not.exist')
  })

  it('should not have loans tab if feature flag api does not contains loan', function () {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'foo',
          name: 'bar',
          stage: 'alpha',
          version: '>=0.0.0',
          description: 'foo'
        }
      ]
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_loans').should('not.exist')
  })

  it('should not have loans tab if feature flag api failed', function () {
    cy.intercept('**/settings/flags', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_loans').should('not.exist')
  })

  it('should not have loans tab if loan feature is beta and not activated by user', function () {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'loan',
          name: 'Loan',
          stage: 'beta',
          version: '>=0.0.0',
          description: 'Loan'
        }
      ]
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_loans').should('not.exist')
  })

  it('should have loans tab if loan feature is public', function () {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'loan',
          name: 'Loan',
          stage: 'public',
          version: '>=0.0.0',
          description: 'Loan'
        }
      ]
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_loans').should('exist')
  })
})
