import {} from 'cypress'
import { HelpScreenItem } from '../../../screens/AppNavigator/screens/HelpScreen/HelpScreen'

context('wallet/settings/help', () => {
  beforeEach(function () {
    cy.createEmptyWallet()
    cy.getByTestID('bottom_tab_settings').click()
    cy.getByTestID('settings_help_button').click()
    cy.fixture('community_links').then((data) => {
      this.links = data.links
    })
  })

  it('should display community links with correct number of items', function () {
    cy.getByTestID('help_items_list').should('exist').children().children().should('have.length', this.links.length)
  })

  it('should be able to display correct labels', function () {
    this.links.forEach((link: HelpScreenItem) => {
      cy.getByTestID(link.id).should('exist').contains(link.title)
    })
  })
})
