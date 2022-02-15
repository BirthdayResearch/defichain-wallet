import { EnvironmentNetwork } from '../../../../../../shared/environment'
import { VaultStatus } from '../../../../../app/screens/AppNavigator/screens/Loans/VaultStatusTypes'
import BigNumber from 'bignumber.js'
import { checkValueWithinRange } from '../../../../support/walletCommands'

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
  const samplePoolPair = [
    {
      id: '17',
      symbol: 'USDT-DFI',
      displaySymbol: 'dUSDT-DFI',
      name: 'Playground USDT-Default Defi token',
      status: true,
      tokenA: {
        symbol: 'USDT',
        displaySymbol: 'dUSDT',
        id: '3',
        reserve: '10000000',
        blockCommission: '0'
      },
      tokenB: {
        symbol: 'DFI',
        displaySymbol: 'DFI',
        id: '0',
        reserve: '1000',
        blockCommission: '0'
      },
      priceRatio: {
        ab: '10000',
        ba: '0.0001'
      },
      commission: '0',
      totalLiquidity: {
        token: '100000',
        usd: '20000000'
      },
      tradeEnabled: true,
      ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
      rewardPct: '0.1',
      creation: {
        tx: '2e3f75a022e7296fef40c292b36dee0254486b94c6b7c816d8755d9a6d2b6b23',
        height: 134
      },
      apr: {
        reward: 66.8826,
        total: 66.8826
      }
    },
    {
      id: '20',
      symbol: 'DUSD-DFI',
      displaySymbol: 'DUSD-DFI',
      name: 'Decentralized USD-Default Defi token',
      status: true,
      tokenA: {
        symbol: 'DUSD',
        displaySymbol: 'DUSD',
        id: '14',
        reserve: '770',
        blockCommission: '0'
      },
      tokenB: {
        symbol: 'DFI',
        displaySymbol: 'DFI',
        id: '0',
        reserve: '77',
        blockCommission: '0'
      },
      priceRatio: {
        ab: '10',
        ba: '0.1'
      },
      commission: '0.02',
      totalLiquidity: {
        token: '243.49537982',
        usd: '1540'
      },
      tradeEnabled: true,
      ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
      rewardPct: '0.1',
      creation: {
        tx: 'd10b9f5193493514d35a31681a03573831b9a382f281e93de33cfc3e603a5d51',
        height: 142
      },
      apr: {
        reward: 868605.1948051949,
        total: 868605.1948051949
      }
    },
    {
      id: '21',
      symbol: 'TU10-DUSD',
      displaySymbol: 'dTU10-DUSD',
      name: 'Decentralized TU10-Decentralized USD',
      status: true,
      tokenA: {
        symbol: 'TU10',
        displaySymbol: 'dTU10',
        id: '13',
        reserve: '4.87',
        blockCommission: '0'
      },
      tokenB: {
        symbol: 'DUSD',
        displaySymbol: 'DUSD',
        id: '14',
        reserve: '974',
        blockCommission: '0'
      },
      priceRatio: {
        ab: '0.005',
        ba: '200'
      },
      commission: '0.02',
      totalLiquidity: {
        token: '68.87219745',
        usd: '1948'
      },
      tradeEnabled: true,
      ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
      rewardPct: '0.1',
      creation: {
        tx: '7aa15f770483ce4f2c7c5245a29e4727b57ce9d1461db6dc269d8d66c9478341',
        height: 149
      },
      apr: {
        reward: 686679.6714579056,
        total: 686679.6714579056
      }
    }
  ]
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
    cy.intercept('**/poolpairs?size=*', {
      body: {
        data: samplePoolPair
      }
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

  describe('Min. Next Bid', function () {
    // TU10 - DUSD: 4.87 - 974
    // DUSD - DFI: 770 - 77
    // DFI - dUSDT: 1000 - 10000000
    // Price rate ($ per TU10) = 1 * (974 / 4.87) * (77 / 770) * (10000000 / 1000) = 200000
    function validateLoanTokenUSDValue (tokenTestID: string, usdTestID: string): void {
      cy.getByTestID(tokenTestID).invoke('text').then((text: string) => {
        const minNextBid = text.replace(' dTU10', '')

        cy.getByTestID(usdTestID).invoke('text').then((actualUSD: string) => {
          const estimatedUSD = new BigNumber(minNextBid).times(200000)
          checkValueWithinRange(actualUSD, estimatedUSD.toFixed(2))
        })
      })
    }

    it('should display USD values in batch card', function () {
      validateLoanTokenUSDValue('batch_0_min_next_bid', 'batch_0_min_next_bid_usd')
    })

    it('should display USD values in quick bid bottom sheet in auction home screen', function () {
      cy.getByTestID('batch_card_quick_bid_button').click()
      validateLoanTokenUSDValue('quick_bid_min_next_bid', 'quick_bid_min_next_bid_usd')
      validateLoanTokenUSDValue('text_current_balance', 'quick_bid_current_balance_usd')
      cy.getByTestID('quick_bid_close_button').click()
    })

    it('should display USD values in place bid screen', function () {
      cy.getByTestID('batch_card_place_bid_button').click()
      validateLoanTokenUSDValue('text_min_next_bid', 'place_bid_min_next_bid_usd')
      cy.go('back')
    })

    it('should display USD values in auction details screen', function () {
      cy.getByTestID('batch_card_0').click()
      validateLoanTokenUSDValue('auction_detail_min_next_bid', 'auction_detail_min_next_bid_usd')
    })

    it('should display USD values in quick bid bottom sheet in auction details screen', function () {
      cy.getByTestID('auction_details_quick_bid_button').click()
      validateLoanTokenUSDValue('quick_bid_min_next_bid', 'quick_bid_min_next_bid_usd')
      validateLoanTokenUSDValue('text_current_balance', 'quick_bid_current_balance_usd')
      cy.getByTestID('quick_bid_close_button').click()
    })
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
          stage: 'public',
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
