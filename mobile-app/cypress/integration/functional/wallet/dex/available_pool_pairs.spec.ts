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

  it('should display 5 available pool pair', function () {
    cy.getByTestID('liquidity_screen_list').getByTestID('pool_pair_row').should('have.length', 5)
  })

  it('should have BTC-DFI PoolPair as 1st', () => {
    cy.getByTestID('liquidity_screen_list').getByTestID('pool_pair_row').first()
      .invoke('text').should(text => {
        expect(text).to.contains('dBTC-DFI')
        expect(text).to.contains('Pooled DFI')
        expect(text).to.contains('Pooled dBTC')
      })
    cy.getByTestID('apr_dBTC-DFI').should('exist')
  })

  it('should have DFI-USDT PoolPair as 3rd', () => {
    cy.getByTestID('liquidity_screen_list').getByTestID('pool_pair_row').eq(2)
      .invoke('text').should(text => {
        expect(text).to.contains('dUSDT-DFI')
        expect(text).to.contains('Pooled DFI')
        expect(text).to.contains('Pooled dUSDT')
      })
    cy.getByTestID('apr_dBTC-DFI').should('exist')
  })
})
