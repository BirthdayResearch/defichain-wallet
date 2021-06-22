context('app/dex/available', () => {
  beforeEach(function () {
    cy.createEmptyWallet()
    cy.getByTestID('bottom_tab_liquidity').click()
  })

  it('should display 4 available pool pair', function () {
    const list = cy.getByTestID('liquidity_screen_list')

    list.getByTestID('pool_pair_row').should('have.length', 4)
  })

  it('should have DFI-tBTC PoolPair as 1st', () => {
    const list = cy.getByTestID('liquidity_screen_list')

    const row = list.getByTestID('pool_pair_row').first()
    row.invoke('text').should(text => {
      expect(text).to.contains('DFI-tBTC')
      expect(text).to.contains('Pooled DFI')
      expect(text).to.contains('Pooled tBTC')
    })
  })

  it('should have DFI-tUSD PoolPair as 3rd', () => {
    const list = cy.getByTestID('liquidity_screen_list')

    const row = list.getByTestID('pool_pair_row').eq(2)
    row.invoke('text').should(text => {
      expect(text).to.contains('DFI-tUSD')
      expect(text).to.contains('Pooled DFI')
      expect(text).to.contains('Pooled tUSD')
    })
  })
})
