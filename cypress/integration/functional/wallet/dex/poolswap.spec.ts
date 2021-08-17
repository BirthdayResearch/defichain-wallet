import BigNumber from 'bignumber.js'

context('Wallet - DEX - Pool Swap without balance', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_balances').click()
  })

  it('should be able to validate empty form', function () {
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('pool_pair_swap-horiz_DFI-LTC').click()
    cy.getByTestID('button_submit').should('have.attr', 'disabled')
  })
})

context('Wallet - DEX - Pool Swap with balance', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_settings').click()
    cy.sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['LTC']).wait(3000)
    cy.fetchWalletBalance()
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('pool_pair_swap-horiz_DFI-LTC').click()
  })

  it('should be able to click swap button', function () {
    cy.getByTestID('text_balance_tokenA').contains('10.00000000 DFI')
    cy.getByTestID('text_balance_tokenB').contains('10.00000000 LTC')
    cy.getByTestID('swap_button').click().wait(4000)
  })

  it('should be able to validate form', function () {
    cy.getByTestID('swap_button').click().wait(4000)
    // Valid form
    cy.getByTestID('text_input_tokenA').type('1')
    cy.getByTestID('text_price_row_estimated_0').then(($txt: any) => {
      const tokenValue = $txt[0].textContent.replace(' LTC', '').replace(',', '')
      cy.getByTestID('text_input_tokenB').should('have.value', new BigNumber(tokenValue).toFixed(8))
      cy.getByTestID('button_submit').should('not.have.attr', 'disabled')

      // Invalid tokenA - NaN, more than Max, zero
      cy.getByTestID('text_input_tokenA').clear().type('a')
      cy.getByTestID('text_input_tokenA').should('have.value', '0')
      cy.getByTestID('text_input_tokenB').should('have.value', new BigNumber(0).toFixed(8))
      cy.getByTestID('button_submit').should('have.attr', 'disabled')
      cy.getByTestID('text_input_tokenA').clear().type('15')
      cy.getByTestID('button_submit').should('have.attr', 'disabled')
      cy.getByTestID('text_input_tokenA').clear().type('0')
      cy.getByTestID('button_submit').should('have.attr', 'disabled')
    })
  })

  it('should be able to click max', function () {
    cy.getByTestID('MAX_amount_button').click().wait(3000)
    cy.getByTestID('text_input_tokenA').should('have.value', '10.00000000')
    cy.getByTestID('text_price_row_estimated_0').then(($txt: any) => {
      const tokenValue = $txt[0].textContent.replace(' LTC', '').replace(',', '')
      cy.getByTestID('text_input_tokenB').should('have.value', new BigNumber(tokenValue).toFixed(8))
    })
  })

  it('should be able to click half', function () {
    cy.getByTestID('50%_amount_button').click().wait(500)
    cy.getByTestID('text_input_tokenA').should('have.value', '5.00000000').wait(3000)
    cy.getByTestID('text_price_row_estimated_0').then(($txt: any) => {
      const tokenValue = $txt[0].textContent.replace(' LTC', '').replace(',', '')
      cy.getByTestID('text_input_tokenB').should('have.value', new BigNumber(tokenValue).toFixed(8))
    })
  })

  it('should be able to swap', function () {
    cy.getByTestID('text_price_row_estimated_0').then(($txt: any) => {
      const tokenValue = $txt[0].textContent.replace(' LTC', '').replace(',', '')
      cy.getByTestID('button_submit').click()
      cy.getByTestID('confirm_title').contains('YOU ARE SWAPPING')
      cy.getByTestID('button_confirm_swap').click().wait(3000)
      cy.closeOceanInterface()
      cy.fetchWalletBalance()
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('balances_row_4').should('exist')

      cy.getByTestID('balances_row_4_amount').then(($txt: any) => {
        const balanceAmount = $txt[0].textContent.replace(' LTC', '').replace(',', '')
        expect(new BigNumber(balanceAmount).toNumber()).be.gte(new BigNumber(tokenValue).toNumber())
      })
    })
  })
})

context.only('Wallet - DEX - Pool Swap failed api', () => {
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
    cy.getByTestID('pool_pair_row').should('not.exist')
  })
})
