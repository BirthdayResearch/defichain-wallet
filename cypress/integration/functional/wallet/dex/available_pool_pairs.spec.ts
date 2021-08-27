context('Wallet - DEX - Available Pool Pairs', () => {
  beforeEach(function () {
    cy.createEmptyWallet()
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

  it('should have DFI-BTC PoolPair as 1st', () => {
    cy.getByTestID('liquidity_screen_list').getByTestID('pool_pair_row').first()
      .invoke('text').should(text => {
        expect(text).to.contains('DFI-BTC')
        expect(text).to.contains('Pooled DFI')
        expect(text).to.contains('Pooled BTC')
      })
    cy.getByTestID('apr_DFI-BTC').should('exist')
  })

  it('should have DFI-USDT PoolPair as 3rd', () => {
    cy.getByTestID('liquidity_screen_list').getByTestID('pool_pair_row').eq(2)
      .invoke('text').should(text => {
        expect(text).to.contains('DFI-USDT')
        expect(text).to.contains('Pooled DFI')
        expect(text).to.contains('Pooled USDT')
      })
    cy.getByTestID('apr_DFI-USDT').should('exist')
  })
})
