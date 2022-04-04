import BigNumber from 'bignumber.js'

function setupWalletForConversion (): void {
  cy.createEmptyWallet(true)
  cy.sendDFItoWallet()
    .sendDFITokentoWallet()
    .sendTokenToWallet(['USDC'])
    .wait(5000)

  cy.getByTestID('bottom_tab_dex').click().wait(3000)
  cy.getByTestID('close_dex_guidelines').click()

  cy.getByTestID('bottom_tab_dex').click().wait(3000)
  cy.getByTestID('composite_swap').click().wait(3000)
  cy.getByTestID('token_select_button_FROM').should('exist').click()
  cy.wait(3000)
  cy.getByTestID('select_DFI').click().wait(1000)
  cy.getByTestID('token_select_button_TO').should('exist').click()
  cy.getByTestID('select_dLTC').click().wait(1000)
}

context('Wallet - DEX - Swap without balance', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('close_dex_guidelines').click()
  })

  it('should disable token selection on pool pair w/o balance', function () {
    cy.getByTestID('pool_pair_swap-horiz_dLTC-DFI').click()
    cy.getByTestID('token_select_button_FROM').should('have.attr', 'aria-disabled')
    cy.getByTestID('token_select_button_TO').should('have.attr', 'aria-disabled')
  })
})

context('Wallet - DEX - Composite Swap with disabled pool pairs', () => {
  before(function () {
    cy.intercept('**/poolpairs?size=*', {
      body: {
        data: [
          {
            id: '26',
            symbol: 'ZERO-DFI',
            displaySymbol: 'dZERO-DFI',
            name: 'Playground ZERO-Default Defi token',
            status: true,
            tokenA: {
              symbol: 'ZERO',
              displaySymbol: 'dZERO',
              id: '10',
              reserve: '0',
              blockCommission: '0'
            },
            tokenB: {
              symbol: 'DFI',
              displaySymbol: 'DFI',
              id: '0',
              reserve: '0',
              blockCommission: '0'
            },
            priceRatio: {
              ab: '0',
              ba: '0'
            },
            commission: '0',
            totalLiquidity: {
              token: '0',
              usd: '0'
            },
            tradeEnabled: false,
            ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
            rewardPct: '0.09090909',
            creation: {
              tx: '864a7b1900daa6a635e4b8ccfb263c708e5863aef85e81d6b82cbe9f82136a15',
              height: 149
            },
            apr: {
              reward: null,
              total: null
            }
          },
          {
            id: '28',
            symbol: 'OFF-DFI',
            displaySymbol: 'dOFF-DFI',
            name: 'Playground OFF-Default Defi token',
            status: false,
            tokenA: {
              symbol: 'OFF',
              displaySymbol: 'dOFF',
              id: '11',
              reserve: '0',
              blockCommission: '0'
            },
            tokenB: {
              symbol: 'DFI',
              displaySymbol: 'DFI',
              id: '0',
              reserve: '0',
              blockCommission: '0'
            },
            priceRatio: {
              ab: '0',
              ba: '0'
            },
            commission: '0',
            totalLiquidity: {
              token: '0',
              usd: '0'
            },
            tradeEnabled: false,
            ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
            rewardPct: '0.09090909',
            creation: {
              tx: '864a7b1900daa6a635e4b8ccfb263c708e5863aef85e81d6b82cbe9f82136a15',
              height: 149
            },
            apr: {
              reward: null,
              total: null
            }
          }
        ]
      }
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('close_dex_guidelines').click()
  })

  it('should disable pool swap button if pair is disabled on API', function () {
    cy.getByTestID('pool_pair_swap-horiz_dZERO-DFI').should('have.attr', 'aria-disabled') // tradeEnabled: false
    cy.getByTestID('pool_pair_swap-horiz_dOFF-DFI').should('have.attr', 'aria-disabled') // status: false
  })
})

context('Wallet - DEX - Composite Swap without balance', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['LTC']).wait(3000)
    cy.fetchWalletBalance()
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('close_dex_guidelines').click()
  })

  it('should disable token selection on pool pair w/o balance', function () {
    cy.getByTestID('pool_pair_swap-horiz_dLTC-DFI').click()
    cy.getByTestID('token_select_button_FROM').should('have.attr', 'aria-disabled')
    cy.getByTestID('token_select_button_TO').should('have.attr', 'aria-disabled')
  })
})

context('Wallet - DEX - Composite Swap with balance', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['LTC']).wait(3000)
    cy.fetchWalletBalance()
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('close_dex_guidelines').click()
  })

  it('should be able to choose tokens to swap', function () {
    cy.getByTestID('composite_swap').click()
    cy.wait(5000)
    cy.getByTestID('token_select_button_FROM').click()
    cy.getByTestID('select_DFI_value').should('have.text', '20.00000000')
    cy.getByTestID('select_DFI').click().wait(1000)

    cy.getByTestID('token_select_button_TO').click()
    cy.getByTestID('select_dLTC').should('exist')
    cy.getByTestID('select_DFI').should('not.exist')
    cy.getByTestID('select_dLTC').click()
  })

  it('should be able to validate form', function () {
    // Valid form
    cy.getByTestID('text_input_tokenA').type('1')
    cy.getByTestID('estimated_to_receive').then(($txt: any) => {
      const tokenValue = $txt[0].textContent.replace(' dLTC', '').replace(',', '')
      cy.getByTestID('text_input_tokenB').should('have.value', new BigNumber(tokenValue).toFixed(8))
      cy.getByTestID('button_confirm_submit').should('not.have.attr', 'disabled')

      // Invalid tokenA - NaN, more than Max, zero
      cy.getByTestID('text_input_tokenA_clear_button').click()
      cy.getByTestID('text_input_tokenA').type('a').blur().wait(100)
      cy.getByTestID('text_input_tokenA').should('have.value', '0')
      cy.getByTestID('text_input_tokenB').should('have.value', new BigNumber(0).toFixed(8))
      cy.getByTestID('button_confirm_submit').should('have.attr', 'aria-disabled')
      cy.getByTestID('text_input_tokenA_clear_button').click()
      cy.getByTestID('text_input_tokenA').type('15').blur().wait(500)
      cy.getByTestID('conversion_info_text').should('exist')
      cy.getByTestID('button_confirm_submit').should('not.have.attr', 'disabled')
      cy.getByTestID('text_input_tokenA_clear_button').click()
      cy.getByTestID('text_input_tokenA').type('0').blur().wait(100)
      cy.getByTestID('button_confirm_submit').should('have.attr', 'aria-disabled')
    })
  })

  it('should be able to click max', function () {
    cy.getByTestID('MAX_amount_button').click().wait(3000)
    cy.getByTestID('text_input_tokenA').should('have.value', '19.90000000')
    cy.getByTestID('estimated_to_receive').then(($txt: any) => {
      const tokenValue = $txt[0].textContent.replace(' dLTC', '').replace(',', '')
      cy.getByTestID('text_input_tokenB').should('have.value', new BigNumber(tokenValue).toFixed(8))
    })
  })

  it('should be able to click half', function () {
    cy.getByTestID('50%_amount_button').click().wait(500)
    cy.getByTestID('text_input_tokenA').should('have.value', '9.95000000').wait(3000)
    cy.getByTestID('estimated_to_receive').then(($txt: any) => {
      const tokenValue = $txt[0].textContent.replace(' dLTC', '').replace(',', '')
      cy.getByTestID('text_input_tokenB').should('have.value', new BigNumber(tokenValue).toFixed(8))
    })
  })

  it('should be able to use/validate custom slippage tolerance', function () {
    cy.getByTestID('text_input_tokenA').type('10')
    cy.getByTestID('slippage_1%').should('exist')

    // Slippage warning
    cy.getByTestID('slippage_Custom').click()
    cy.getByTestID('slippage_input').clear().type('21')
    cy.getByTestID('slippage_warning').should('exist')
    cy.getByTestID('slippage_input').clear().type('5')
    cy.getByTestID('slippage_warning').should('not.exist')

    // Slippage validation
    cy.getByTestID('slippage_Custom').click()
    cy.getByTestID('slippage_input').should('have.value', '5')
    cy.getByTestID('slippage_input').clear().type('101').blur().wait(100)
    cy.getByTestID('slippage_input_error').should('have.text', 'Slippage rate must range from 0-100%')
    cy.getByTestID('slippage_input').clear()
    cy.getByTestID('slippage_input_error').should('have.text', 'Required field is missing')
    cy.getByTestID('slippage_input').clear().type('-1').blur().wait(100)
    cy.getByTestID('slippage_input_error').should('have.text', 'Slippage rate must range from 0-100%')
    cy.getByTestID('slippage_input').clear().type('a1').blur().wait(100)
    cy.getByTestID('slippage_input_error').should('have.text', 'Slippage rate must range from 0-100%')
    cy.getByTestID('button_confirm_submit').should('have.attr', 'aria-disabled')

    cy.getByTestID('slippage_input').clear().type('25').blur().wait(100)
  })

  it('should be able to store selected slippage value in storage', () => {
    cy.url().should('include', 'app/DEX/CompositeSwap', () => {
      expect(localStorage.getItem('WALLET.SLIPPAGE_TOLERANCE')).to.eq('25')
    })
  })

  it('previously saved slippage tolerance value should be 25%', () => {
    cy.getByTestID('text_input_tokenA').type('10')
    cy.getByTestID('text_input_tokenA').type('20')
    cy.getByTestID('slippage_input').should('have.value', '25')
  })
})

context('Wallet - DEX - Composite Swap with balance Confirm Txn', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['LTC', 'USDC']).wait(5000)
    cy.fetchWalletBalance()
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('close_dex_guidelines').click()
  })

  it('should be able to swap tokens with 2 hops', function () {
    cy.getByTestID('composite_swap').click().wait(5000)
    cy.getByTestID('token_select_button_FROM').click()
    cy.getByTestID('select_dLTC').click().wait(100)
    cy.getByTestID('token_select_button_TO').click()
    cy.getByTestID('select_dUSDC').click().wait(100)
  })

  it('should be able to swap direct pair', function () {
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('token_select_button_FROM').click()
    cy.getByTestID('select_dLTC').click().wait(100)
    cy.getByTestID('token_select_button_TO').click()
    cy.getByTestID('select_DFI').click().wait(100)
  })

  afterEach(function () {
    it('should be able to switch tokens and reset values', function () {
      cy.getByTestID('MAX_amount_button').click()
      cy.getByTestID('switch_button').click()
      cy.getByTestID('text_input_tokenA').should('have.value', '')
      cy.getByTestID('text_input_tokenB').should('have.value', '')
    })

    it('should be able to swap', function () {
      cy.getByTestID('text_input_tokenA').type('10')
      cy.getByTestID('slippage_10%').click()
      cy.getByTestID('estimated_to_receive').then(($txt: any) => {
        const tokenValue = $txt[0].textContent.replace(' dLTC', '').replace(',', '')
        cy.getByTestID('button_confirm_submit').click()
        cy.getByTestID('slippage_fee').contains('10')
        cy.getByTestID('slippage_fee_suffix').contains('%')
        cy.getByTestID('confirm_title').contains('You are swapping')
        cy.getByTestID('button_confirm_swap').click().wait(3000)
        cy.closeOceanInterface()
        cy.fetchWalletBalance()
        cy.getByTestID('bottom_tab_balances').click()
        cy.getByTestID('balances_row_4').should('exist')

        cy.getByTestID('balances_row_4_amount').then(($txt: any) => {
          const balanceAmount = $txt[0].textContent.replace(' dLTC', '').replace(',', '')
          expect(new BigNumber(balanceAmount).toNumber()).be.gte(new BigNumber(tokenValue).toNumber())
        })
      })
    })

    it('should be able to swap correctly when user cancel a tx and updated some inputs', function () {
      cy.getByTestID('text_input_tokenA').type('1')
      cy.getByTestID('slippage_1%').click()
      cy.getByTestID('estimated_to_receive').then(($txt: any) => {
        $txt[0].textContent.replace(' dLTC', '').replace(',', '')
        cy.getByTestID('button_confirm_submit').click()
        cy.getByTestID('slippage_fee').contains('1')
        cy.getByTestID('slippage_fee_suffix').contains('%')
        cy.getByTestID('confirm_title').contains('You are swapping')
        cy.getByTestID('button_confirm_swap').click().wait(3000)
        // Cancel send on authorisation page
        cy.getByTestID('cancel_authorization').click()
        cy.getByTestID('button_cancel_swap').click()
        // Update input values
        cy.getByTestID('text_input_tokenA_clear_button').click()
        cy.getByTestID('text_input_tokenA').type('10')
        cy.getByTestID('slippage_10%').click()
        cy.getByTestID('estimated_to_receive').then(($txt: any) => {
          const updatedTokenValue = $txt[0].textContent.replace(' dLTC', '').replace(',', '')
          cy.getByTestID('button_confirm_submit').click()
          cy.getByTestID('slippage_fee').contains('10')
          cy.getByTestID('slippage_fee_suffix').contains('%')
          cy.getByTestID('confirm_title').contains('You are swapping')
          cy.getByTestID('button_confirm_swap').click().wait(3000)
          cy.closeOceanInterface()
          cy.fetchWalletBalance()
          cy.getByTestID('bottom_tab_balances').click()
          cy.getByTestID('balances_row_4').should('exist')

          cy.getByTestID('balances_row_4_amount').then(($txt: any) => {
            const balanceAmount = $txt[0].textContent.replace(' dLTC', '').replace(',', '')
            expect(new BigNumber(balanceAmount).toNumber()).be.gte(new BigNumber(updatedTokenValue).toNumber())
          })
        })
      })
    })
  })
})

context('Wallet - DEX - Pool Pair failed api', () => {
  before(function () {
    cy.createEmptyWallet(true)
  })

  it('should handle failed API calls', function () {
    cy.intercept('**/regtest/poolpairs**', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('close_dex_guidelines').click()
    cy.getByTestID('pool_pair_row').should('not.exist')
  })
})

context('Wallet - DEX - Composite Swap with Conversion', () => {
  beforeEach(function () {
    setupWalletForConversion()
  })

  it('should be able to display conversion info', function () {
    cy.getByTestID('text_balance_amount').contains('19.90000000')
    cy.getByTestID('text_input_tokenA').type('11.00000000')
    cy.getByTestID('conversion_info_text').should('exist')
    cy.getByTestID('conversion_info_text').should('contain', 'Conversion will be required. Your passcode will be asked to authorize both transactions.')
    cy.getByTestID('amount_to_convert_label').contains('UTXO to be converted')
    cy.getByTestID('amount_to_convert').contains('1.00000000')
    cy.getByTestID('transaction_details_hint_text').contains('Authorize transaction in the next screen to convert')
  })

  it('should trigger convert and swap token', function () {
    cy.getByTestID('text_input_tokenA').type('11.00000000')
    cy.getByTestID('button_confirm_submit').click().wait(3000)
    cy.getByTestID('txn_authorization_description')
      .contains(`Converting ${new BigNumber('1').toFixed(8)} UTXO to Token`)
    cy.closeOceanInterface().wait(3000)
    cy.getByTestID('conversion_tag').should('exist')

    cy.getByTestID('text_swap_amount').should('contain', '11.00000000')
    cy.getByTestID('button_confirm_swap').click().wait(3000)
    cy.closeOceanInterface()
  })
})
