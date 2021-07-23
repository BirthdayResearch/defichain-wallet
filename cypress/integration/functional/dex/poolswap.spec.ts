import BigNumber from 'bignumber.js'

context('poolswap without balance', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_balances').click()
  })

  it('should be able to validate empty form', function () {
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('button_swap_DFI-ETH').click()
    cy.getByTestID('button_submit').should('have.attr', 'disabled')
  })
})

context('poolswap with values', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_settings').click()
    cy.sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['ETH']).wait(10000)
    cy.getByTestID('playground_wallet_fetch_balances').click()
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('button_swap_DFI-ETH').click()
  })

  it('should be able to click swap button', function () {
    cy.getByTestID('text_balance_tokenA').contains('10.00000000 DFI')
    cy.getByTestID('text_balance_tokenB').contains('10.00000000 ETH')
    cy.getByTestID('swap_button').click().wait(7000)
    cy.getByTestID('text_balance_tokenB').contains('10.00000000 DFI')
    cy.getByTestID('text_balance_tokenA').contains('10.00000000 ETH')
  })

  it('should be able to validate form', function () {
    cy.getByTestID('swap_button').click().wait(7000)
    // Valid form
    cy.getByTestID('text_input_tokenA').type('1')
    cy.getByTestID('text_price_row_price_1').then(($txt: any) => {
      const tokenValue = $txt[0].textContent.replace(' ETH per DFI', '')
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
    cy.getByTestID('max_button_token_a').click().wait(3000)
    cy.getByTestID('text_input_tokenA').should('have.value', '10.00000000')
    cy.getByTestID('text_price_row_minimum_0').then(($txt: any) => {
      const tokenValue = $txt[0].textContent.replace(' ETH', '')
      cy.getByTestID('text_input_tokenB').should('have.value', new BigNumber(tokenValue).toFixed(8))
    })
  })

  it('should be able to swap', function () {
    cy.getByTestID('text_price_row_minimum_0').then(($txt: any) => {
      const tokenValue = $txt[0].textContent.replace(' ETH', '')
      cy.getByTestID('button_submit').click()
      cy.wait(5000).getByTestID('oceanInterface_close').click().wait(5000)
      cy.getByTestID('playground_wallet_fetch_balances').click()
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('balances_row_2').should('exist')
      cy.getByTestID('balances_row_2_amount').then(($txt: any) => {
        const balanceAmount = $txt[0].textContent
        expect(new BigNumber(balanceAmount).toNumber()).be.gte(new BigNumber(tokenValue).toNumber())
      })

      cy.getByTestID('bottom_tab_dex').click()
      cy.getByTestID('swap_button').click().wait(5000)
      cy.getByTestID('button_submit').click()
    })
  })
})
