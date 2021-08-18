context('Wallet - Settings', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_settings').click()
  })

  it('should navigate to network selection when clicked on selected network', function () {
    cy.getByTestID('button_network_Local_check').should('exist')
    cy.getByTestID('button_network_Local_check').click()
    cy.getByTestID('network_selection_screen').should('exist')
  })

  it('should be able to switch network in network selection screen', function () {
    cy.getByTestID('button_network_Local_check').click()
    cy.getByTestID('button_network_Playground').click()
    cy.on('window:confirm', () => {
    })
  })

  it('should exit wallet when clicked on positive action', function () {
    cy.getByTestID('setting_exit_wallet').click()
    cy.on('window:confirm', () => {})
    cy.getByTestID('create_wallet_button').should('exist')
    cy.getByTestID('restore_wallet_button').should('exist')
  })

  it('should stay in setting screen when clicked on negative action', function () {
    cy.getByTestID('setting_exit_wallet').click()
    cy.on('window:confirm', () => { return false })
    cy.getByTestID('setting_screen').should('exist')
  })

  it('should navigate to about page', function () {
    cy.getByTestID('setting_navigate_About').click()
    cy.url().should('include', 'app/AboutScreen')
    cy.getByTestID('app_logo').should('exist')
  })
})
