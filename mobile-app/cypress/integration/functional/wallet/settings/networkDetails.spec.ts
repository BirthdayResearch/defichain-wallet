import dayjs from 'dayjs'

context('Wallet - Network detail screen - outside wallet context', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.exitWallet()
    cy.getByTestID('create_wallet_button').click()
    cy.getByTestID('guidelines_switch').click()
    cy.restoreLocalStorage()
  })

  afterEach(() => {
    cy.saveLocalStorage()
  })

  it('should check network detail without switching network', function () {
    cy.getByTestID('create_recovery_words_button').click()
    cy.url().should('include', 'wallet/mnemonic/create')
    cy.getByTestID('header_active_network').first().invoke('text').then((network) => {
      cy.getByTestID('header_status_indicator').should('have.css', 'background-color').then((statusBgColor) => {
        cy.getByTestID('wallet_header_container').filter(':visible').click()
        cy.getByTestID('network_details_network').should('exist').contains(network)
        cy.getByTestID('network_details_status_icon').should('have.css', 'background-color', statusBgColor)
      })
    })
  })

  it('should check network detail by switching network', function () {
    cy.getByTestID('create_recovery_words_button').click()
    cy.url().should('include', 'wallet/mnemonic/create')
    cy.getByTestID('header_active_network').first().invoke('text').then((network) => {
      cy.getByTestID('header_status_indicator').should('have.css', 'background-color').then((statusBgColor) => {
        cy.getByTestID('wallet_header_container').filter(':visible').click()
        cy.getByTestID('network_details_network').should('exist').contains(network)
        cy.getByTestID('network_details_status_icon').should('have.css', 'background-color', statusBgColor)
        cy.getByTestID('network_details_header_back').click()
        cy.url().should('include', 'wallet/mnemonic/create')
        cy.go('back')
        cy.url().should('include', 'wallet/onboarding/guidelines')
        cy.getByTestID('header_active_network').first().click()
        cy.getByTestID('onboarding_network_selection_screen').should('exist')
        cy.getByTestID('button_network_Playground').click()
        cy.go('back').wait(3000)
        cy.url().should('include', 'wallet/onboarding/guidelines')
        cy.getByTestID('guidelines_switch').click()
        cy.getByTestID('create_recovery_words_button').click()
        cy.url().should('include', 'wallet/mnemonic/create')
        cy.getByTestID('header_active_network').first().invoke('text').then((updatedNetwork) => {
          cy.getByTestID('header_status_indicator').should('have.css', 'background-color').then((updatedStatusBgColor) => {
            cy.getByTestID('wallet_header_container').filter(':visible').click()
            expect(network).not.eq(updatedNetwork)
            cy.getByTestID('network_details_status_value').should('exist').contains('Connected')
            cy.getByTestID('network_details_network').should('exist').contains(updatedNetwork)
            cy.getByTestID('network_details_status_icon').should('have.css', 'background-color', updatedStatusBgColor)
          })
        })
      })
    })
  })

  it('should check network details after failed API calls for stats', function () {
    cy.getByTestID('create_recovery_words_button').click()
    cy.url().should('include', 'wallet/mnemonic/create')
    cy.intercept('**/regtest/stats', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.wait(3000)
    cy.getByTestID('header_active_network').first().invoke('text').then((network) => {
      cy.getByTestID('header_status_indicator').should('have.css', 'background-color').then((statusBgColor) => {
        cy.getByTestID('wallet_header_container').filter(':visible').click()
        cy.getByTestID('network_details_network').should('exist').contains(network)
        cy.getByTestID('network_details_status_icon').should('have.css', 'background-color', statusBgColor)
        cy.getByTestID('network_details_status_value').should('exist').contains('Disconnected')
        cy.getByTestID('network_details_status_icon').should('have.css', 'background-color', 'rgb(239, 68, 68)')
        cy.getByTestID('network_details_block_height').should('exist').contains(0)
        cy.getByTestID('network_details_total_masternodes').should('exist').contains(0)
      })
    })
  })

  it('should check network details after intercepting stats call', function () {
    cy.getByTestID('create_recovery_words_button').click()
    cy.url().should('include', 'wallet/mnemonic/create')
    cy.intercept('**/regtest/stats', {
      statusCode: 200,
      body: {
        data: {
          count: {
            blocks: 100,
            prices: 0,
            tokens: 11,
            masternodes: 10
          },
          tvl: {
            dex: 1
          }
        }
      }
    })
    cy.wait(3000)
    cy.getByTestID('header_active_network').first().invoke('text').then((network) => {
      cy.getByTestID('header_status_indicator').should('have.css', 'background-color').then((statusBgColor) => {
        cy.getByTestID('wallet_header_container').filter(':visible').click()
        cy.getByTestID('network_details_network').should('exist').contains(network)
        cy.getByTestID('network_details_status_icon').should('have.css', 'background-color', statusBgColor)
        cy.getByTestID('network_details_block_height').should('exist').contains(100)
        cy.getByTestID('network_details_total_masternodes').should('exist').contains(10)
        cy.getByTestID('network_details_last_sync').invoke('text').then((lastSuccessfulSync) => {
          cy.wait(70000)
          cy.getByTestID('network_details_last_sync').invoke('text').then((updatedLastSync) => {
            expect(dayjs(lastSuccessfulSync).isBefore(dayjs(updatedLastSync))).to.be.eq(true)
          })
        })
      })
    })
  })
})

context('Wallet - Network detail screen - with wallet context', () => {
  before(function () {
    cy.visit('/')
    cy.exitWallet()
    cy.createEmptyWallet(true)
  })

  it('should check network detail without switching network', function () {
    cy.getByTestID('balances_list').should('exist').wait(3000)
    cy.getByTestID('header_active_network').first().invoke('text').then((network) => {
      cy.getByTestID('header_status_indicator').should('have.css', 'background-color').then((statusBgColor) => {
        cy.getByTestID('balances_header_container').filter(':visible').click()
        cy.getByTestID('network_details_network').should('exist').contains(network)
        cy.getByTestID('network_details_status_icon').should('have.css', 'background-color', statusBgColor)
      })
    })
  })

  it('should check network detail by switching network', function () {
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('header_settings').click()
    cy.getByTestID('button_selected_network').should('exist').wait(3000)
    cy.getByTestID('header_active_network').first().invoke('text').then((network) => {
      cy.getByTestID('header_status_indicator').should('have.css', 'background-color').then((statusBgColor) => {
        cy.getByTestID('setting_header_container').filter(':visible').click()
        cy.getByTestID('network_details_network').should('exist').contains(network)
        cy.getByTestID('network_details_status_icon').should('have.css', 'background-color', statusBgColor)
        cy.getByTestID('network_details_header_back').filter(':visible').click()
        cy.getByTestID('button_selected_network').click()
        cy.getByTestID('button_network_Playground').click().wait(3000)
        cy.exitWallet()
        cy.createEmptyWallet(true)
        cy.getByTestID('header_settings').click()
        cy.getByTestID('button_selected_network').should('exist').wait(3000)
        cy.getByTestID('header_active_network').first().invoke('text').then((updatedNetwork) => {
          cy.getByTestID('header_status_indicator').should('have.css', 'background-color').then((updatedStatusBgColor) => {
            cy.getByTestID('setting_header_container').filter(':visible').click().wait(3000)
            expect(network).not.eq(updatedNetwork)
            cy.getByTestID('network_details_status_value').should('exist').contains('Connected')
            cy.getByTestID('network_details_network').should('exist').contains(updatedNetwork)
            cy.getByTestID('network_details_status_icon').should('have.css', 'background-color', updatedStatusBgColor)
          })
        })
      })
    })
  })

  it('should be able to click block height and redirect it to defiscan', function () {
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('header_settings').click()
    cy.getByTestID('setting_header_container').filter(':visible').click()
  })
})

context('Wallet - Network detail screen - with wallet context go back check', () => {
  before(function () {
    cy.visit('/')
    cy.exitWallet()
    cy.createEmptyWallet(true)
  })

  it('should get back to the balances page when network detail called from balances page', function () {
    cy.getByTestID('bottom_tab_balances').click().wait(3000)
    cy.url().should('include', 'app/balances')
    cy.getByTestID('balances_header_container').filter(':visible').click().wait(3000)
    cy.getByTestID('network_details_header_back').click()
    cy.url().should('include', 'app/balances')
  })

  it('should get back to the dex guideline page when network detail called from dex guideline page', function () {
    cy.getByTestID('bottom_tab_dex').click().wait(3000)
    cy.url().should('include', 'app/DEX/DexScreen')
    cy.getByTestID('dex_guidelines_screen').should('exist')
    cy.getByTestID('dex_header_container').filter(':visible').click().wait(3000)
    cy.getByTestID('network_details_header_back').click()
    cy.url().should('include', 'app/DEX/DexScreen')
  })

  it('should get back to the dex page when network detail called from dex page', function () {
    cy.getByTestID('bottom_tab_dex').filter(':visible').click().wait(3000)
    cy.url().should('include', 'app/DEX/DexScreen')
    cy.getByTestID('close_dex_guidelines').click().wait(3000)
    cy.url().should('include', 'app/DEX/DexScreen')
    cy.getByTestID('dex_header_container').filter(':visible').click().wait(3000)
    cy.getByTestID('network_details_header_back').click()
    cy.url().should('include', 'app/DEX/DexScreen')
  })

  it('should get back to the transaction page when network detail called from transaction page', function () {
    cy.getByTestID('bottom_tab_transactions').click().wait(3000)
    cy.url().should('include', 'app/transactions')
    cy.getByTestID('transactions_header_container').filter(':visible').click().wait(3000)
    cy.getByTestID('network_details_header_back').click()
    cy.url().should('include', 'app/transactions')
  })

  it('should get back to the setting page when network detail called from setting page', function () {
    cy.getByTestID('bottom_tab_balances').click().wait(3000)
    cy.getByTestID('header_settings').filter(':visible').click().wait(3000)
    cy.url().should('include', 'app/Settings')
    cy.getByTestID('setting_header_container').filter(':visible').click().wait(3000)
    cy.getByTestID('network_details_header_back').click()
    cy.url().should('include', 'app/Settings')
  })
})
