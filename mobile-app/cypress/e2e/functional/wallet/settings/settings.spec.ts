import { EnvironmentNetwork } from '../../../../../../shared/environment'

const activatedIconColor = 'rgb(251, 191, 36)'
const deactivatedIconColor = 'rgb(212, 212, 212)'
const lightModeIconTestId = 'light_mode_icon'

context.only('Wallet - Settings', () => {
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
    cy.blockAllFeatureFlag()
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
    cy.blockAllFeatureFlag()
    cy.getByTestID('setting_exit_wallet').click()
    cy.on('window:confirm', () => {
    })
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

  it('should display app version tag', function () {
    cy.getByTestID('setting_navigate_About').click()
    cy.getByTestID('version_tag').should('exist')
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

context('Wallet - Settings - Address Book', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('address_book_title').click()
  })

  const labels = ['Light', 'Wallet', '🪨']
  const addresses = ['bcrt1q8rfsfny80jx78cmk4rsa069e2ckp6rn83u6ut9', '2MxnNb1MYSZvS3c26d4gC7gXsNMkB83UoXB', 'n1xjm9oekw98Rfb3Mv4ApyhwxC5kMuHnCo']

  const modifiedLabels = ['Dark', 'Wallet', '🪨']

  function populateAddressBook (): void {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('address_book_title').click()
    cy.wrap(labels).each((_v, index: number) => {
      if (index === 0) {
        cy.getByTestID('button_add_address').click()
      } else {
        cy.getByTestID('add_new_address').click()
      }
      cy.getByTestID('address_book_label_input').type(labels[index])
      cy.getByTestID('address_book_label_input_error').should('not.exist')
      cy.getByTestID('address_book_address_input').clear().type(addresses[index]).blur()
      cy.getByTestID('address_book_address_input_error').should('not.exist')
      cy.getByTestID('button_confirm_save_address_label').click().wait(1000)
      cy.getByTestID('pin_authorize').type('000000').wait(2000)
      cy.getByTestID(`address_row_label_${index}_WHITELISTED`).contains(labels[index])
      cy.getByTestID(`address_row_text_${index}_WHITELISTED`).contains(addresses[index])
    })
  }

  it('should be able to access address book from setting screen', () => {
    cy.url().should('include', 'app/AddressBookScreen')
    cy.getByTestID('empty_address_book').should('exist')
  })

  it('should have Your Addresses tab with one wallet address', () => {
    cy.getByTestID('address_button_group_YOUR_ADDRESS').click()
    cy.getByTestID('address_row_text_0_YOUR_ADDRESS').should('exist')
  })

  it('should disable add new, edit, and favourite functions and has refresh button in Your address tab', () => {
    cy.getByTestID('add_new_address').should('have.attr', 'aria-disabled')
    cy.getByTestID('address_list_edit_button').should('not.exist')
    cy.getByTestID('address_row_favourite_0_WHITELISTED').should('not.exist')
    cy.getByTestID('discover_wallet_addresses').should('exist')
  })

  it('should block wallet address during add new whitelisted address', () => {
    cy.getByTestID('address_row_text_0_YOUR_ADDRESS').invoke('text').then(walletAddress => {
      cy.getByTestID('address_button_group_WHITELISTED').click()
      cy.getByTestID('add_new_address').click()
      cy.getByTestID('address_book_address_input').clear().type(walletAddress).blur()
      cy.getByTestID('address_book_address_input_error').contains('This address already exists in your address book, please enter a different address')
    })
  })

  it('should be able to create address in whitelisted tab', () => {
    populateAddressBook()
  })

  it('should be able to display favourite address when search is in focus but without search string', function () {
    cy.getByTestID('address_row_favourite_0_WHITELISTED').click().wait(500)
    cy.getByTestID('address_search_input').click()
    cy.getByTestID('address_row_text_0_favourite_address').contains(addresses[0])
    cy.getByTestID('address_row_0_is_favourite_favourite_address').click()
    cy.getByTestID('address_row_0_favourite_address').should('not.exist')
  })

  it('should be able to search for address by label', function () {
    cy.wrap(labels).each((label: string, index: number) => {
      cy.getByTestID('address_search_input').type(label).blur().wait(1000)
      cy.getByTestID('search_result_text_search_string').contains(label)
      cy.getByTestID('address_row_label_0_address_book').contains(label)
      cy.getByTestID('address_row_text_0_address_book').contains(addresses[index])
      cy.getByTestID('search_result_count').contains('1')
      cy.getByTestID('address_search_input').clear()
    })
  })

  it('should be able to sort whitelisted address by favourite', function () {
    cy.getByTestID('cancel_search_button').click()
    cy.getByTestID('address_row_favourite_2_WHITELISTED').click().wait(500)
    cy.getByTestID('address_row_0_is_favourite_WHITELISTED').should('exist')
    cy.getByTestID('address_row_text_0_WHITELISTED').contains(addresses[2]) // 3rd became 1st
    cy.getByTestID('address_row_favourite_2_WHITELISTED').click().wait(500)
    cy.getByTestID('address_row_1_is_favourite_WHITELISTED').should('exist')
    cy.getByTestID('address_row_text_1_WHITELISTED').contains(addresses[1]) // 2nd maintain 2nd
    cy.getByTestID('address_row_text_2_WHITELISTED').contains(addresses[0]) // 1st became 3rd
    cy.getByTestID('address_row_favourite_0_WHITELISTED').click().wait(500)
    cy.getByTestID('address_row_2_not_favourite_WHITELISTED').should('exist')
    cy.getByTestID('address_row_text_2_WHITELISTED').contains(addresses[2]) // 3rd back to 3rd
    cy.getByTestID('address_row_favourite_0_WHITELISTED').click().wait(500)
    cy.getByTestID('address_row_1_not_favourite_WHITELISTED').should('exist')
  })

  it('should have no effect when click on any saved address', () => {
    populateAddressBook()
    cy.wrap(labels).each((_v, index: number) => {
      cy.getByTestID(`address_row_${index}_WHITELISTED`).should('have.attr', 'aria-disabled')
    })
    cy.getByTestID('address_button_group_YOUR_ADDRESS').click()
    cy.getByTestID('address_row_0_YOUR_ADDRESS').should('have.attr', 'aria-disabled')
  })

  it('should be able to edit address label', () => {
    populateAddressBook()
    const newLabel = 'Dark'
    const address = addresses[0]
    cy.getByTestID('address_list_edit_button').click()
    cy.getByTestID(`address_edit_indicator_${address}`).click()
    cy.getByTestID('address_book_label_input').clear().type(newLabel).blur()
    cy.getByTestID('address_book_address_input_error').should('not.exist')
    cy.getByTestID('button_confirm_save_address_label').click().wait(1000)
    cy.getByTestID('pin_authorize').type('000000').wait(2000)
    cy.wrap(modifiedLabels).each((_v, index: number) => {
      cy.getByTestID(`address_row_label_${index}_WHITELISTED`).contains(modifiedLabels[index])
      cy.getByTestID(`address_row_text_${index}_WHITELISTED`).contains(addresses[index])
    })
  })

  it('should delete an address', () => {
    const deletedAddress = addresses[0]
    populateAddressBook()
    cy.getByTestID('address_list_edit_button').click()
    cy.getByTestID(`address_delete_indicator_${deletedAddress}`).click()
    cy.getByTestID('pin_authorize').type('000000').wait(2000)
    cy.getByTestID('address_row_text_0_WHITELISTED').invoke('text').then(address => {
      expect(address).not.eq(deletedAddress)
    })
  })
})

const defichainUrls = {
  [EnvironmentNetwork.MainNet]: {
    default: 'https://ocean.defichain.com',
    custom: 'https:/custom-mainnet.defichain.com'
  },
  [EnvironmentNetwork.TestNet]: {
    default: 'https://ocean.defichain.com',
    custom: 'https:/custom-testnet.defichain.com'
  },
  [EnvironmentNetwork.RemotePlayground]: {
    default: 'https://playground.jellyfishsdk.com',
    custom: 'https://custom-remote-playground.defichain.com'
  },
  [EnvironmentNetwork.LocalPlayground]: {
    default: 'http://localhost:19553',
    custom: 'https://custom-localhost.defichain.com'
  }
}
const defichainUrlEnvs = Object.keys(defichainUrls) as EnvironmentNetwork[]
context('Wallet - Settings - Service Provider', () => {
  before(() => {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
  })

  beforeEach(() => {
    cy.restoreLocalStorage()
  })

  afterEach(() => {
    cy.saveLocalStorage()
  })

  defichainUrlEnvs.forEach((defichainUrlEnv) => {
    const url = defichainUrls[defichainUrlEnv]
    it(`should display default on first app load on ${defichainUrlEnv}`, () => {
      cy.intercept('**/settings/flags', {
        body: [
          {
            id: 'service_provider',
            name: 'Service Provider',
            stage: 'beta',
            version: '>0.0.0',
            description: 'Allows the usage of custom server provider url',
            networks: [EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground, EnvironmentNetwork.MainNet, EnvironmentNetwork.TestNet],
            platforms: ['ios', 'android', 'web']
          }
        ]
      })
      localStorage.setItem('WALLET.ENABLED_FEATURES', '["service_provider"]')
      cy.getByTestID('button_selected_network').click().wait(50)
      cy.getByTestID(`button_network_${defichainUrlEnv}`).click()
      cy.on('window:confirm', () => {
      })
      cy.createEmptyWallet(true).wait(2000)
      cy.getByTestID('header_settings').click().wait(50)
      cy.getByTestID('setting_navigate_service_provider').contains('Default')
      cy.url().should('include', 'app/Settings', () => {
        expect(localStorage.getItem('WALLET.SERVICE_PROVIDER_URL')).to.eq(url.default)
      })
    })

    it(`should have default service provider url on ${defichainUrlEnv}`, () => {
      cy.getByTestID('setting_navigate_service_provider').click()
      cy.getByTestID('endpoint_url_input').should('have.value', url.default)
    })

    it(`input should be locked and not editable on ${defichainUrlEnv}`, () => {
      cy.getByTestID('endpoint_url_input').should('have.attr', 'readonly')
    })

    it(`can unlock to change service provider endpoint on ${defichainUrlEnv}`, () => {
      cy.getByTestID('unlock_button').click()
      cy.getByTestID('unlock_button').should('not.exist')
      cy.getByTestID('reset_button').should('exist')
      cy.getByTestID('endpoint_url_input').should('not.have.attr', 'readonly')
      cy.getByTestID('button_submit').should('have.attr', 'aria-disabled')
    })

    it(`should type invalid custom provider URL on ${defichainUrlEnv}`, () => {
      cy.getByTestID('endpoint_url_input').should('have.value', '')
      cy.getByTestID('endpoint_url_input').type('http://invalidcustomURL.com')
      cy.getByTestID('endpoint_url_input_error').contains('Invalid URL')
      cy.getByTestID('button_submit').should('have.attr', 'aria-disabled')
    })

    it(`should submit valid custom service provider on ${defichainUrlEnv}`, () => {
      cy.getByTestID('endpoint_url_input').clear().type(url.custom).wait(3000)
      cy.getByTestID('button_submit').click().wait(1000)
      cy.getByTestID('pin_authorize').type('000000').wait(3000)
    })

    it('should display Custom on Server', () => {
      cy.getByTestID('bottom_tab_portfolio').click()
      cy.getByTestID('header_settings').click()
      cy.getByTestID('setting_navigate_service_provider').contains('Custom')
      cy.url().should('include', 'app/Settings', () => {
        expect(localStorage.getItem('WALLET.SERVICE_PROVIDER_URL')).to.eq(url.custom)
      })
    })
  })
})

context('Wallet - Settings - Service Provider Feature Gated', () => {
  before(() => {
    cy.intercept('**/settings/flags', {
      statusCode: 200,
      body: []
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('setting_navigate_service_provider').should('not.exist')
  })
  it('shoud not have service provider row if feature flag api does not contain service provider', () => {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'foo',
          name: 'bar',
          stage: 'alpha',
          version: '>=0.0.0',
          description: 'foo',
          networks: [EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
          platforms: ['ios', 'android', 'web']
        }
      ]
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('setting_navigate_service_provider').should('not.exist')
  })
  it('should have service provider tab if feature is beta and is activated', () => {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'service_provider',
          name: 'Service Provider',
          stage: 'beta',
          version: '>1.13.0',
          description: 'Allows the usage of custom server provider url',
          networks: [EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
          platforms: ['ios', 'android', 'web']
        }
      ]
    })
    localStorage.setItem('WALLET.ENABLED_FEATURES', '["service_provider"]')
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('setting_navigate_service_provider').should('exist')
  })
  it('should have service provider row if feature is public', () => {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'service_provider',
          name: 'Service Provider',
          stage: 'public',
          version: '>1.13.0',
          description: 'Allows the usage of custom server provider url',
          networks: [EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
          platforms: ['ios', 'android', 'web']
        }
      ]
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('setting_navigate_service_provider').should('exist')
  })
})
