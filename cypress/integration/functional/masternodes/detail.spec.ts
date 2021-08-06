context('app/masternodes', () => {
  beforeEach(function () {
    cy.createEmptyWallet()
    cy.getByTestID('bottom_tab_masternodes').click()
    cy.getByTestID('masternodes_row_cffa7efca7e0d281e36b8172960d59d70ebf6a7c93c96a1b72b0fa9b0debffff').click()
  })

  it('should masternode details', function () {
    cy.getByTestID('masternodes_details').should('exist')
    cy.getByTestID('masternodes_details_Owner').should('exist')
    cy.getByTestID('masternodes_details_Operator').should('exist')
    cy.getByTestID('masternodes_details_Creation').should('exist')
    cy.getByTestID('masternodes_details_Resign').should('exist')
    cy.getByTestID('masternodes_details_State').should('exist')
    cy.getByTestID('masternodes_details_Minted').should('exist')
  })
})
