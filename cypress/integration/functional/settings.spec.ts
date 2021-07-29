context('wallet/settings', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_settings').click()
  })

  it('should change network when clicked', function () {
    cy.getByTestID('button_network_Local_check').should('exist')
    cy.getByTestID('button_network_Playground').click()
  })

  it('should exit wallet when clicked', function () {
    cy.getByTestID('setting_exit_wallet').click()
    cy.getByTestID('create_wallet_button').should('exist')
    cy.getByTestID('restore_wallet_button').should('exist')
  })

  it('should navigate to recovery word screen', function () {
    cy.getByTestID('view_recovery_words').should('exist').click()
    cy.getByTestID('recovery_word_screen').should('exist')
  })
})
