context('wallet/balances/convert - bi-direction success case', () => {
  before(function () {
    cy.createEmptyWallet(true)

    cy.getByTestID('bottom_tab_settings').click()
    cy.sendDFItoWallet().wait(4000)
    cy.getByTestID('playground_wallet_fetch_balances').click()

    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('balances_row_0_utxo').should('exist')
    cy.getByTestID('balances_row_0_utxo_amount').contains(10)
  })

  it('utxosToToken: default start with 0', function () {
    cy.getByTestID('balances_row_0_utxo').click()
    cy.getByTestID('convert_button').click()

    cy.getByTestID('text_row_output_to_rhs').should('contain', '0 Token')
    cy.getByTestID('text_row_output_bal_rhs').should('contain', '0 Token')
    cy.getByTestID('text_row_output_total_rhs').should('contain', '0 Token')

    cy.getByTestID('button_continue_convert').should('not.be.enabled')
  })

  it('utxosToToken: should build summary correctly', function () {
    // https://github.com/cypress-io/cypress/issues/1171#issuecomment-364059485
    cy.getByTestID('text_input_convert_from')
      .invoke('attr', 'type', 'text') // cypress issue with numeric/decimal input, must cast
      .type('1.23')

    cy.getByTestID('text_row_output_to_rhs').should('contain', '1.23 Token')
    cy.getByTestID('text_row_output_bal_rhs').should('contain', '0 Token')
    cy.getByTestID('text_row_output_total_rhs').should('contain', '1.23 Token')
    cy.getByTestID('button_continue_convert').should('not.be.disabled')
  })

  it('utxosToToken: should be able to convert successfully', function () {
    cy.intercept('/v0/playground/transactions/send').as('sendRaw')
    cy.getByTestID('button_continue_convert').click()

    // check UI redirected (balances root)
    cy.getByTestID('balances_list').should('exist')

    // // result check
    // // wait for one block
    cy.wait(4000)

    // // refresh balance
    cy.getByTestID('bottom_tab_settings').click()
    cy.getByTestID('playground_wallet_fetch_balances').click()
    cy.getByTestID('bottom_tab_balances').click()

    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('balances_row_0_utxo').should('exist')
    cy.getByTestID('balances_row_0_utxo_amount').contains('8.769') // fee deducted, balance should be 8.77 - 0.0...1
    cy.getByTestID('balances_row_0').should('exist')
    cy.getByTestID('balances_row_0_amount').contains(1.23)
  })

  it('tokenToUtxos: default start with 0', function () {
    cy.getByTestID('balances_row_0').click()
    cy.getByTestID('convert_button').click()

    cy.getByTestID('text_row_output_to_rhs').should('contain', '0 UTXOS')
    // action balance can be 8.769xxxxx UTXOS, must split into 2 assertions
    cy.getByTestID('text_row_output_bal_rhs').should('contain', '8.769').should('contain', 'UTXOS')
    cy.getByTestID('text_row_output_total_rhs').should('contain', '8.769').should('contain', 'UTXOS')
    cy.getByTestID('button_continue_convert').should('not.be.enabled')
  })

  it('tokenToUtxos: should build summary correctly', function () {
    cy.getByTestID('text_input_convert_from')
      .invoke('attr', 'type', 'text') // cypress issue with numeric/decimal input, must cast
      .type('0.4')

    cy.getByTestID('text_row_output_to_rhs').should('contain', '0.4 UTXOS')
    cy.getByTestID('text_row_output_bal_rhs').should('contain', '8.769').should('contain', 'UTXOS')
    cy.getByTestID('text_row_output_total_rhs').should('contain', '9.169').should('contain', 'UTXOS')
    cy.getByTestID('button_continue_convert').should('not.be.disabled')
  })

  it('tokenToUtxos: should be able to convert successfully', function () {
    cy.intercept('/v0/playground/transactions/send').as('sendRaw')
    cy.getByTestID('button_continue_convert').click()

    // check UI redirected (balances root)
    cy.getByTestID('balances_list').should('exist')

    // // result check
    // // wait for one block
    cy.wait(3100)

    // // refresh balance
    cy.getByTestID('bottom_tab_settings').click()
    cy.getByTestID('playground_wallet_fetch_balances').click()
    cy.getByTestID('bottom_tab_balances').click()

    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('balances_row_0_utxo').should('exist')
    cy.getByTestID('balances_row_0_utxo_amount').contains('9.169') // fee deducted, balance should be 9.17 - 0.0...1
    cy.getByTestID('balances_row_0').should('exist')
    cy.getByTestID('balances_row_0_amount').contains('0.83')
  })
})
