import BigNumber from 'bignumber.js'

export interface BalanceTokenDetail {
  symbol: string
  displaySymbol: string
  name: string
  amount: string | number
  usdAmount?: string
}

function checkValueWithinRange (actualVal: string, expectedVal: string, range: number = 2): void {
  const value = new BigNumber(actualVal.replace(/[≈$,]/gi, '').trim())
  const expectedValue = new BigNumber(expectedVal)
  expect(value.gte(expectedValue.minus(range))).to.be.eq(true)
  expect(value.lte(expectedValue.plus(range))).to.be.eq(true)
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
    cy.getByTestID('total_usd_amount').should('have.text', '$100,000.00')
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
    cy.getByTestID('dfi_total_balance_amount').contains('20.00000000')
    cy.getByTestID('total_dfi_label_symbol').contains('DFI')
    cy.getByTestID('total_dfi_label_name').contains('DeFiChain')
    cy.intercept('**/poolpairs?size=*', {
      body: {
        data: samplePoolPair
      }
    })
    cy.checkBalanceRow('1', { name: 'Playground BTC', amount: '10.00000000', displaySymbol: 'dBTC', symbol: 'BTC', usdAmount: '≈ $100,000.00' })
    cy.checkBalanceRow('2', { name: 'Playground ETH', amount: '10.00000000', displaySymbol: 'dETH', symbol: 'ETH', usdAmount: '≈ $1,000.00' })
    cy.getByTestID('total_usd_amount').contains('$301,000.00')
  })

  it('should display BTC and ETH with correct amounts', function () {
    cy.getByTestID('balances_list').should('exist')
    cy.checkBalanceRow('1', { name: 'Playground BTC', amount: '10.00000000', displaySymbol: 'dBTC', symbol: 'BTC', usdAmount: '≈ $100,000.00' })
    cy.checkBalanceRow('2', { name: 'Playground ETH', amount: '10.00000000', displaySymbol: 'dETH', symbol: 'ETH', usdAmount: '≈ $1,000.00' })
  })

  it('should hide all DFI, BTC and ETH amounts on toggle', function () {
    cy.getByTestID('toggle_balance').click()
    cy.getByTestID('dfi_total_balance_amount').should('have.text', '*****')
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
    cy.getByTestID('dfi_total_balance_amount').contains('0.00000000')
    cy.getByTestID('dfi_total_balance_usd_amount').should('have.text', '≈ $0.00000000')
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

context('Wallet - Balances - USD Value', () => {
  const getChangingPoolPairReserve = ({
    pair1ReserveA, // BTC (BTC-DFI)
    pair1ReserveB, // DFI (BTC-DFI)
    pair2ReserveA, // USDT (USDT-DFI)
    pair2ReserveB // DFI (USDT-DFI)
  }: {
    pair1ReserveA: string
    pair1ReserveB: string
    pair2ReserveA: string
    pair2ReserveB: string
  }): any => [
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
        reserve: pair1ReserveA,
        blockCommission: '0'
      },
      tokenB: {
        symbol: 'DFI',
        displaySymbol: 'DFI',
        id: '0',
        reserve: pair1ReserveB,
        blockCommission: '0'
      },
      priceRatio: {
        ab: '1',
        ba: '1'
      },
      commission: '0',
      totalLiquidity: {
        token: '2500',
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
        tx: '351c80a14f441af1c237f4abc138df242e67c8ef47cfbc1af3437798ce14bd1b',
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
      name: 'Decentralized USD-Default Defi token',
      status: true,
      tokenA: {
        symbol: 'USDT',
        displaySymbol: 'dUSDT',
        id: '14',
        reserve: pair2ReserveA,
        blockCommission: '0'
      },
      tokenB: {
        symbol: 'DFI',
        displaySymbol: 'DFI',
        id: '0',
        reserve: pair2ReserveB,
        blockCommission: '0'
      },
      priceRatio: {
        ab: '10',
        ba: '0.1'
      },
      commission: '0.02',
      totalLiquidity: {
        token: '2500',
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
    cy.intercept('**/poolpairs?size=*', {
      body: {
        data: getChangingPoolPairReserve({
          pair1ReserveA: '1001',
          pair1ReserveB: '1001',
          pair2ReserveA: '8330',
          pair2ReserveB: '830'
        })
      }
    })
    cy.createEmptyWallet(true).wait(3000)
    cy.sendDFItoWallet().sendTokenToWallet(['BTC', 'USDT-DFI', 'USDT', 'ETH', 'ETH-DFI']).wait(10000)
  })

  it('should be able to get DEX Price USD Value', () => {
    // DFI USD
    // (8330 / 830) * 10.00
    cy.getByTestID('dfi_total_balance_usd_amount').invoke('text').then(text => {
      checkValueWithinRange(text, '100.36', 1)
    })

    // (1001 / 1001) * (8330 / 830) * 10.00
    cy.checkBalanceRow('1', { name: 'Playground BTC', amount: '10.00000000', displaySymbol: 'dBTC', symbol: 'BTC', usdAmount: '≈ $100.36' })
    // (1000/ 100000 ) * (8330 / 830) * 10.00
    cy.checkBalanceRow('2', { name: 'Playground ETH', amount: '10.00000000', displaySymbol: 'dETH', symbol: 'ETH', usdAmount: '≈ $1.00' })
    // 10 * 1
    cy.checkBalanceRow('3', { name: 'Playground USDT', amount: '10.00000000', displaySymbol: 'dUSDT', symbol: 'USDT', usdAmount: '≈ $10.00' })

    // USDT  = ((10 / 2500) * 8330) * 1
    // DFI =  ((10 / 2500) * 830) * (8330 / 830)
    // DFI + USDT
    cy.checkBalanceRow('18', { name: 'Playground USDT-DeFiChain', amount: '10.00000000', displaySymbol: 'dUSDT-DFI', symbol: 'USDT-DFI', usdAmount: '≈ $66.64' })
    cy.checkBalanceRow('17', { name: 'Playground ETH-DeFiChain', amount: '10.00000000', displaySymbol: 'dETH-DFI', symbol: 'ETH-DFI', usdAmount: '≈ $20.07' })

    cy.getByTestID('total_usd_amount').invoke('text').then(text => {
      checkValueWithinRange(text, '298.52')
    })
  })

  it('should be able to update USD Value when poolpair change', () => {
    cy.intercept('**/poolpairs?size=*', {
      body: {
        data: getChangingPoolPairReserve({
          pair1ReserveA: '5',
          pair1ReserveB: '1000',
          pair2ReserveA: '8300',
          pair2ReserveB: '100'
        })
      }
    })
    cy.wait(5000)

    // DFI USD
    // (8330 / 100) * 10.00
    cy.getByTestID('dfi_total_balance_usd_amount').invoke('text').then(text => {
      checkValueWithinRange(text, '833', 5)
    })

    // Token USD
    // (1000 / 5) * (8300 / 100) * 10.00
    cy.checkBalanceRow('1', { name: 'Playground BTC', amount: '10.00000000', displaySymbol: 'dBTC', symbol: 'BTC', usdAmount: '≈ $166,000.00' })
    // (1000 / 100000) * (8300 / 100) * 10.00
    cy.checkBalanceRow('2', { name: 'Playground ETH', amount: '10.00000000', displaySymbol: 'dETH', symbol: 'ETH', usdAmount: '≈ $8.30' })
    cy.checkBalanceRow('3', { name: 'Playground USDT', amount: '10.00000000', displaySymbol: 'dUSDT', symbol: 'USDT', usdAmount: '≈ $10.00' })

    // LP USD
    // USDT = (10 / 2500) * 8300) * 1 == 33.2
    // DFI = (10 / 2500) * 100) * (8300 / 100) == 33.2
    // DFI + USDT
    cy.checkBalanceRow('18', { name: 'Playground USDT-DeFiChain', amount: '10.00000000', displaySymbol: 'dUSDT-DFI', symbol: 'USDT-DFI', usdAmount: '≈ $66.40' })

    // dETH = (1000 / 100000) * 8300 = 83.0
    // DFI = (1000 / 100000) * 100) * (8300 / 100) == 83.0
    // DFI + dETH
    cy.checkBalanceRow('17', { name: 'Playground ETH-DeFiChain', amount: '10.00000000', displaySymbol: 'dETH-DFI', symbol: 'ETH-DFI', usdAmount: '≈ $166.00' })

    cy.getByTestID('total_usd_amount').invoke('text').then(text => {
      checkValueWithinRange(text, '167083.70', 5)
    })
  })

  it('should be able to update USD Value when token is received', () => {
    cy.intercept('**/poolpairs?size=*', {
      body: {
        data: getChangingPoolPairReserve({
          pair1ReserveA: '5',
          pair1ReserveB: '1000',
          pair2ReserveA: '8300',
          pair2ReserveB: '100'
        })
      }
    })
    cy.sendTokenToWallet(['BTC', 'USDT-DFI', 'USDT', 'ETH-DFI']).wait(3000)

    // DFI USD
    cy.getByTestID('dfi_total_balance_usd_amount').invoke('text').then(text => {
      checkValueWithinRange(text, '833', 5)
    })

    // Token USD
    cy.checkBalanceRow('1', { name: 'Playground BTC', amount: '20.00000000', displaySymbol: 'dBTC', symbol: 'BTC', usdAmount: '≈ $332,000.00' })
    cy.checkBalanceRow('2', { name: 'Playground ETH', amount: '10.00000000', displaySymbol: 'dETH', symbol: 'ETH', usdAmount: '≈ $8.30' })
    cy.checkBalanceRow('3', { name: 'Playground USDT', amount: '20.00000000', displaySymbol: 'dUSDT', symbol: 'USDT', usdAmount: '≈ $20.00' })

    // LP USD
    cy.checkBalanceRow('18', { name: 'Playground USDT-DeFiChain', amount: '20.00000000', displaySymbol: 'dUSDT-DFI', symbol: 'USDT-DFI', usdAmount: '≈ $132.80' })
    cy.checkBalanceRow('17', { name: 'Playground ETH-DeFiChain', amount: '20.00000000', displaySymbol: 'dETH-DFI', symbol: 'ETH-DFI', usdAmount: '≈ $332.00' })

    cy.getByTestID('total_usd_amount').invoke('text').then(text => {
      checkValueWithinRange(text, '333326.1')
    })
  })

  it('should be able to update USD Value when DFI is received', () => {
    cy.intercept('**/poolpairs?size=*', {
      body: {
        data: getChangingPoolPairReserve({
          pair1ReserveA: '5',
          pair1ReserveB: '1000',
          pair2ReserveA: '8300',
          pair2ReserveB: '100'
        })
      }
    })
    cy.sendDFItoWallet().wait(5000)
    cy.getByTestID('dfi_total_balance_amount').invoke('text').then(text => {
      checkValueWithinRange(text, '20', 1)
    })
    cy.getByTestID('dfi_total_balance_usd_amount').invoke('text').then(text => {
      checkValueWithinRange(text, '1666', 5)
    })
    cy.getByTestID('total_usd_amount').invoke('text').then(text => {
      checkValueWithinRange(text, '334155.89', 5)
    })
  })
})

context('Wallet - Balances - display sorted USD values', function () {
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().wait(3000)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('bottom_tab_balances').click()
  })

  it('should display LTC on top of ETH after topping up more LTC', function () {
    cy.sendTokenToWallet(['ETH', 'LTC']).wait(3000)
    // dETH will be displayed at the top of the card on first topup
    cy.get('[data-testid="card_balance_row_container"]').children().first().contains('dETH')
    cy.sendTokenToWallet(['LTC']).wait(3000)
    cy.get('[data-testid="card_balance_row_container"]').children().first().contains('dLTC')
  })
})
