context('Wallet - Convert DFI - utxosToAccount', () => {
  before(function () {
    cy.createEmptyWallet(true)

    cy.getByTestID('bottom_tab_settings').click()
    cy.sendDFItoWallet().wait(4000)

    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('balances_row_0_utxo').should('exist')
    cy.getByTestID('balances_row_0_utxo_amount').contains(10)
  })
  it('navigate through DFI UTXOS token detail page', function () {
    cy.getByTestID('balances_row_0_utxo').click()
    cy.getByTestID('convert_button').click()

    cy.getByTestID('text_preview_input_desc').contains('DFI (UTXO)')
    cy.getByTestID('text_preview_output_desc').contains('DFI (TOKEN)')

    cy.getByTestID('button_continue_convert').should('have.attr', 'disabled')
  })

  it('navigate through token detail', function () {
    cy.getByTestID('text_input_convert_from_input')
      .invoke('attr', 'type', 'text') // cypress issue with numeric/decimal input, must cast
      .type('11.1').blur()

    cy.getByTestID('text_preview_input_value').contains('0 DFI')
    cy.getByTestID('text_preview_output_value').contains('11.1 DFI')

    cy.getByTestID('button_continue_convert').should('have.attr', 'disabled')
  })

  it('should insert balance as amount on 50% pressed', function () {
    cy.getByTestID('50%_amount_button').click()

    cy.getByTestID('text_preview_input_value').contains('5 DFI')
    cy.getByTestID('text_preview_output_value').contains('5 DFI')
    cy.getByTestID('button_continue_convert').should('not.have.attr', 'disabled')
  })

  it('should insert balance as amount on MAX pressed', function () {
    cy.getByTestID('MAX_amount_button').click()

    cy.getByTestID('text_preview_input_value').contains('0 DFI')
    cy.getByTestID('text_preview_output_value').contains('10 DFI')
    cy.getByTestID('button_continue_convert').should('not.have.attr', 'disabled')
  })

  it('should be able to toggle into "accountToUtxos" mode', function () {
    cy.getByTestID('button_convert_mode_toggle').click()
    cy.getByTestID('text_preview_input_desc').contains('DFI (TOKEN)')
    cy.getByTestID('text_preview_output_desc').contains('DFI (UTXO)')
  })

  it('should be able to render token vs utxo screen', function () {
    cy.getByTestID('token_vs_utxo_info').click()
    cy.getByTestID('token_vs_utxo_screen').should('exist')
  })
})
