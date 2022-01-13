import { WhaleApiClient } from '@defichain/whale-api-client'
import BigNumber from 'bignumber.js'

export interface BalanceTokenDetail {
  symbol: string
  displaySymbol: string
  name: string
  amount: string | number
  checkActivePrice?: boolean
}

context('Wallet - Balances', () => {
  let whale: WhaleApiClient

  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().wait(3000)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('bottom_tab_balances').click()
    const network = localStorage.getItem('Development.NETWORK')
    whale = new WhaleApiClient({
      url: network === 'Playground' ? 'https://playground.defichain.com' : 'http://localhost:19553',
      network: 'regtest',
      version: 'v0'
    })
  })

  it('should display no tokens text', function () {
    cy.getByTestID('total_usd_amount').should('have.text', '$1,000.00')
    cy.getByTestID('empty_tokens_title').should('have.text', 'No other tokens yet')
    cy.getByTestID('empty_tokens_subtitle').should('have.text', 'Get started by adding your tokens here in your wallet')
  })

  it('should display dfi utxo and dfi token with correct amount', function () {
    cy.sendDFITokentoWallet()
      .sendTokenToWallet(['BTC', 'ETH']).wait(3000)
    cy.getByTestID('dfi_balance_card').should('exist')
    cy.getByTestID('dfi_utxo_amount').contains('10.00000000')
    cy.getByTestID('dfi_utxo_label').contains('UTXO')
    cy.getByTestID('dfi_token_amount').contains('10.00000000')
    cy.getByTestID('dfi_token_label').contains('Token')
    cy.getByTestID('total_dfi_amount').contains('20.00000000')
    cy.getByTestID('total_dfi_label').contains('DFI')
    cy.checkBalanceRow('1', { name: 'Playground BTC', amount: '10.00000000', displaySymbol: 'dBTC', symbol: 'BTC', checkActivePrice: true })
    cy.checkBalanceRow('2', { name: 'Playground ETH', amount: '10.00000000', displaySymbol: 'dETH', symbol: 'ETH', checkActivePrice: true })
    // Check total portfolio value
    cy.wrap(whale.prices.getFeedActive('DFI', 'USD')).then((dfiResponse) => {
      const activePrice = dfiResponse.length > 0 ? dfiResponse[0]?.active?.amount : 0
      let totalUsdValue = new BigNumber('20').multipliedBy(activePrice)
      cy.wrap(whale.prices.getFeedActive('BTC', 'USD')).then((btcResponse) => {
        const btcActivePrice = btcResponse.length > 0 ? btcResponse[0]?.active?.amount : 0
        const btcUsdValue = new BigNumber('10').multipliedBy(btcActivePrice)
        totalUsdValue = totalUsdValue.plus(btcUsdValue)
        cy.wrap(whale.prices.getFeedActive('ETH', 'USD')).then((ethResponse) => {
          const ethActivePrice = ethResponse.length > 0 ? ethResponse[0]?.active?.amount : 0
          const ethUsdValue = new BigNumber('10').multipliedBy(ethActivePrice)
          totalUsdValue = totalUsdValue.plus(ethUsdValue)
          cy.getByTestID('total_usd_amount').then(($txt: any) => {
            const value = $txt[0].textContent.replace(',', '')
            expect(value).eq(`$${totalUsdValue.toFixed(2)}`)
          })
        })
      })
    })
  })

  it('should display BTC and ETH with correct amounts', function () {
    cy.getByTestID('balances_list').should('exist')
    cy.checkBalanceRow('1', { name: 'Playground BTC', amount: '10.00000000', displaySymbol: 'dBTC', symbol: 'BTC', checkActivePrice: true })
    cy.checkBalanceRow('2', { name: 'Playground ETH', amount: '10.00000000', displaySymbol: 'dETH', symbol: 'ETH', checkActivePrice: true })
  })

  it('should hide all DFI, BTC and ETH amounts on toggle', function () {
    cy.getByTestID('toggle_balance').click()
    cy.getByTestID('total_dfi_amount').should('have.text', '***** DFI')
    cy.getByTestID('dfi_utxo_amount').should('have.text', '*****')
    cy.getByTestID('dfi_token_amount').should('have.text', '*****')
    cy.getByTestID('total_usd_amount').should('have.text', '*****')
    cy.checkBalanceRow('1', { name: 'Playground BTC', amount: '*****', displaySymbol: 'dBTC', symbol: 'BTC' })
    cy.checkBalanceRow('2', { name: 'Playground ETH', amount: '*****', displaySymbol: 'dETH', symbol: 'ETH' })
  })

  it('should redirect to send page', function () {
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('send_balance_button').click()
    cy.getByTestID('send_screen').should('exist')
  })

  it('should redirect to receive page', function () {
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('receive_balance_button').click()
    cy.getByTestID('address_text').should('exist')
  })

  it('should be able to navigate to convert dfi page', function () {
    cy.go('back')
    cy.getByTestID('convert_dfi_button').click()
    cy.getByTestID('convert_screen').should('exist')
  })

  it('should be able to navigate to send dfi page', function () {
    cy.go('back')
    cy.getByTestID('send_dfi_button').click()
    cy.getByTestID('send_screen').should('exist')
  })

  it('should be able to navigate to utxo vs token page', function () {
    cy.go('back')
    cy.getByTestID('token_vs_utxo_info').click()
    cy.getByTestID('token_vs_utxo_screen').should('exist')
  })
})

context('Wallet - Balances - Failed API', () => {
  beforeEach(function () {
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
    cy.getByTestID('total_usd_amount').should('have.text', '$0.00')
  })

  it('should display correct address', function () {
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('receive_balance_button').click()
    cy.getByTestID('address_text').should('exist').then(($txt: any) => {
      const address = $txt[0].textContent
      cy.getByTestID('wallet_address').should('contain', address)
    })
  })
})

context('Wallet - Balances - No balance', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
  })

  it('should disable send button', function () {
    cy.getByTestID('send_balance_button').should('have.attr', 'aria-disabled')
  })

  it('should display empty balance to replace token list', function () {
    cy.getByTestID('empty_balances').should('exist')
  })
})
