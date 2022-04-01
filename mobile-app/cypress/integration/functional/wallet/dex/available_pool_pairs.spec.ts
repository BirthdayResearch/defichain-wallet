context('Wallet - DEX - Available Pool Pairs', () => {
  before(function () {
    cy.intercept('**/poolpairs?size=*', {
      body: {
        data: [
          {}
        ]
      },
      delay: 3000
    })
    cy.createEmptyWallet()
    localStorage.setItem('WALLET.DISPLAY_DEXGUIDELINES', 'false')
    cy.getByTestID('bottom_tab_dex').click()
  })

  it('should display skeleton loader when API has yet to return', () => {
    cy.getByTestID('dex_skeleton_loader').should('exist')
  })

  it('should not display skeleton loader when API has return', () => {
    cy.intercept('**/poolpairs?size=*').as('getPoolpairs')
    cy.wait('@getPoolpairs').then(() => {
      cy.getByTestID('dex_skeleton_loader').should('not.exist')
    })
  })

  it('should display 5 available pool pair', function () {
    cy.getByTestID('available_liquidity_tab').getByTestID('pool_pair_row').should('have.length', 5)
  })

  it('should have BTC-DFI PoolPair as 2nd', () => {
    cy.getByTestID('details_dBTC-DFI').click()
    cy.getByTestID('available_liquidity_tab').getByTestID('pool_pair_row').eq(1)
      .invoke('text').should(text => {
        expect(text).to.contains('dBTC-DFI')
        expect(text).to.contains('Pooled DFI')
        expect(text).to.contains('Pooled dBTC')
        expect(text).to.contains('Total liquidity')
        expect(text).to.contains('APR')
      })
  })

  it('should be able to search available poolpair by querying in search input', () => {
    cy.getByTestID('dex_search_icon').click()
    cy.getByTestID('dex_search_input').type('btc')
    cy.getByTestID('details_dBTC-DFI').click()
    cy.getByTestID('available_liquidity_tab').getByTestID('pool_pair_row').should('have.length', 1)
      .invoke('text').should(text => {
        expect(text).to.contains('dBTC-DFI')
        expect(text).to.contains('Pooled DFI')
        expect(text).to.contains('Pooled dBTC')
        expect(text).to.contains('Total liquidity')
        expect(text).to.contains('APR')
      })
  })

  it('should not display any pool pair with non-exist query', () => {
    cy.getByTestID('dex_search_input').clear().type('foo')
    cy.getByTestID('available_liquidity_tab').getByTestID('pool_pair_row').should('not.exist')
  })
})

context('Wallet - DEX - Pool Pair Card - Values', () => {
  const samplePoolPair = [
    {
      id: '15',
      symbol: 'BTC-DFI',
      displaySymbol: 'dBTC-DFI',
      name: 'Playground BTC-Default Defi token',
      status: true,
      tokenA: {
        symbol: 'BTC',
        displaySymbol: 'dBTC',
        id: '1',
        reserve: '1000',
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
        ab: '1',
        ba: '1'
      },
      commission: '0',
      totalLiquidity: {
        token: '1000',
        usd: '20000000'
      },
      tradeEnabled: true,
      ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
      rewardPct: '0.1',
      creation: {
        tx: '79b5f7853f55f762c7550dd7c734dff0a473898bfb5639658875833accc6d461',
        height: 132
      },
      apr: {
        reward: 66.8826,
        total: 66.8826
      }
    },
    {
      id: '16',
      symbol: 'ETH-DFI',
      displaySymbol: 'dETH-DFI',
      name: 'Playground ETH-Default Defi token',
      status: true,
      tokenA: {
        symbol: 'ETH',
        displaySymbol: 'dETH',
        id: '2',
        reserve: '100000',
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
        ab: '100',
        ba: '0.01'
      },
      commission: '0',
      totalLiquidity: {
        token: '10000',
        usd: '20000000'
      },
      tradeEnabled: true,
      ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
      rewardPct: '0.1',
      creation: {
        tx: 'd348c8575b604be7bdab71456d2f8209ec36c322fffc36fcc7cd5e081732b136',
        height: 135
      },
      apr: {
        reward: 66.8826,
        total: 66.8826
      }
    },
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
        tx: '2d8d5bdd40eafefd8cb9530ef2bc8c733c1f08fac7e6b5bf92239521ae4180a6',
        height: 138
      },
      apr: {
        reward: 66.8826,
        total: 66.8826
      }
    }
  ]

  before(() => {
    cy.createEmptyWallet(true)
    cy.sendTokenToWallet(['ETH-DFI']).wait(3000)
    localStorage.setItem('WALLET.DISPLAY_DEXGUIDELINES', 'false')
    cy.getByTestID('bottom_tab_dex').click()
  })

  it('should display available pair values correctly', () => {
    cy.getByTestID('playground_generate_blocks').click() // to ensure poolpairs api will be called
    cy.intercept('**/poolpairs?size=*', {
      body: {
        data: samplePoolPair
      }
    }).as('getPoolPairs')
    cy.wait('@getPoolPairs').then(() => {
      cy.getByTestID('details_dETH-DFI').click()
      cy.getByTestID('available_liquidity_tab').getByTestID('pool_pair_row').eq(1)
        .invoke('text').should(text => {
          expect(text).to.contains('dETH-DFI')
          expect(text).to.contains('APR')
          // TODO: Check favourite is only displaying on browse pool pairs

          // TODO: Check order of price rates
          expect(text).to.contains('Prices')
          expect(text).to.contains('1 dETH')
          expect(text).to.contains('1 DFI')

          expect(text).to.contains('Pooled DFI')
          expect(text).to.contains('Pooled dETH')
          expect(text).to.contains('Total liquidity')
        })

      cy.getByTestID('price_rate_DFI-dETH').should('have.text', '100.00000000 dETH')
      cy.getByTestID('price_rate_dETH-DFI').should('have.text', '0.01000000 DFI')
      cy.getByTestID('available_ETH-DFI_dETH').should('have.text', '100,000 dETH')
      cy.getByTestID('available_ETH-DFI_DFI').should('have.text', '1,000 DFI')
      // (1000 / 100000) * (10000000 / 1000) * 100,000 ETH
      cy.getByTestID('available_ETH-DFI_dETH_USD').should('have.text', '≈ $10,000,000.00')
      // (10000000 / 1000) * 1,000 DFI
      cy.getByTestID('available_ETH-DFI_DFI_USD').should('have.text', '≈ $10,000,000.00')
      cy.getByTestID('totalLiquidity_dETH-DFI_token').should('have.text', '10,000 dETH-DFI')
      cy.getByTestID('available_totalLiquidity_dETH-DFI_USD').should('have.text', '≈ $20,000,000.00')

      // 66.8826 * 100
      cy.getByTestID('apr_dETH-DFI').should('have.text', '6,688.26%')
    })
  })

  it('should display your pool pair values correctly', () => {
    cy.intercept('**/poolpairs?size=*', {
      body: {
        data: samplePoolPair
      }
    })

    cy.getByTestID('dex_tabs_YOUR_POOL_PAIRS').click()
    cy.getByTestID('details_dETH-DFI').click()
    cy.getByTestID('your_liquidity_tab').getByTestID('pool_pair_row_your').first()
      .invoke('text').should(text => {
        expect(text).to.contains('dETH-DFI')
        expect(text).to.contains('APR')
        expect(text).to.contains('Your share in pool')
        expect(text).to.contains('Your shared DFI')
        expect(text).to.contains('Your shared dETH')

        expect(text).to.not.contains('Prices')
        expect(text).to.not.contains('Total liquidity')
      })

    cy.getByTestID('share_in_pool_dETH-DFI').should('have.text', '10.00000000')
    cy.getByTestID('share_in_pool_dETH-DFI_USD').should('have.text', '≈ $20,000.00')
    cy.getByTestID('your_ETH-DFI_dETH').should('have.text', '100.00000000 dETH')
    cy.getByTestID('your_ETH-DFI_DFI').should('have.text', '1.00000000 DFI')
    cy.getByTestID('your_ETH-DFI_dETH_USD').should('have.text', '≈ $10,000.00')
    cy.getByTestID('your_ETH-DFI_DFI_USD').should('have.text', '≈ $10,000.00')
  })
})

context('Wallet - DEX - Your Pool Pairs', () => {
  beforeEach(function () {
    cy.createEmptyWallet()
    localStorage.setItem('WALLET.DISPLAY_DEXGUIDELINES', 'false')
    cy.sendDFItoWallet().sendTokenToWallet(['ETH-DFI']).wait(3000)
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('dex_tabs_YOUR_POOL_PAIRS').click().wait(1000)
  })

  it('should be able to search user pool pairs by querying in search input', () => {
    cy.getByTestID('dex_search_icon').click()
    cy.getByTestID('dex_search_input').type('eth')
    cy.getByTestID('your_liquidity_tab').getByTestID('pool_pair_row_your').should('have.length', 1)
      .invoke('text').should(text => {
        expect(text).to.contains('dETH-DFI')
      })
  })

  it('should not display any pool pair with non-exist query', () => {
    cy.getByTestID('dex_search_icon').click()
    cy.getByTestID('dex_search_input').type('foo')
    cy.getByTestID('your_liquidity_tab').getByTestID('pool_pair_row_your').should('not.exist')
  })
})
