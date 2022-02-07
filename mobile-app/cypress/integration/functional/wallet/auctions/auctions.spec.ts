import { EnvironmentNetwork } from '../../../../../../shared/environment'
import { VaultStatus } from '../../../../../app/screens/AppNavigator/screens/Loans/VaultStatusTypes'
import BigNumber from 'bignumber.js'

function generateBlockUntilLiquidate (): void {
  cy.getByTestID('playground_generate_blocks').click()
  cy.wait(3000)
  cy.getByTestID('vault_card_0_status').invoke('text').then((status: string) => {
    if (status !== 'IN LIQUIDATION') {
      generateBlockUntilLiquidate()
    }
  })
}

context('Wallet - Auctions', () => {
  const walletTheme = { isDark: false }
  before(function () {
    cy.intercept('**/settings/flags', {
      body: [{
        id: 'auction',
        name: 'Auction',
        stage: 'public',
        version: '>=0.0.0',
        description: 'Browse auctions provided by DeFiChain',
        networks: [EnvironmentNetwork.MainNet, EnvironmentNetwork.TestNet, EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
        platforms: ['ios', 'android', 'web']
      }]
    })
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['CD10']).wait(6000)
    cy.setWalletTheme(walletTheme)
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('empty_vault').should('exist')
    cy.createVault(0)
    cy.getByTestID('vault_card_0_manage_loans_button').should('not.exist')
    cy.getByTestID('vault_card_0_edit_collaterals_button').click()
    cy.addCollateral('0.60000000', 'DFI')
    cy.addCollateral('0.00000006', 'dCD10')
  })

  it('should liquidate vault', function () {
    cy.go('back')
    cy.getByTestID('loans_tabs_YOUR_VAULTS').click()
    cy.getByTestID('vault_card_0_manage_loans_button').click()
    cy.getByTestID('button_browse_loans').click()
    cy.getByTestID('loan_card_dTU10').click()
    cy.getByTestID('max_loan_amount_text').invoke('text').then((text: string) => {
      const maxLoanAmount = new BigNumber(text).toFixed(2, 1) // use 2dp and round down
      cy.getByTestID('form_input_borrow').clear().type(maxLoanAmount).blur()
    })
    cy.getByTestID('borrow_loan_submit_button').click()
    cy.getByTestID('button_confirm_borrow_loan').click().wait(3000)
    cy.closeOceanInterface()
    cy.getByTestID('loans_tabs_YOUR_VAULTS').click()
    generateBlockUntilLiquidate()
    cy.checkVaultTag('IN LIQUIDATION', VaultStatus.Liquidated, 'vault_card_0_status', walletTheme.isDark)
  })

  it('should show liquidated vault in auctions', function () {
    cy.getByTestID('bottom_tab_auctions').click()
    cy.getByTestID('batch_card_0').should('exist')
  })
})

context('Wallet - Auctions Feature Gated', () => {
  it('should not have auctions tab if auction feature is blocked', function () {
    cy.intercept('**/settings/flags', {
      body: []
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_auctions').should('not.exist')
  })

  it('should not have auctions tab if feature flag api does not contains auction', function () {
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
    cy.getByTestID('bottom_tab_auctions').should('not.exist')
  })

  it('should not have auctions tab if feature flag api failed', function () {
    cy.intercept('**/settings/flags', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_auctions').should('not.exist')
  })

  it('should not have auctions tab if auction feature is beta and not activated by user', function () {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'auction',
          name: 'Auction',
          stage: 'beta',
          version: '>=0.0.0',
          description: 'Auction',
          networks: [EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
          platforms: ['ios', 'android', 'web']
        }
      ]
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_auctions').should('not.exist')
  })

  it('should have auctions tab if auction feature is beta is activated by user', function () {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'auction',
          name: 'Auction',
          stage: 'beta',
          version: '>=0.0.0',
          description: 'Auctions',
          networks: [EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
          platforms: ['ios', 'android', 'web']
        }
      ]
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('header_settings').click()
    cy.getByTestID('setting_navigate_About').click()
    cy.getByTestID('try_beta_features').click()
    cy.getByTestID('feature_auction_row').should('exist')
    cy.getByTestID('feature_auction_switch').click().should(() => {
      expect(localStorage.getItem('WALLET.ENABLED_FEATURES')).to.eq('["auction"]')
    })
    cy.getByTestID('bottom_tab_auctions').should('exist')
    cy.getByTestID('feature_auction_switch').click().should(() => {
      expect(localStorage.getItem('WALLET.ENABLED_FEATURES')).to.eq('[]')
    })
  })

  it('should have auctions tab if auction feature is public', function () {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'auction',
          name: 'Auction',
          stage: 'beta',
          version: '>=0.0.0',
          description: 'Auctions',
          networks: [EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
          platforms: ['ios', 'android', 'web']
        }
      ]
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_auctions').should('exist')
  })
})
