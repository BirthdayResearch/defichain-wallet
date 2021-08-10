context('app/masternodes', () => {
  beforeEach(function () {
    cy.createEmptyWallet()
    cy.getByTestID('bottom_tab_masternodes').click()
  })

  it('should display list', function () {
    cy.getByTestID('masternodes_list').should('exist')
    cy.getByTestID('masternodes_row_0').should('exist')
    cy.getByTestID('masternodes_row_0_Owner').contains('8cV4ZzHMC6YJWZN5kRYMEFvJUvfMK3wL4r')
    cy.getByTestID('masternodes_row_0_Operator').contains('Same as owner')
    cy.getByTestID('masternodes_row_0_State').contains('RESIGNED')
    cy.getByTestID('masternodes_row_1').should('exist')
    cy.getByTestID('masternodes_row_1_Owner').contains('8NCiGjmuh4pSCqk9ru73GhLhZuCYT3QHX7')
    cy.getByTestID('masternodes_row_1_Owner').contains('8NCiGjmuh4pSCqk9ru73GhLhZuCYT3QHX7')
    cy.getByTestID('masternodes_row_1_State').contains('ENABLED')
  })

  it('should have createmn button and get navigated to createmn screen', function () {
    cy.getByTestID('button_create_masternode').should('exist')
    cy.getByTestID('button_create_masternode').click()
    cy.getByTestID('address_type_radio').should('exist')
  })
})
