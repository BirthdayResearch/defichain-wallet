context('app/dex/swap', () => {
  before(function () {
    cy.createEmptyWallet(true)

    cy.getByTestID('bottom_tab_settings').click()
    cy.sendDFItoWallet().sendTokenToWallet(['ETH']).wait(4000)
    cy.getByTestID('playground_wallet_fetch_balances').click()

    cy.getByTestID('bottom_tab_liquidity').click().wait(100)
    cy.getByTestID('button_swap_DFI-ETH').click().wait(100)
  })

  it.skip('should display token balance', function () {
    cy.getByTestID('text_balance_tokenA').contains('0')
    cy.getByTestID('text_balance_tokenB').contains('10')
  })

  it('should be able to swap token between from/to', function () {
    cy.getByTestID('swap_button').click().wait(100)
    cy.getByTestID('text_balance_tokenA').contains('10')
    cy.getByTestID('text_balance_tokenB').contains('0')
  })

  /**
   * NOTES: these test cases must have new fresh playground defid to work
   * all numbers are based on default DFI-ETH price = 1 DFI -> 100 ETH dex price
   * the test is kind of fragile (very strict condition) to ensure it does display reserve values from defid and conversion done correctly
   * drop your your defid container image and restart if test fail when run locally
   */
  it('input "from" amount should be automatically input "to" + display summary', function () {
    cy.getByTestID('text_input_tokenA').invoke('attr', 'type', 'text').clear().type('8.34').trigger('change')
    cy.getByTestID('text_input_tokenB').invoke('val').should(val => expect(val).to.equals('0.0834'))
    cy.getByTestID('text_price_row_price_0').contains('100 ETH per DFI')
    cy.getByTestID('text_price_row_price_1').contains('0.01 DFI per ETH')
    cy.getByTestID('text_price_row_estimated_0').contains('0.0834') // calculated by aAmount * B/A price
    cy.getByTestID('text_price_row_minimum_0').contains('0.0834') // TextInput value for "to"
    cy.getByTestID('text_price_row_fee_0').contains('0.001') // hardcoded, not calculated by tx data volume
  })

  // Unable to trigger onChange into react-hook-form -> watch
  // it('input "to" amount should affect only "minimum to receive" value', function () {
  //   cy.getByTestID('text_input_tokenB').invoke('attr', 'type', 'text').type('7.9').trigger('change')
  //   cy.getByTestID('text_price_row_price_0').contains('100 ETH per DFI')
  //   cy.getByTestID('text_price_row_price_1').contains('0.01 DFI per ETH')
  //   cy.getByTestID('text_price_row_estimated_0').contains('8.34')
  //   cy.getByTestID('text_price_row_minimum_0').contains('7.9')
  //   cy.getByTestID('text_price_row_fee_0').contains('0.001') // hardcoded, not calculated by tx data volume
  // })

  it('should reject "to" amount greater than "from" amount', function () {
    cy.getByTestID('text_balance_tokenA').contains('10')
    cy.getByTestID('text_input_tokenA').invoke('attr', 'type', 'text').clear().type('8.34').trigger('change')
    // cy.getByTestID('button_submit').should('not.have.attr', 'disabled') // issue with cypress + rn touchableopacity
    cy.getByTestID('text_input_tokenB').invoke('attr', 'type', 'text').clear().type('8.341').trigger('change')
    cy.getByTestID('button_submit').should('have.attr', 'disabled')
  })

  it('should reject "from" amount greater than available balance', function () {
    cy.getByTestID('text_balance_tokenA').contains('10')
    cy.getByTestID('text_input_tokenA').invoke('attr', 'type', 'text').clear().type('10').trigger('change')
    // cy.getByTestID('button_submit').should('not.have.attr', 'disabled') // issue with cypress + rn touchableopacity
    cy.getByTestID('text_input_tokenA').invoke('attr', 'type', 'text').clear().type('10.000001').trigger('change')
    cy.getByTestID('button_submit').should('have.attr', 'disabled')
  })

  it('should be able to swap one token to another', function () {
    cy.getByTestID('text_input_tokenA').invoke('attr', 'type', 'text').clear().type('6.54321').trigger('change')
    cy.getByTestID('button_submit').click().wait(100)

    // redirected back to dex root page
    cy.getByTestID('liquidity_screen_list').should('exist')

    // wait for 1 block + update balance
    cy.wait(4000)
    cy.getByTestID('bottom_tab_settings').click().wait(100)
    cy.getByTestID('playground_wallet_fetch_balances').click().wait(100)
    cy.getByTestID('bottom_tab_balances').click().wait(100)

    // (conversion rate matched playground defualt, see L27)
    cy.getByTestID('balances_row_0').should('exist')
    cy.getByTestID('balances_row_0').contains('0.0654321') // received DFI
    cy.getByTestID('balances_row_2').should('exist')
    cy.getByTestID('balances_row_2_amount').contains('3.45679') // reduced ETH
  })
})
