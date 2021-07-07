context('wallet/balances/convert - accountToUtxos: invalid input', () => {
  before(function () {
    cy.createEmptyWallet(true)

    cy.getByTestID('bottom_tab_settings').click()
    cy.sendDFItoWallet()
      // .sendTokenToWallet(['DFI'])
      .wait(4000)
    cy.getByTestID('playground_wallet_fetch_balances').click()

    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('balances_row_0_utxo').should('exist')
    cy.getByTestID('balances_row_0_utxo_amount').contains(10)
  })
  it('amount = 0', function () {
    cy.getByTestID('balances_row_0').click()
    cy.getByTestID('convert_button').click()

    cy.getByTestID('text_to_value').should('contain', '0 UTXOS')
    cy.getByTestID('text_prev_value').should('contain', '10 UTXOS')
    cy.getByTestID('text_total_value').should('contain', '10 UTXOS')

    cy.getByTestID('button_continue_convert').should('not.be.enabled')
  })

  it('amount > balance', function () {
    cy.getByTestID('text_input_convert_from')
      .invoke('attr', 'type', 'text') // cypress issue with numeric/decimal input, must cast
      .type('11.1')

    cy.getByTestID('text_to_value').should('contain', '11.1')
    cy.getByTestID('button_continue_convert').should('not.be.enabled')
  })
})
