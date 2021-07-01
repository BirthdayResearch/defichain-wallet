context('wallet/balances', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().wait(4000)
    cy.getByTestID('playground_wallet_fetch_balances').click()
    cy.getByTestID('bottom_tab_balances').click()

    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('balances_row_0_utxo').should('exist')
    cy.getByTestID('balances_row_0_utxo_amount').contains(10)
  })

  it('default start with 0, button disabled', function () {
    cy.getByTestID('button_TO_DFC').click()

    cy.getByTestID('text_row_output_to_rhs').invoke('text').should(text => text === '0 UTXOS')
    cy.getByTestID('text_row_output_bal_rhs').invoke('text').should(text => text === '10 UTXOS')
    cy.getByTestID('text_row_output_total_rhs').invoke('text').should(text => text === '10 UTXOS')
    // cy.getByTestID('button_continue').should('be.disabled')
    // cy.getByTestID('output_bal')
    // cy.getByTestID('output_total')
    // cy.getByTestID('text_input_convert_from').type('1.23').wait(50)
  })

  it('default start with 0, button disabled', function () {
    // cy.getByTestID('output_bal')
    // cy.getByTestID('output_total')
    // cy.getByTestID('text_input_convert_from').type('1.23').wait(50)
  })
})
