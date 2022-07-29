import dayjs from 'dayjs'

context('Wallet - Network detail screen - outside wallet context', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.exitWallet()
    cy.getByTestID('get_started_button').click()
    cy.getByTestID('guidelines_check').click()
    cy.url().should('include', 'wallet/onboarding/guidelines')
    cy.restoreLocalStorage()
  })

  afterEach(() => {
    cy.saveLocalStorage()
  })

  it('should check network detail without switching network', function () {
    cy.getByTestID('header_active_network').first().invoke('text').then((network: string) => {
      cy.getByTestID('header_network_icon').find('path').should('have.css', 'fill').then((statusBgColor) => {
        cy.getByTestID('header_active_network').first().filter(':visible').click()
        cy.getByTestID(`button_network_${network}_check`).should('exist')
        cy.getByTestID(`button_network_${network}_check`).should('have.css', 'color', statusBgColor)
      })
    })
  })

  it('should check network detail by switching network', function () {
    cy.getByTestID('header_active_network').first().invoke('text').then((network: string) => {
      cy.getByTestID('header_network_icon').find('path').should('have.css', 'fill').then((statusBgColor) => {
        cy.getByTestID('header_active_network').first().filter(':visible').click()
        cy.getByTestID(`button_network_${network}_check`).should('exist')
        cy.getByTestID(`button_network_${network}_check`).should('have.css', 'color', statusBgColor)
        cy.go('back')
        cy.url().should('include', 'wallet/onboarding/guidelines')
        cy.getByTestID('header_active_network').first().click()
        cy.getByTestID('network_details').should('exist')
        cy.getByTestID('button_network_Playground').click()
        cy.go('back').wait(3000)
        cy.url().should('include', 'wallet/onboarding/guidelines')
        cy.getByTestID('header_active_network').first().invoke('text').then((updatedNetwork: string) => {
          cy.getByTestID('header_network_icon').find('path').should('have.css', 'fill').then((updatedStatusBgColor) => {
            expect(network).not.eq(updatedNetwork)
            cy.getByTestID('header_active_network').first().filter(':visible').click()
            cy.getByTestID(`button_network_${network}_uncheck`).should('exist')
            cy.getByTestID(`button_network_${updatedNetwork}_check`).should('exist')
            cy.getByTestID(`button_network_${updatedNetwork}_check`).should('have.css', 'color', updatedStatusBgColor)
          })
        })
      })
    })
  })

  it('should check network details after failed API calls for stats', function () {
    cy.intercept('**/regtest/stats', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.wait(3000)
    cy.getByTestID('header_active_network').first().invoke('text').then((network: string) => {
      cy.getByTestID('header_network_icon').find('path').should('have.css', 'fill', 'rgb(229, 69, 69)')
      cy.getByTestID('header_active_network').first().filter(':visible').click()
      cy.getByTestID('network_details_network').should('exist').contains(network)
      cy.getByTestID(`button_network_${network}_check`).should('exist')
      cy.getByTestID('network_details_block_height').should('exist').contains(0)
      cy.getByTestID('network_details_total_masternodes').should('exist').contains(0)
    })
  })

  it('should check network details after intercepting stats call', function () {
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
    cy.getByTestID('header_active_network').first().invoke('text').then((network: string) => {
      cy.getByTestID('header_network_icon').find('path').should('have.css', 'fill').then((statusBgColor) => {
        cy.getByTestID('header_active_network').first().filter(':visible').click()
        cy.getByTestID('network_details_network').should('exist').contains(network)
        cy.getByTestID(`button_network_${network}_check`).should('have.css', 'color', statusBgColor)
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
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('header_settings').click()
    cy.getByTestID('header_active_network').first().invoke('text').then((network: string) => {
      cy.getByTestID('header_network_icon').filter(':visible').click()
      cy.getByTestID('network_details_network').should('exist').contains(network)
      cy.getByTestID(`button_network_${network}_check`).should('exist')
      cy.getByTestID(`button_network_${network}_check`).should('have.css', 'color', 'rgb(0, 173, 29)')
    })
  })

  it('should check network detail by switching network', function () {
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('header_settings').click()
    cy.getByTestID('header_active_network').first().invoke('text').then((network: string) => {
      cy.getByTestID('header_network_icon').find('path').should('have.css', 'fill').then((statusBgColor) => {
        cy.getByTestID('header_network_icon').filter(':visible').click()
        cy.getByTestID('network_details_network').should('exist').contains(network)
        cy.getByTestID(`button_network_${network}_check`).should('have.css', 'color', statusBgColor)
        cy.getByTestID('button_network_Playground').click()
        cy.exitWallet()
        cy.createEmptyWallet(true)
        cy.getByTestID('header_settings').click()
        cy.getByTestID('header_network_icon').should('exist').wait(3000)
        cy.getByTestID('header_active_network').first().invoke('text').then((updatedNetwork: string) => {
          cy.getByTestID('header_network_icon').find('path').should('have.css', 'fill').then((updatedStatusBgColor) => {
            cy.getByTestID('header_network_icon').filter(':visible').click()
            expect(network).not.eq(updatedNetwork)
            cy.getByTestID('network_details_network').should('exist').contains(updatedNetwork)
            cy.getByTestID(`button_network_${updatedNetwork}_check`).should('have.css', 'color', updatedStatusBgColor)
          })
        })
      })
    })
  })

  it('should be able to click block height and redirect it to defiscan', function () {
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('header_settings').click().wait(3000)
    cy.getByTestID('header_network_icon').filter(':visible').click()
    cy.getByTestID('block_detail_explorer_url').invoke('text').then((block) => {
      cy.getByTestID('block_detail_explorer_url').filter(':visible').click()
    })
  })
})

context('Wallet - Network detail screen - with wallet context go back check', () => {
  before(function () {
    cy.visit('/')
    cy.exitWallet()
    cy.createEmptyWallet(true)
  })

  it('should get back to the portfolio page when network detail called from portfolio page', function () {
    cy.getByTestID('bottom_tab_portfolio').click().wait(3000)
    cy.url().should('include', 'app/portfolio')
    cy.getByTestID('header_active_network').first().click()
    cy.go('back')
    cy.url().should('include', 'app/portfolio')
  })

  it('should get back to the dex guideline page when network detail called from dex guideline page', function () {
    cy.getByTestID('bottom_tab_dex').click().wait(3000)
    cy.url().should('include', 'app/DEX/DexScreen')
    cy.getByTestID('dex_guidelines_screen').should('exist')
    cy.getByTestID('dex_header_container').filter(':visible').click().wait(3000)
    cy.go('back')
    cy.url().should('include', 'app/DEX/DexScreen')
  })

  it('should get back to the dex page when network detail called from dex page', function () {
    cy.getByTestID('bottom_tab_dex').filter(':visible').click().wait(3000)
    cy.url().should('include', 'app/DEX/DexScreen')
    cy.getByTestID('close_dex_guidelines').click().wait(3000)
    cy.url().should('include', 'app/DEX/DexScreen')
    cy.getByTestID('dex_header_container').filter(':visible').click().wait(3000)
    cy.go('back')
    cy.url().should('include', 'app/DEX/DexScreen')
  })

  it('should get back to the transaction page when network detail called from transaction page', function () {
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('transaction_button').click()
    cy.url().should('include', 'app/TransactionsScreen')
    cy.getByTestID('portfolio_header_container').filter(':visible').click().wait(3000)
    cy.go('back')
    cy.url().should('include', 'app/TransactionsScreen')
  })

  it('should get back to the setting page when network detail called from setting page', function () {
    cy.getByTestID('bottom_tab_portfolio').click().wait(3000)
    cy.getByTestID('header_settings').filter(':visible').click().wait(3000)
    cy.url().should('include', 'app/Settings')
    cy.getByTestID('header_network_icon').filter(':visible').click().wait(3000)
    cy.go('back')
    cy.url().should('include', 'app/Settings')
  })
})
