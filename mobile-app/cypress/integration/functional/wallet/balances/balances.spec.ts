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

  it('should display dfi utxo and dfi token with correct amount', function () {
    cy.getByTestID('dfi_balance_card').should('exist')
    cy.getByTestID('dfi_utxo_amount').contains('10.00000000')
    cy.getByTestID('dfi_utxo_label').contains('UTXO')
    cy.getByTestID('dfi_token_amount').contains('10.00000000')
    cy.getByTestID('dfi_token_label').contains('Token')
    cy.getByTestID('total_dfi_amount').contains('20.00000000')
    cy.getByTestID('total_dfi_label').contains('DFI')
  })

  it('should display BTC and ETH with correct amounts', function () {
    cy.getByTestID('balances_list').should('exist')
    cy.checkBalanceRow('1', { name: 'Playground BTC', amount: '10.00000000', symbol: 'dBTC' })
    cy.checkBalanceRow('2', { name: 'Playground ETH', amount: '10.00000000', symbol: 'dETH' })
  })

  it('should redirect to receive page', function () {
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('header_receive_balance').click()
    cy.getByTestID('address_text').should('exist')
  })

  it('should be able to navigate to convert dfi page', function () {
    cy.getByTestID('convert_dfi_button').click()
    cy.getByTestID('convert_screen').should('exist')
  })

  it('should be able to navigate to send dfi page', function () {
    cy.getByTestID('send_dfi_button').click()
    cy.getByTestID('send_screen').should('exist')
  })
})

context('Wallet - Balances - Failed API', () => {
  before(function () {
    cy.createEmptyWallet(true)
  })

  it('should handle failed API calls', function () {
    cy.intercept('**/regtest/address/**', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.getByTestID('dfi_utxo_amount').contains('0.00000000')
    cy.getByTestID('dfi_token_amount').contains('0.00000000')
    cy.getByTestID('total_dfi_amount').contains('0.00000000')
  })
})
