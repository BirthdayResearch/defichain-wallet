export interface BalanceTokenDetail {
  symbol: string
  displaySymbol: string
  name: string
  amount: string | number
  usdAmount?: string
}

context('Wallet - Balances', () => {
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
      id: '20',
      symbol: 'DUSD-DFI',
      displaySymbol: 'DUSD-DFI',
      name: 'Decentralized USD-Default Defi token',
      status: true,
      tokenA: {
        symbol: 'DUSD',
        displaySymbol: 'DUSD',
        id: '14',
        reserve: '8330',
        blockCommission: '0'
      },
      tokenB: {
        symbol: 'DFI',
        displaySymbol: 'DFI',
        id: '0',
        reserve: '833',
        blockCommission: '0'
      },
      priceRatio: {
        ab: '10',
        ba: '0.1'
      },
      commission: '0.02',
      totalLiquidity: {
        token: '2634.17729078',
        usd: '16660'
      },
      tradeEnabled: true,
      ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
      rewardPct: '0.1',
      creation: {
        tx: '4b8d5ec122052cdb8e8ffad63865444a10edc396d44e52957758ef7a39b228fa',
        height: 147
      },
      apr: {
        reward: 80291.23649459783,
        total: 80291.23649459783
      }
    }
  ]
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().wait(3000)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('bottom_tab_balances').click()
  })

  it('should display no tokens text', function () {
    cy.intercept('**/poolpairs?size=*', {
      body: {
        data: samplePoolPair
      }
    })
    cy.getByTestID('total_usd_amount').should('have.text', '$100.00')
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
    cy.intercept('**/poolpairs?size=*', {
      body: {
        data: samplePoolPair
      }
    })
    cy.checkBalanceRow('1', { name: 'Playground BTC', amount: '10.00000000', displaySymbol: 'dBTC', symbol: 'BTC', usdAmount: '≈ $100.00' })
    cy.checkBalanceRow('2', { name: 'Playground ETH', amount: '10.00000000', displaySymbol: 'dETH', symbol: 'ETH', usdAmount: '≈ $1.00' })
    cy.getByTestID('total_usd_amount').contains('$301.00')
  })

  it('should display BTC and ETH with correct amounts', function () {
    cy.getByTestID('balances_list').should('exist')
    cy.checkBalanceRow('1', { name: 'Playground BTC', amount: '10.00000000', displaySymbol: 'dBTC', symbol: 'BTC', usdAmount: '≈ $100.00' })
    cy.checkBalanceRow('2', { name: 'Playground ETH', amount: '10.00000000', displaySymbol: 'dETH', symbol: 'ETH', usdAmount: '≈ $1.00' })
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
    cy.getByTestID('total_usd_amount').should('have.text', '$0.00000000')
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
