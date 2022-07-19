import { EnvironmentNetwork } from '../../../../../../shared/environment'

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
    cy.setFeatureFlags(['service_provider', 'setting_v2'])
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
  })

  beforeEach(() => {
    cy.setFeatureFlags(['service_provider', 'setting_v2'])
    cy.restoreLocalStorage()
  })

  afterEach(() => {
    cy.saveLocalStorage()
  })

  defichainUrlEnvs.forEach((defichainUrlEnv) => {
    const url = defichainUrls[defichainUrlEnv]
    it(`should display default on first app load on ${defichainUrlEnv}`, () => {
      localStorage.setItem('WALLET.ENABLED_FEATURES', '["service_provider"]')
      cy.getByTestID('header_network_icon').click().wait(50)
      cy.getByTestID(`button_network_${defichainUrlEnv}`).click()
      cy.on('window:confirm', () => {})
      cy.wait(3000)
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
      cy.getByTestID('edit_service_provider').click()
      cy.getByTestID('reset_button').should('exist').should('have.css', 'background-color', 'rgba(255, 255, 255, 0.3)')
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
      cy.getByTestID('endpoint_url_input').clear().type(url.custom)
      cy.getByTestID('button_submit').click().wait(2000)
      cy.getByTestID('pin_authorize').type('000000')
      cy.wait(5000)
      cy.getByTestID('bottom_tab_portfolio').click()
      cy.getByTestID('header_settings').click()
      cy.getByTestID('header_custom_active_network').should('exist')
      cy.getByTestID('setting_navigate_service_provider').contains('Custom')
      cy.url().should('include', 'app/Settings', () => {
        expect(localStorage.getItem('WALLET.SERVICE_PROVIDER_URL')).to.eq(url.custom)
      })
    })
  })
})

context('Wallet - Settings - Service Provider Feature Gated', () => {
  before(() => {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('setting_navigate_service_provider').should('not.exist')
  })
  it('shoud not have service provider row if feature flag api does not contain service provider', () => {
    cy.setFeatureFlags(['service_provider'], 'alpha')
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('setting_navigate_service_provider').should('not.exist')
  })
  it('should have service provider tab if feature is beta and is activated', () => {
    cy.setFeatureFlags(['service_provider'], 'beta')
    localStorage.setItem('WALLET.ENABLED_FEATURES', '["service_provider"]')
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('setting_navigate_service_provider').should('exist')
  })
  it('should have service provider row if feature is public', () => {
    cy.setFeatureFlags(['service_provider'], 'public')
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('setting_navigate_service_provider').should('exist')
  })
})
