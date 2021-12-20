context('Wallet - DEX - Available Pool Pairs', () => {
  beforeEach(function () {
    cy.createEmptyWallet()
    localStorage.setItem('WALLET.DISPLAY_DEXGUIDELINES', 'false')
    cy.getByTestID('bottom_tab_dex').click()
  })

  it('should display skeleton loader when API has yet to return', () => {
    cy.intercept('**/poolpairs?size=*', {
      body: {
        data: [
          {}
        ]
      },
      delay: 3000
    })
    cy.getByTestID('dex_skeleton_loader').should('exist')
  })

  it('should not display skeleton loader when API has return', () => {
    cy.intercept('**/poolpairs?size=*').as('getPoolpairs')
    cy.wait('@getPoolpairs').then(() => {
      cy.getByTestID('dex_skeleton_loader').should('not.exist')
    })
  })

  it('should display 10 available pool pair', function () {
    cy.getByTestID('available_liquidity_tab').getByTestID('pool_pair_row').should('have.length', 10)
  })

  it('should have BTC-DFI PoolPair as 1st', () => {
    cy.getByTestID('available_liquidity_tab').getByTestID('pool_pair_row').first()
      .invoke('text').should(text => {
        expect(text).to.contains('dBTC-DFI')
        expect(text).to.contains('Pooled DFI')
        expect(text).to.contains('Pooled dBTC')
        expect(text).to.contains('Total liquidity (USD)')
        expect(text).to.contains('APR')
      })
  })

  it('should have DFI-USDT PoolPair as 3rd', () => {
    cy.getByTestID('available_liquidity_tab').getByTestID('pool_pair_row').eq(2)
      .invoke('text').should(text => {
        expect(text).to.contains('dUSDT-DFI')
        expect(text).to.contains('Pooled DFI')
        expect(text).to.contains('Pooled dUSDT')
        expect(text).to.contains('Total liquidity (USD)')
        expect(text).to.contains('APR')
      })
  })

  it('should be able to search available poolpair by querying in search input', () => {
    cy.getByTestID('dex_search_icon').click()
    cy.getByTestID('dex_search_input').type('btc')
    cy.getByTestID('available_liquidity_tab').getByTestID('pool_pair_row').should('have.length', 1)
      .invoke('text').should(text => {
        expect(text).to.contains('dBTC-DFI')
        expect(text).to.contains('Pooled DFI')
        expect(text).to.contains('Pooled dBTC')
        expect(text).to.contains('Total liquidity (USD)')
        expect(text).to.contains('APR')
      })
  })

  it('should not display any pool pair with non-exist query', () => {
    cy.getByTestID('dex_search_icon').click()
    cy.getByTestID('dex_search_input').type('foo')
    cy.getByTestID('available_liquidity_tab').getByTestID('pool_pair_row').should('not.exist')
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
