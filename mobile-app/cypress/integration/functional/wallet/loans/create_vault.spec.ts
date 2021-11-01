context('Wallet - Loans - Create vault', () => {
  beforeEach(function () {
    cy.allowLoanFeature()
    cy.createEmptyWallet(true)
  })

  it('should display empty vault screen', function () {
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('empty_vault').should('exist')
  })

  it('should navigate to create vault screen', function () {
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('button_create_vault').click()
    cy.getByTestID('create_vault_screen').should('exist')
  })

  it('should validate initial form in create vault screen', function () {
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('button_create_vault').click()
    cy.getByTestID('create_vault_submit_button').should('have.attr', 'aria-disabled')
    cy.getByTestID('loan_scheme_options').should('exist')
    cy.getByTestID('loan_scheme_option_0').should('exist') // at least one option is available
  })

  it('should allow to submit', function () {
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('button_create_vault').click()
    cy.getByTestID('loan_scheme_option_0').click()
    cy.getByTestID('create_vault_submit_button').should('not.have.attr', 'disabled')
  })
})

context('Wallet - Loans - Confirm create vault', () => {
  beforeEach(function () {
    cy.allowLoanFeature()
    cy.createEmptyWallet(true)
  })

  it('should navigate to confirm create vault screen', function () {
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('button_create_vault').click()
    cy.getByTestID('loan_scheme_option_0').click()
    cy.getByTestID('create_vault_submit_button').click()
    cy.getByTestID('confirm_create_vault_screen').should('exist')
  })

  it('should be able to cancel and return to create vault screen', function () {
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('button_create_vault').click()
    cy.getByTestID('loan_scheme_option_0').click()
    cy.getByTestID('create_vault_submit_button').click()
    cy.getByTestID('button_cancel_create_vault').click()
    cy.getByTestID('create_vault_screen').should('exist')
  })
})
