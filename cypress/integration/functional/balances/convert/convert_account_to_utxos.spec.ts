context('wallet/balances/convert - accountToUtxos: invalid input', () => {
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
  it('amount = 0', function () {
    cy.getByTestID('button_TO_UTXOS').click()

    cy.getByTestID('text_row_output_to_rhs').should('contain', '0 UTXOS')
    cy.getByTestID('text_row_output_bal_rhs').should('contain', '10 UTXOS')
    cy.getByTestID('text_row_output_total_rhs').should('contain', '10 UTXOS')

    cy.getByTestID('button_continue_convert').should('not.be.enabled')
  })

  it('amount > balance', function () {
    cy.getByTestID('text_input_convert_from')
      .invoke('attr', 'type', 'text') // cypress issue with numeric/decimal input, must cast
      .type('11.1')

    cy.getByTestID('text_row_output_to_rhs').should('contain', '11.1')
    cy.getByTestID('button_continue_convert').should('not.be.enabled')
  })
})
