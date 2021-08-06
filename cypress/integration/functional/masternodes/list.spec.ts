context('app/masternodes', () => {
  beforeEach(function () {
    cy.createEmptyWallet()
    cy.getByTestID('bottom_tab_masternodes').click()
  })

  it('should display 2 rows', function () {
    cy.getByTestID('masternodes_list').should('exist')
    cy.getByTestID('masternodes_row_cffa7efca7e0d281e36b8172960d59d70ebf6a7c93c96a1b72b0fa9b0debffff').should('exist')
    cy.getByTestID('masternodes_row_cffa7efca7e0d281e36b8172960d59d70ebf6a7c93c96a1b72b0fa9b0debffff_Owner').contains('8cV4ZzHMC6YJWZN5kRYMEFvJUvfMK3wL4r')
    cy.getByTestID('masternodes_row_cffa7efca7e0d281e36b8172960d59d70ebf6a7c93c96a1b72b0fa9b0debffff_Operator').contains('8a4HMKno7Q1iQQ74KvDviSgm9j624fMban')
    cy.getByTestID('masternodes_row_cffa7efca7e0d281e36b8172960d59d70ebf6a7c93c96a1b72b0fa9b0debffff_State').contains('RESIGNED')
    cy.getByTestID('masternodes_row_800e3e601da9a33ffbb8773c8c94039fb408b86d5639fa232a53d469402cfbff').should('exist')
    cy.getByTestID('masternodes_row_800e3e601da9a33ffbb8773c8c94039fb408b86d5639fa232a53d469402cfbff_Owner').contains('8NCiGjmuh4pSCqk9ru73GhLhZuCYT3QHX7')
    cy.getByTestID('masternodes_row_800e3e601da9a33ffbb8773c8c94039fb408b86d5639fa232a53d469402cfbff_Owner').contains('8NCiGjmuh4pSCqk9ru73GhLhZuCYT3QHX7')
    cy.getByTestID('masternodes_row_800e3e601da9a33ffbb8773c8c94039fb408b86d5639fa232a53d469402cfbff_State').contains('ENABLED')
  })
})
