const activatedIconColor = 'rgb(251, 191, 36)'
const deactivatedIconColor = 'rgb(212, 212, 212)'
const lightModeIconTestId = 'light_mode_icon'

context('Wallet - Settings', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
  })

  it('should navigate to network selection when clicked on selected network', function () {
    cy.getByTestID('button_selected_network').should('exist')
    cy.getByTestID('button_selected_network').click()
    cy.getByTestID('network_selection_screen').should('exist')
  })

  it('should be able to switch network in network selection screen', function () {
    cy.getByTestID('button_selected_network').click()
    cy.getByTestID('button_network_Playground').click()
    cy.on('window:confirm', () => {
    })
  })

  it('should be able to display top up screen when click on playground on playground network', function () {
    cy.getByTestID('button_selected_network').click()
    cy.getByTestID('button_network_Playground').click()
    cy.on('window:confirm', () => {
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('button_selected_network').click()
    cy.getByTestID('button_network_Playground').click()
    cy.url().should('include', 'playground')
  })

  it('should be able to change language in language selection screen', function () {
    cy.getByTestID('setting_navigate_language_selection').click()
    cy.getByTestID('language_option').contains('Deutsch')
    cy.getByTestID('language_option_description').contains('German')
    cy.getByTestID('button_language_German').click()
    cy.on('window:confirm', (message: string) => {
      expect(message).to.include('German')
    })
    cy.getByTestID('bottom_tab_transactions').contains('Transaktionen').should('exist')
  })

  it('should exit wallet when clicked on positive action', function () {
    cy.getByTestID('setting_exit_wallet').click()
    cy.on('window:confirm', () => {})
    cy.getByTestID('create_wallet_button').should('exist')
    cy.getByTestID('restore_wallet_button').should('exist')
  })

  it('should stay in setting screen when clicked on negative action', function () {
    cy.getByTestID('setting_exit_wallet').click()
    cy.on('window:confirm', () => {
      return false
    })
    cy.getByTestID('setting_screen').should('exist')
  })

  it('should navigate to about page', function () {
    cy.getByTestID('setting_navigate_About').click()
    cy.url().should('include', 'app/Settings/AboutScreen')
    cy.getByTestID('app_logo').should('exist')
  })

  it('should activate light mode by default (localstorage and activated sun icon)', () => {
    cy.url().should('include', 'app/Settings/SettingsScreen', () => {
      expect(localStorage.getItem('WALLET.THEME')).to.eq('light')
    })
    cy.getByTestID(lightModeIconTestId).should('have.css', 'color', activatedIconColor)
    cy.getByTestID('dark_mode_icon').should('have.css', 'color', deactivatedIconColor)
  })

  it('should switch and activate moon icon from light to dark mode', () => {
    cy.getByTestID(lightModeIconTestId).should('have.css', 'color', activatedIconColor)
    cy.getByTestID('theme_switch').click()
    cy.getByTestID(lightModeIconTestId).should('have.css', 'color', deactivatedIconColor)
  })

  it('should update local storage from light to dark theme', () => {
    cy.getByTestID(lightModeIconTestId).should('have.css', 'color', activatedIconColor)
    cy.getByTestID('theme_switch').click().should(() => {
      expect(localStorage.getItem('WALLET.THEME')).to.eq('dark')
    })
    cy.getByTestID(lightModeIconTestId).should('have.css', 'color', deactivatedIconColor)
  })
})
