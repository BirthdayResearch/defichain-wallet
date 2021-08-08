context('Wallet - DEX - Available Pool Pairs', () => {
  beforeEach(function () {
    cy.createEmptyWallet()
    cy.getByTestID('bottom_tab_dex').click()
  })

  it('should display 5 available pool pair', function () {
    const list = cy.getByTestID('liquidity_screen_list')

    list.getByTestID('pool_pair_row').should('have.length', 5)
  })

  it('should have DFI-BTC PoolPair as 1st', () => {
    const list = cy.getByTestID('liquidity_screen_list')

    const row = list.getByTestID('pool_pair_row').first()
    row.invoke('text').should(text => {
      expect(text).to.contains('DFI-BTC')
      expect(text).to.contains('Pooled DFI')
      expect(text).to.contains('Pooled BTC')
    })
  })

  it('should have DFI-USDT PoolPair as 3rd', () => {
    const list = cy.getByTestID('liquidity_screen_list')

    const row = list.getByTestID('pool_pair_row').eq(2)
    row.invoke('text').should(text => {
      expect(text).to.contains('DFI-USDT')
      expect(text).to.contains('Pooled DFI')
      expect(text).to.contains('Pooled USDT')
    })
  })
})
