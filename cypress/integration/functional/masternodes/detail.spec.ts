context('app/masternodes', () => {
  beforeEach(function () {
    cy.createEmptyWallet()
    cy.getByTestID('bottom_tab_masternodes').click()
    cy.getByTestID('masternodes_row_0').click()
  })

  it('should masternode details', function () {
    cy.getByTestID('masternodes_details').should('exist')
    cy.getByTestID('masternodes_details_Owner').should('exist')
    cy.getByTestID('masternodes_details_Operator').should('exist')
    cy.getByTestID('masternodes_details_State').should('exist')
    cy.getByTestID('masternodes_details_Minted').should('exist')
    // cy.getByTestID('masternodes_details_Creation').should('exist')
    // cy.getByTestID('masternodes_details_Resign').should('exist')
  })
})
