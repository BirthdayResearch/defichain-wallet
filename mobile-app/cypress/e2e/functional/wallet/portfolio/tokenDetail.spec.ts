function verifyPoolSwapComponents (): void {
  cy.getByTestID('swap_button').should('exist')
  cy.getByTestID('swap_button').click()
  cy.url().should('include', 'app/CompositeSwap')
  cy.getByTestID('token_select_button_FROM').should('have.attr', 'aria-disabled')
  cy.getByTestID('token_select_button_TO').should('not.have.attr', 'aria-disabled')
  cy.getByTestID('token_select_button_FROM').should('contain', 'dBTC')
  cy.getByTestID('token_select_button_TO').should('contain', 'Select token')
}

function verifyCryptoTokenComponentState (): void {
  cy.getByTestID('send_button').should('exist')
  cy.getByTestID('receive_button').should('exist')
  cy.getByTestID('convert_button').should('not.exist')
  cy.getByTestID('swap_button').should('exist')
  cy.getByTestID('add_liquidity_button').should('exist')
  cy.getByTestID('remove_liquidity_button').should('not.exist')
}

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

context('Wallet - Token Detail', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(['BTC'])
      .wait(10000)
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('portfolio_list').should('exist')
    cy.getByTestID('portfolio_row_1').should('exist')
    cy.getByTestID('portfolio_row_1_amount').contains(10)
    cy.getByTestID('portfolio_row_1').click()
    cy.wait(3000)
  })

  it('should be able to click token BTC', function () {
    cy.getByTestID('token_detail_amount').contains(10)
    cy.getByTestID('token_detail_usd_amount').contains(10)

    cy.getByTestID('dfi_utxo_amount').should('not.exist')
    cy.getByTestID('dfi_token_amount').should('not.exist')
    verifyCryptoTokenComponentState()
  })

  it('should be able to redirect to Add Liquidity screen', function () {
    cy.getByTestID('add_liquidity_button').click()
    cy.getByTestID('token_input_primary').clear().type('5')
    cy.getByTestID('button_confirm_continue_add_liq').click()

    /* Redirect back from Confirm Add Liquidity screen */
    cy.go('back')
    /* Redirect back from Add Liquidity screen */
    cy.go('back')
    cy.url().should('include', 'app/Balance')
  })

  it('should be able to redirect to Pool Swap screen', function () {
    verifyPoolSwapComponents()
  })
})

context('Wallet - Token Detail - Cypto - Locked in vaults & Available', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(['BTC'])
      .wait(10000)
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('portfolio_list').should('exist')
    cy.getByTestID('portfolio_row_1').should('exist')
    cy.getByTestID('portfolio_row_1_amount').contains(10)
    cy.getByTestID('portfolio_row_1').click()
  })

  it('should be able to click token BTC', function () {
    cy.intercept('**/address/**/vaults?size=*', {
      statusCode: 200,
      body: {
        data: sampleVault
      }
    }).wait(3000)
    cy.getByTestID('token_detail_amount').contains(10)
    cy.getByTestID('token_detail_usd_amount').contains(10)

    cy.getByTestID('BTC_locked_amount').contains(2)
    cy.getByTestID('BTC_locked_value_amount').contains(20)

    cy.getByTestID('dfi_utxo_amount').should('not.exist')
    cy.getByTestID('dfi_token_amount').should('not.exist')
    verifyCryptoTokenComponentState()
  })

  it('should be able to redirect to Add Liquidity screen', function () {
    cy.getByTestID('add_liquidity_button').click()
    cy.getByTestID('token_input_primary').clear().type('5')
    cy.getByTestID('button_confirm_continue_add_liq').click()

    /* Redirect back from Confirm Add Liquidity screen */
    cy.go('back')
    /* Redirect back from Add Liquidity screen */
    cy.go('back')
    cy.url().should('include', 'app/Balance')
  })

  it('should be able to redirect to Pool Swap screen', function () {
    verifyPoolSwapComponents()
  })
})

context('Wallet - Token Detail - LP', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(['ETH-DFI', 'ETH'])
      .wait(10000)
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('portfolio_list').should('exist')
    cy.getByTestID('portfolio_row_18').should('exist')
    cy.getByTestID('portfolio_row_18_amount').contains(10)
    cy.getByTestID('portfolio_row_18').click()
  })

  it('should be able to click token ETH-DFI', function () {
    cy.getByTestID('token_detail_amount').should('not.exist')
    cy.getByTestID('token_detail_usd_amount').should('not.exist')

    cy.getByTestID('your_lp_pool_ETH-DFI_amount').contains('10')
    cy.getByTestID('your_lp_pool_ETH-DFI_usd_amount').contains('20')

    cy.getByTestID('tokens_in_ETH-DFI_dETH_amount').contains('100')
    cy.getByTestID('tokens_in_ETH-DFI_dETH_usd_amount').contains('10')

    cy.getByTestID('tokens_in_ETH-DFI_DFI_amount').contains('1')
    cy.getByTestID('tokens_in_ETH-DFI_DFI_usd_amount').contains('10')

    cy.getByTestID('dfi_utxo_amount').should('not.exist')
    cy.getByTestID('dfi_token_amount').should('not.exist')

    cy.getByTestID('dfi_learn_more').should('not.exist')
    cy.getByTestID('send_button').should('exist')
    cy.getByTestID('receive_button').should('exist')
    cy.getByTestID('remove_liquidity_button').should('exist')
    cy.getByTestID('add_liquidity_button').should('exist')
    cy.getByTestID('convert_button').should('not.exist')
    cy.getByTestID('swap_button').should('not.exist')
  })

  it('should be able to redirect to Add Liquidity screen', function () {
    cy.getByTestID('add_liquidity_button').should('exist')
    cy.getByTestID('add_liquidity_button').click()
    cy.getByTestID('token_input_primary').clear().type('5')
    cy.getByTestID('button_confirm_continue_add_liq').click()

    /* Redirect back from Confirm Add Liquidity screen */
    cy.go('back')
    /* Redirect back from Add Liquidity screen */
    cy.go('back')
    cy.url().should('include', 'app/Balance')
  })

  it('should be able to redirect to Remove Liquidity screen', function () {
    cy.getByTestID('remove_liquidity_button').should('exist')
    cy.getByTestID('remove_liquidity_button').click()
    cy.getByTestID('tokens_remove_amount_input').clear().type('10')
    cy.getByTestID('button_continue_remove_liq').click()

    /* Redirect back from ConfirmRemove Liquidity screen */
    cy.go('back')
    /* Redirect back from Remove Liquidity screen */
    cy.go('back')
    cy.url().should('include', 'app/Balance')
  })
})

context('Wallet - Token Detail Defiscan redirection', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
  })

  it('should able to redirect to defiscan for BTC', function () {
    cy.sendTokenToWallet(['BTC']).wait(10000)
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('portfolio_list').should('exist')
    cy.getByTestID('portfolio_row_1').should('exist')
    cy.getByTestID('portfolio_row_1_amount').contains(10)
    cy.getByTestID('portfolio_row_1').click().wait(3000)
    cy.getByTestID('token_detail_explorer_url').should('exist')
  })
})

context('Wallet - Token Detail - DFI - UTXO and Token', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .wait(10000)
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('portfolio_list').should('exist')
    cy.getByTestID('dfi_total_balance_amount').should('exist').contains('20.00000000')
    cy.getByTestID('dfi_balance_card').should('exist').click()
  })

  it('should be able to click token DFI', function () {
    cy.getByTestID('dfi_utxo_amount').contains(10)
    cy.getByTestID('dfi_token_amount').contains(10)

    cy.getByTestID('dfi_utxo_percentage').contains('50.00%')
    cy.getByTestID('dfi_token_percentage').contains('50.00%')

    cy.getByTestID('dfi_learn_more').should('exist')
    cy.getByTestID('send_button').should('exist')
    cy.getByTestID('receive_button').should('exist')
    cy.getByTestID('convert_button').should('exist')
    cy.getByTestID('swap_button_dfi').should('exist')
    cy.getByTestID('swap_button').should('not.exist')
    cy.getByTestID('add_liquidity_button').should('not.exist')
    cy.getByTestID('remove_liquidity_button').should('not.exist')
  })

  it('should be able to redirect with Swap', function () {
    cy.getByTestID('swap_button_dfi').should('exist')
    cy.getByTestID('swap_button_dfi').click()
    cy.url().should('include', 'app/CompositeSwap')
    cy.getByTestID('token_select_button_FROM').should('have.attr', 'aria-disabled')
    cy.getByTestID('token_select_button_TO').should('not.have.attr', 'aria-disabled')
    cy.getByTestID('token_select_button_FROM').should('contain', 'DFI')
    cy.getByTestID('token_select_button_TO').should('contain', 'Select token')
  })
})

context('Wallet - Token Detail - DFI - with collateral, UTXO and Token', () => {
  function validateLockedToken (token: string, lockedAmount: string): void {
    cy.getByTestID(`${token}_locked_amount`).contains(lockedAmount)
  }
  function validateAvailableToken (token: string, availAmt: string): void {
    cy.getByTestID(`${token}_available_amount`).contains(availAmt)
  }
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.sendDFItoWallet()
      .sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(['BTC', 'ETH']).wait(6000)
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('portfolio_list').should('exist')
    cy.getByTestID('dfi_total_balance_amount').should('exist').contains('30.00000000')
    cy.getByTestID('dfi_balance_card').should('exist').click()
  })

  it('should be able to click on DFI token', function () {
    cy.intercept('**/address/**/vaults?size=*', {
      statusCode: 200,
      body: {
        data: sampleVault
      }
    }).wait(3000)
    validateLockedToken('DFI', '2.12300000')
    validateAvailableToken('DFI', '30')
    cy.getByTestID('dfi_utxo_percentage').contains('66.66%')
    cy.getByTestID('dfi_token_percentage').contains('33.33%')
    cy.getByTestID('dfi_utxo_amount').contains('20.00000000')
    cy.getByTestID('dfi_token_amount').contains('10.00000000')
    cy.getByTestID('total_dfi_label_symbol').contains('DFI')
    cy.getByTestID('total_dfi_label_name').contains('DeFiChain')

    cy.getByTestID('dfi_learn_more').should('exist')
    cy.getByTestID('send_button').should('exist')
    cy.getByTestID('receive_button').should('exist')
    cy.getByTestID('convert_button').should('exist')
    cy.getByTestID('swap_button_dfi').should('exist')
    cy.getByTestID('swap_button').should('not.exist')
    cy.getByTestID('add_liquidity_button').should('not.exist')
    cy.getByTestID('remove_liquidity_button').should('not.exist')
  })
  it('should be able to redirect with Swap', function () {
    cy.getByTestID('swap_button_dfi').should('exist')
    cy.getByTestID('swap_button_dfi').click()
    cy.url().should('include', 'app/CompositeSwap')
    cy.getByTestID('token_select_button_FROM').should('have.attr', 'aria-disabled')
    cy.getByTestID('token_select_button_TO').should('not.have.attr', 'aria-disabled')
    cy.getByTestID('token_select_button_FROM').should('contain', 'DFI')
    cy.getByTestID('token_select_button_TO').should('contain', 'Select token')
  })
})

context('Wallet - Token Detail - Failed API', () => {
  beforeEach(function () {
    cy.intercept('**/regtest/address/**', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.createEmptyWallet(true)
  })

  it('should not display any value when API failed', function () {
    cy.getByTestID('dfi_balance_card').should('exist').click()
    cy.getByTestID('dfi_balance_skeleton_loader').should('exist')
    cy.getByTestID('dfi_USD_balance_skeleton_loader').should('exist')
  })
})
