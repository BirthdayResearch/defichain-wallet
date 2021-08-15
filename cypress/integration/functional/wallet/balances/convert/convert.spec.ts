context('Wallet - Convert DFI', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy
      .sendDFItoWallet()
      .sendDFItoWallet()
      .sendDFITokentoWallet().wait(10000)

    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('balances_row_0').should('exist')
    cy.getByTestID('balances_row_0_amount').contains(10)
    cy.getByTestID('balances_row_0_utxo_amount').contains(20)
    cy.getByTestID('balances_row_0_utxo').click()
    cy.getByTestID('convert_button').click()
  })

  it('should have form validation', function () {
    cy.getByTestID('button_continue_convert').should('have.attr', 'disabled')
    cy.getByTestID('source_balance').contains(20)
    cy.getByTestID('target_balance').contains(10)
    cy.getByTestID('text_input_convert_from_input_text').contains('CONVERT UTXO')
    cy.getByTestID('text_input_convert_from_to_text').contains('TO TOKEN')
    cy.getByTestID('text_input_convert_from_input').type('1')
    cy.getByTestID('source_balance').contains(20)
    cy.getByTestID('target_balance').contains(11)
  })

  it('should swap conversion', function () {
    cy.getByTestID('button_convert_mode_toggle').click().wait(4000)
    cy.getByTestID('source_balance').contains(10)
    cy.getByTestID('target_balance').contains(21)
    cy.getByTestID('text_input_convert_from_input_text').contains('CONVERT TOKEN')
    cy.getByTestID('text_input_convert_from_to_text').contains('TO UTXO')
    cy.getByTestID('button_continue_convert').should('not.have.attr', 'disabled')
  })

  it('should click tokens vs info screen', function () {
    cy.getByTestID('token_vs_utxo_info').click()
    cy.getByTestID('token_vs_utxo_screen').should('exist')
    cy.go('back')
  })

  it('should test amount buttons', function () {
    cy.getByTestID('50%_amount_button').click()
    cy.getByTestID('text_input_convert_from_input').should('have.value', '5.00000000')
    cy.getByTestID('target_balance').contains(25)
    cy.getByTestID('MAX_amount_button').click()
    cy.getByTestID('text_input_convert_from_input').should('have.value', '10.00000000')
    cy.getByTestID('target_balance').contains(30)
  })

  it('should test account to UTXO conversion', function () {
    cy.getByTestID('text_input_convert_from_input').clear().type('1').blur()
    cy.getByTestID('button_continue_convert').click()
    cy.getByTestID('button_confirm_convert').should('not.have.attr', 'disabled')
    cy.getByTestID('button_cancel_convert').click()
    cy.getByTestID('text_input_convert_from_input').should('exist')

    cy.getByTestID('button_continue_convert').click()

    cy.getByTestID('confirm_title').contains('YOU ARE CONVERTING')
    cy.getByTestID('text_convert_amount').contains('1.00000000 DFI (Token)')
    cy.getByTestID('source_amount').contains('9.00000000')
    cy.getByTestID('source_amount_unit').contains('Token')
    cy.getByTestID('target_amount').contains('21.00000000')
    cy.getByTestID('target_amount_unit').contains('UTXO')
    cy.getByTestID('text_fee').should('exist')
    cy.go('back')
  })

  it('should test UTXO to account conversion', function () {
    cy.getByTestID('button_convert_mode_toggle').click().wait(4000)
    cy.getByTestID('text_input_convert_from_input').clear().type('1')
    cy.getByTestID('button_continue_convert').click()
    cy.getByTestID('button_confirm_convert').should('not.have.attr', 'disabled')
    cy.getByTestID('button_cancel_convert').click()
    cy.getByTestID('text_input_convert_from_input').should('exist')

    cy.getByTestID('button_continue_convert').click()
    cy.getByTestID('text_convert_amount').contains('1.00000000 DFI (UTXO)')
    cy.getByTestID('source_amount').contains('19.00000000')
    cy.getByTestID('source_amount_unit').contains('UTXO')
    cy.getByTestID('target_amount').contains('11.00000000')
    cy.getByTestID('target_amount_unit').contains('Token')
    cy.getByTestID('text_fee').should('exist')

    cy.getByTestID('button_confirm_convert').click().wait(4000)
    cy.closeOceanInterface()

    cy.getByTestID('balances_row_0_utxo_amount').contains('18.999') // 20 - 1 - fee
    cy.getByTestID('balances_row_0_amount').contains('11')
  })
})
