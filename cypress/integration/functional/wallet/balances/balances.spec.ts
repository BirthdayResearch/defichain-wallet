export interface BalanceTokenDetail {
  symbol: string
  name: string
  amount: string | number
}

context('Wallet - Balances', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_settings').click()
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(['BTC', 'ETH']).wait(3000)
    cy.getByTestID('bottom_tab_balances').click()
  })

  it('should display utxoDFI, DFI, BTC and ETH with correct amounts', function () {
    cy.getByTestID('balances_list').should('exist')
    cy.checkBalanceRow('0_utxo', { name: 'DeFiChain', amount: '10.00000000', symbol: 'DFI (UTXO)' })
    cy.checkBalanceRow('0', { name: 'DeFiChain', amount: '10.00000000', symbol: 'DFI (Token)' })
    cy.checkBalanceRow('1', { name: 'Playground BTC', amount: '10.00000000', symbol: 'BTC' })
    cy.checkBalanceRow('2', { name: 'Playground ETH', amount: '10.00000000', symbol: 'ETH' })
  })

  it('should redirect to receive page', function () {
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('header_receive_balance').click()
    cy.getByTestID('address_text').should('exist')
  })
})
