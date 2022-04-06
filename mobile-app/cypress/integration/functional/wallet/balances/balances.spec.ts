import { checkValueWithinRange } from '../../../../support/walletCommands'

export interface BalanceTokenDetail {
  symbol: string
  displaySymbol: string
  name: string
  amount: string | number
  usdAmount?: string
}

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

const addTokensWithFourCategories = [
  {
    amount: '5.00000000',
    displaySymbol: 'dBTC-DFI',
    id: '16',
    isDAT: true,
    isLPS: true,
    isLoanToken: false,
    name: 'Playground BTC-Default Defi token',
    symbol: 'BTC-DFI',
    symbolKey: 'BTC-DFI'
  },
  {
    amount: '5.00000000',
    displaySymbol: 'dBTC',
    id: '1',
    isDAT: true,
    isLPS: false,
    isLoanToken: false,
    name: 'Playground BTC',
    symbol: 'BTC',
    symbolKey: 'BTC'
  },
  {
    amount: '10.00000000',
    displaySymbol: 'dETH',
    id: '2',
    isDAT: true,
    isLPS: false,
    isLoanToken: false,
    name: 'Playground ETH',
    symbol: 'ETH',
    symbolKey: 'ETH'
  },
  {
    amount: '11.00000000',
    displaySymbol: 'DUSD',
    id: '14',
    isDAT: true,
    isLPS: false,
    isLoanToken: true,
    name: 'Decentralized USD',
    symbol: 'DUSD',
    symbolKey: 'DUSD'
  }
]

function interceptTokenWithSampleData (): void {
  cy.intercept('**/tokens?size=*', {
    body: {
      data: addTokensWithFourCategories
    }
  })
}

context('Wallet - Balances page', () => {
  before(function () {
    cy.createEmptyWallet(true)
  })

  it('should display EmptyPortfolio component when there are no DFI and other tokens', function () {
    cy.intercept('**/poolpairs?size=*', {
      body: {
        data: []
      }
    })
    cy.getByTestID('empty_portfolio').should('exist')
    cy.getByTestID('empty_tokens_title').should('have.text', 'Empty portfolio')
    cy.getByTestID('empty_tokens_subtitle').should('have.text', 'Add your DFI and other tokens to get started')
  })
})

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
    cy.sendDFItoWallet().wait(6000)
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
    cy.getByTestID('empty_tokens_title').should('not.exist')
    cy.getByTestID('empty_tokens_subtitle').should('not.exist')
  })

  it('should display dfi utxo and dfi token with correct amount', function () {
    cy.sendDFITokentoWallet()
      .sendTokenToWallet(['BTC', 'ETH']).wait(6000)
    cy.getByTestID('dfi_balance_card').should('exist')
    cy.getByTestID('details_dfi').click()
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
    cy.getByTestID('dfi_available_percentage_text').should('have.text', '*****')
    cy.getByTestID('dfi_locked_percentage_text').should('have.text', '*****')
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

  it('should not display any value when API failed', function () {
    cy.intercept('**/regtest/address/**', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.getByTestID('details_dfi').click()
    cy.getByTestID('total_portfolio_skeleton_loader').should('exist')
    cy.getByTestID('dfi_balance_skeleton_loader').should('exist')
    cy.getByTestID('dfi_USD_balance_skeleton_loader').should('exist')
    cy.getByTestID('dfi_breakdown_row_skeleton_loader').should('exist')
    cy.getByTestID('balance_skeleton_loader').should('exist')
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

  it('should display empty portfolio to replace token list', function () {
    cy.getByTestID('empty_balances').should('not.exist')
    cy.getByTestID('empty_portfolio').should('exist')
  })
})

context('Wallet - Balances - USD Value', () => {
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
    cy.checkBalanceRow('19', { name: 'Playground USDT-DeFiChain', amount: '10.00000000', displaySymbol: 'dUSDT-DFI', symbol: 'USDT-DFI', usdAmount: '≈ $66.64' })
    cy.checkBalanceRow('18', { name: 'Playground ETH-DeFiChain', amount: '10.00000000', displaySymbol: 'dETH-DFI', symbol: 'ETH-DFI', usdAmount: '≈ $20.07' })

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
    cy.checkBalanceRow('19', { name: 'Playground USDT-DeFiChain', amount: '10.00000000', displaySymbol: 'dUSDT-DFI', symbol: 'USDT-DFI', usdAmount: '≈ $66.40' })

    // dETH = (1000 / 100000) * 8300 = 83.0
    // DFI = (1000 / 100000) * 100) * (8300 / 100) == 83.0
    // DFI + dETH
    cy.checkBalanceRow('18', { name: 'Playground ETH-DeFiChain', amount: '10.00000000', displaySymbol: 'dETH-DFI', symbol: 'ETH-DFI', usdAmount: '≈ $166.00' })

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
    cy.checkBalanceRow('19', { name: 'Playground USDT-DeFiChain', amount: '20.00000000', displaySymbol: 'dUSDT-DFI', symbol: 'USDT-DFI', usdAmount: '≈ $132.80' })
    cy.checkBalanceRow('18', { name: 'Playground ETH-DeFiChain', amount: '20.00000000', displaySymbol: 'dETH-DFI', symbol: 'ETH-DFI', usdAmount: '≈ $332.00' })

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

context('Wallet - Balances - Assets filter tab', function () {
  before(function () {
    cy.createEmptyWallet(true)
  })

  it('should display All tokens that are available in asset', function () {
    interceptTokenWithSampleData()
    cy.getByTestID('toggle_sorting_assets').should('exist')
    cy.getByTestID('balance_button_group_ALL_TOKENS_active').should('exist')
    cy.getByTestID('balances_row_1').should('exist') // dBTC = row 1
    cy.getByTestID('balances_row_2').should('exist') // dETH = row 2
    cy.getByTestID('balances_row_14').should('exist') // DUSD = row 14
    cy.getByTestID('balances_row_16').should('exist') // dBTC-DFI = row 16
  })

  it('should display only LP tokens that are available in asset', function () {
    interceptTokenWithSampleData()
    cy.getByTestID('toggle_sorting_assets').should('exist')
    cy.getByTestID('balance_button_group_LP_TOKENS').click()
    cy.getByTestID('balance_button_group_LP_TOKENS_active').should('exist')
    cy.getByTestID('balances_row_1').should('not.exist')
    cy.getByTestID('balances_row_2').should('not.exist')
    cy.getByTestID('balances_row_14').should('not.exist')
    cy.getByTestID('balances_row_16').should('exist')
  })

  it('should display only Crypto that are available in asset', function () {
    interceptTokenWithSampleData()
    cy.getByTestID('toggle_sorting_assets').should('exist')
    cy.getByTestID('balance_button_group_CRYPTO').click()
    cy.getByTestID('balance_button_group_CRYPTO_active').should('exist')
    cy.getByTestID('balances_row_14').should('not.exist')
    cy.getByTestID('balances_row_16').should('not.exist')
    cy.getByTestID('balances_row_1').should('exist')
    cy.getByTestID('balances_row_2').should('exist')
  })

  it('should display only dTokens that are available in asset', function () {
    interceptTokenWithSampleData()
    cy.getByTestID('toggle_sorting_assets').should('exist')
    cy.getByTestID('balance_button_group_d_TOKENS').click()
    cy.getByTestID('balance_button_group_d_TOKENS_active').should('exist')
    cy.getByTestID('balances_row_1').should('not.exist')
    cy.getByTestID('balances_row_2').should('not.exist')
    cy.getByTestID('balances_row_16').should('not.exist')
    cy.getByTestID('balances_row_14').should('exist')
  })
})

context('Wallet - Balances - Assets filter tab - filter respective tokens in selected tab', function () {
  before(function () {
    cy.createEmptyWallet(true)
  })

  it('should exist in All tokens and Crypto tabs, should not exist in LP tokens and dTokens tabs', function () {
    cy.intercept('**/tokens?size=*', {
      body: {
        data: [{
          amount: '5.00000000',
          displaySymbol: 'dBTC',
          id: '1',
          isDAT: true,
          isLPS: false,
          isLoanToken: false,
          name: 'Playground BTC',
          symbol: 'BTC',
          symbolKey: 'BTC'
        }]
      }
    })
    cy.getByTestID('toggle_sorting_assets').should('exist')
    cy.getByTestID('balance_button_group_ALL_TOKENS_active').should('exist')
    cy.getByTestID('balances_row_1').should('exist') // dBTC = row 1
    cy.getByTestID('balance_button_group_CRYPTO').click()
    cy.getByTestID('balance_button_group_CRYPTO_active').should('exist')
    cy.getByTestID('balances_row_1').should('exist') // dBTC = row 1
    cy.getByTestID('balance_button_group_LP_TOKENS').click()
    cy.getByTestID('balance_button_group_LP_TOKENS_active').should('exist')
    cy.getByTestID('empty_tokens_title').should('have.text', 'No LP tokens in portfolio')
    cy.getByTestID('balance_button_group_d_TOKENS').click()
    cy.getByTestID('balance_button_group_d_TOKENS_active').should('exist')
    cy.getByTestID('empty_tokens_title').should('have.text', 'No dTokens in portfolio')
  })
  it('should exist in All tokens and dTokens tabs, should not exist in LP tokens and Crypto tabs', function () {
    cy.intercept('**/tokens?size=*', {
      body: {
        data: [{
          amount: '11.00000000',
          displaySymbol: 'DUSD',
          id: '14',
          isDAT: true,
          isLPS: false,
          isLoanToken: true,
          name: 'Decentralized USD',
          symbol: 'DUSD',
          symbolKey: 'DUSD'
        }]
      }
    })
    cy.getByTestID('toggle_sorting_assets').should('exist')
    cy.getByTestID('balance_button_group_ALL_TOKENS').click()
    cy.getByTestID('balance_button_group_ALL_TOKENS_active').should('exist')
    cy.getByTestID('balances_row_14').should('exist') // DUSD = row 14
    cy.getByTestID('balance_button_group_LP_TOKENS').click()
    cy.getByTestID('balance_button_group_LP_TOKENS_active').should('exist')
    cy.getByTestID('empty_tokens_title').should('have.text', 'No LP tokens in portfolio')
    cy.getByTestID('balance_button_group_CRYPTO').click()
    cy.getByTestID('balance_button_group_CRYPTO_active').should('exist')
    cy.getByTestID('empty_tokens_title').should('have.text', 'No Crypto in portfolio')
    cy.getByTestID('balance_button_group_d_TOKENS').click()
    cy.getByTestID('balance_button_group_d_TOKENS_active').should('exist')
    cy.getByTestID('balances_row_14').should('exist') // DUSD = row 14
  })
})

context('Wallet - Balances - Your Assets - All tokens tab', function () {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('bottom_tab_balances').click()
  })

  it('should not display sorting icon if there are no other tokens', function () {
    cy.intercept('**/tokens?size=*', {
      body: {
        data: []
      }
    })
    cy.getByTestID('empty_balances').should('not.exist')
    cy.getByTestID('empty_portfolio').should('not.exist')
    cy.getByTestID('toggle_sorting_assets').should('not.exist')
  })

  it('should display highest value by default', function () {
    cy.sendDFItoWallet().wait(3000)
    // token transfer taking time sometime to avoid failure increasing wait time here
    cy.sendTokenToWallet(['ETH', 'LTC']).wait(7000)
    // dETH will be displayed at the top of the card on first topup
    cy.getByTestID('your_assets_dropdown_arrow').contains('From highest value')
    cy.get('[data-testid="card_balance_row_container"]').children().first().contains('dETH')
    cy.sendTokenToWallet(['LTC']).wait(7000)
    cy.get('[data-testid="card_balance_row_container"]').children().first().contains('dLTC')
  })
  it('should display lowest value on toggle', function () {
    cy.sendTokenToWallet(['ETH', 'LTC']).wait(7000)
    cy.getByTestID('toggle_sorting_assets').click()
    cy.wait(2000)
    cy.getByTestID('your_assets_dropdown_arrow').contains('From lowest value')
    cy.get('[data-testid="card_balance_row_container"]').children().first().contains('dETH')
  })
})

context('Wallet - Balances - Skeleton Loader', () => {
  beforeEach(function () {
    cy.createEmptyWallet()
  })

  it('should display skeleton loader when API has yet to return', () => {
    cy.intercept('**/address/**/tokens?size=*', {
      body: {
        data: [
          {}
        ]
      },
      delay: 3000
    })
    cy.getByTestID('details_dfi').click()
    cy.getByTestID('total_portfolio_skeleton_loader').should('exist')
    cy.getByTestID('dfi_balance_skeleton_loader').should('exist')
    cy.getByTestID('dfi_USD_balance_skeleton_loader').should('exist')
    cy.getByTestID('dfi_breakdown_row_skeleton_loader').should('exist')
    cy.getByTestID('balance_skeleton_loader').should('exist')
  })

  it('should not display skeleton loader when API has return', () => {
    cy.intercept('**/address/**/tokens?size=*').as('getTokens')
    cy.wait('@getTokens').then(() => {
      cy.getByTestID('total_portfolio_skeleton_loader').should('not.exist')
      cy.getByTestID('dfi_balance_skeleton_loader').should('not.exist')
      cy.getByTestID('dfi_USD_balance_skeleton_loader').should('not.exist')
      cy.getByTestID('dfi_breakdown_row_skeleton_loader').should('not.exist')
      cy.getByTestID('balance_skeleton_loader').should('not.exist')
    })
  })
})

context('Wallet - Balances - Token Breakdown', () => {
  const sampleVault = [
    {
      vaultId: '8ad217890f454de73c5eb095dbe9d9870a62840978970a4a5f38978d430dcfe5',
      loanScheme: {
        id: 'MIN150',
        minColRatio: '150',
        interestRate: '5'
      },
      ownerAddress: 'bcrt1qven45srx9hu0ksjxgymyjxc32zm4vufrufqsyg',
      state: 'ACTIVE',
      informativeRatio: '-1',
      collateralRatio: '-1',
      collateralValue: '347.3',
      loanValue: '0',
      interestValue: '0',
      collateralAmounts: [
        {
          id: '0',
          amount: '2.12300000',
          symbol: 'DFI',
          symbolKey: 'DFI',
          name: 'Default Defi token',
          displaySymbol: 'DFI',
          activePrice: {
            id: 'DFI-USD-1812',
            key: 'DFI-USD',
            isLive: true,
            block: {
              hash: '5dae3326b8256ee67918e95cc14428ec075f86bb3615438e77375a825fdcd378',
              height: 1812,
              medianTime: 1646996375,
              time: 1646996380
            },
            active: {
              amount: '100.00000000',
              weightage: 3,
              oracles: {
                active: 3,
                total: 3
              }
            },
            next: {
              amount: '100.00000000',
              weightage: 3,
              oracles: {
                active: 3,
                total: 3
              }
            },
            sort: '00000714'
          }
        },
        {
          id: '1',
          amount: '2.00000000',
          symbol: 'BTC',
          symbolKey: 'BTC',
          name: 'Playground BTC',
          displaySymbol: 'dBTC',
          activePrice: {
            id: 'BTC-USD-1812',
            key: 'BTC-USD',
            isLive: true,
            block: {
              hash: '5dae3326b8256ee67918e95cc14428ec075f86bb3615438e77375a825fdcd378',
              height: 1812,
              medianTime: 1646996375,
              time: 1646996380
            },
            active: {
              amount: '50.00000000',
              weightage: 3,
              oracles: {
                active: 3,
                total: 3
              }
            },
            next: {
              amount: '50.00000000',
              weightage: 3,
              oracles: {
                active: 3,
                total: 3
              }
            },
            sort: '00000714'
          }
        },
        {
          id: '2',
          amount: '5.00000000',
          symbol: 'ETH',
          symbolKey: 'ETH',
          name: 'Playground ETH',
          displaySymbol: 'dETH',
          activePrice: {
            id: 'ETH-USD-1812',
            key: 'ETH-USD',
            isLive: true,
            block: {
              hash: '5dae3326b8256ee67918e95cc14428ec075f86bb3615438e77375a825fdcd378',
              height: 1812,
              medianTime: 1646996375,
              time: 1646996380
            },
            active: {
              amount: '10.00000000',
              weightage: 3,
              oracles: {
                active: 3,
                total: 3
              }
            },
            next: {
              amount: '10.00000000',
              weightage: 3,
              oracles: {
                active: 3,
                total: 3
              }
            },
            sort: '00000714'
          }
        }
      ],
      loanAmounts: [],
      interestAmounts: []
    }
  ]

  function validateTokenBreakdown (token: string, availablePercentage: string, availableAmount: string, availableValue: string, lockedPercentage: string, lockedAmount: string, lockedValue: string): void {
    cy.getByTestID(`details_${token}`).click()
    cy.getByTestID(`${token}_available_percentage`).contains(availablePercentage)
    cy.getByTestID(`${token}_available_amount`).contains(availableAmount)
    cy.getByTestID(`${token}_available_value_amount`).invoke('text').then(text => {
      checkValueWithinRange(text, availableValue)
    })
    cy.getByTestID(`${token}_locked_percentage`).contains(lockedPercentage)
    cy.getByTestID(`${token}_locked_amount`).contains(lockedAmount)
    cy.getByTestID(`${token}_locked_value_amount`).invoke('text').then(text => {
      checkValueWithinRange(text, lockedValue)
    })
  }

  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['BTC', 'ETH']).wait(6000)
    cy.getByTestID('bottom_tab_balances').click()
  })

  it('should display DFI percentage breakdown', () => {
    cy.intercept('**/address/**/vaults?size=*', {
      statusCode: 200,
      body: {
        data: sampleVault
      }
    })
    validateTokenBreakdown('dfi', '90.40%', '20.00000000', '200000', '9.60%', '2.12300000', '21230')
    cy.getByTestID('dfi_utxo_amount').contains('10.00000000')
    cy.getByTestID('dfi_token_amount').contains('10.00000000')
  })

  it('should display BTC and ETH breakdown percentage and values', () => {
    cy.intercept('**/address/**/vaults?size=*', {
      statusCode: 200,
      body: {
        data: sampleVault
      }
    })
    validateTokenBreakdown('dBTC', '83.33%', '10', '100000', '16.67%', '2', '20000')
    validateTokenBreakdown('dETH', '66.67%', '10', '1000', '33.33%', '5', '500')
  })
})

context('Wallet - Balances - portfolio', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
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
    cy.sendDFItoWallet().wait(5000)
    cy.intercept('**/vaults?size=200', {
      statusCode: 200,
      body: {
        data: [{
          vaultId: 'vaultidhere',
          loanScheme: {
            id: 'MIN150',
            minColRatio: '150',
            interestRate: '5'
          },
          ownerAddress: 'bcrt1qjk6p9kc28wdj84c500lh2h5zlzf5ce3r8r0y92',
          state: 'ACTIVE',
          informativeRatio: '-1',
          collateralRatio: '100', // must be positive
          collateralValue: '0',
          loanValue: 10,
          interestValue: '0',
          collateralAmounts: [{
            id: '0',
            amount: '1.00000000',
            symbol: 'DFI',
            symbolKey: 'DFI',
            name: 'Default Defi token',
            displaySymbol: 'DFI',
            activePrice: {
              id: 'DFI-USD-906',
              key: 'DFI-USD',
              isLive: true,
              block: {
                hash: '9353d4b75886d68f0c9d788aee236c7c7e2722f0147dea98cde3a84719095e78',
                height: 906,
                medianTime: 1646660089,
                time: 1646660095
              },
              active: {
                amount: '100.00000000',
                weightage: 3,
                oracles: {
                  active: 3,
                  total: 3
                }
              },
              next: {
                amount: '100.00000000',
                weightage: 3,
                oracles: {
                  active: 3,
                  total: 3
                }
              },
              sort: '0000038a'
            }
          }
          ],
          loanAmounts: [],
          interestAmounts: []
        }]
      }
    }).as('getVaults')
  })

  it('should show portfolio breakdown', () => {
    cy.wait('@getVaults').then(() => {
      cy.getByTestID('toggle_portfolio').click()
      // subtract loan amount
      cy.getByTestID('total_usd_amount').invoke('text').then(text => {
        checkValueWithinRange(text, '100', 1)
      })
      cy.getByTestID('total_available_usd_amount').invoke('text').then(text => {
        checkValueWithinRange(text, '100', 1)
      })
      cy.getByTestID('total_locked_usd_amount').invoke('text').then(text => {
        checkValueWithinRange(text, '10', 1)
      })
      cy.getByTestID('outstanding_loans_amount').invoke('text').then(text => {
        checkValueWithinRange(text, '10', 1)
      })
    })
  })

  it('should hide portfolio breakdown on hide balance toggle', () => {
    cy.wait('@getVaults').then(() => {
      cy.getByTestID('toggle_balance').click()
      cy.getByTestID('toggle_portfolio').click()
      cy.getByTestID('total_usd_amount').should('have.text', '*****')
      cy.getByTestID('total_available_usd_amount').should('have.text', '*****')
      cy.getByTestID('total_locked_usd_amount').should('have.text', '*****')
      cy.getByTestID('outstanding_loans_amount').should('have.text', '*****')
    })
  })
})
