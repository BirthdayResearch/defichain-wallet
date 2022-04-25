import BigNumber from 'bignumber.js'

function createDFIWallet (): void {
  cy.createEmptyWallet(true)
  cy
    .sendDFItoWallet()
    .sendDFItoWallet()
    .sendDFITokentoWallet().wait(10000)

  cy.getByTestID('bottom_tab_balances').click()
  cy.getByTestID('balances_list').should('exist')
  cy.getByTestID('details_dfi').click()
  cy.getByTestID('dfi_token_amount').contains('10.00000000')
  cy.getByTestID('dfi_utxo_amount').contains('20.00000000')
  cy.getByTestID('convert_dfi_button').click()
}

context('Wallet - Convert DFI', () => {
  before(function () {
    createDFIWallet()
  })

  it('should have form validation', function () {
    cy.getByTestID('button_continue_convert').should('have.attr', 'aria-disabled')
    cy.getByTestID('source_balance').contains(19.9)
    cy.getByTestID('target_balance').contains(10)
    cy.getByTestID('text_input_convert_from_input_text').contains('How much UTXO to convert?')
    cy.getByTestID('text_input_convert_from_to_text').contains('After conversion, you will receive')
    cy.getByTestID('text_input_convert_from_input').type('1')
    cy.getByTestID('text_input_convert_from_input_clear_button').click()
    cy.getByTestID('button_continue_convert').should('have.attr', 'aria-disabled')
    cy.getByTestID('text_input_convert_from_input').type('1')
    cy.getByTestID('source_balance').contains(19.9)
    cy.getByTestID('target_balance').contains(11)
    cy.getByTestID('button_continue_convert').should('not.have.attr', 'disabled')
  })

  it('should swap conversion', function () {
    cy.getByTestID('button_convert_mode_toggle').click().wait(4000)
    cy.getByTestID('source_balance').contains(10)
    cy.getByTestID('target_balance').contains(21)
    cy.getByTestID('text_input_convert_from_input_text').contains('How much Token to convert?')
    cy.getByTestID('text_input_convert_from_to_text').contains('After conversion, you will receive')
    cy.getByTestID('button_continue_convert').should('not.have.attr', 'disabled')
  })

  it('should click tokens vs info screen', function () {
    cy.getByTestID('convert_screen').within(() => {
      cy.getByTestID('token_vs_utxo_info').click()
    })
    cy.getByTestID('token_vs_utxo_screen').should('exist')
    cy.go('back')
  })

  it('should test amount buttons when UTXO to account conversion', function () {
    cy.getByTestID('button_convert_mode_toggle').click().wait(4000)
    cy.getByTestID('50%_amount_button').click()
    cy.getByTestID('text_input_convert_from_input').should('have.value', '9.95000000')
    cy.getByTestID('target_balance').contains(19.95)
    cy.getByTestID('MAX_amount_button').click()
    cy.getByTestID('text_input_convert_from_input').should('have.value', '19.90000000')
    cy.getByTestID('target_balance').contains(29.9)
  })

  it('should display info on reserved UTXO when UTXO to account conversion', function () {
    cy.getByTestID('reserved_info_text').should('be.visible')
  })

  it('should test amount buttons when account to UTXO conversion', function () {
    cy.getByTestID('button_convert_mode_toggle').click().wait(4000)
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

    cy.getByTestID('confirm_title').contains('You are converting')
    cy.getByTestID('text_convert_amount').contains('1.00000000')
    cy.getByTestID('convert_amount_source_suffix').contains('Token')
    cy.getByTestID('convert_amount_target_suffix').contains('UTXO')
    cy.getByTestID('resulting_Token').contains('9.00000000')
    cy.getByTestID('resulting_Token_label').contains('Token')
    cy.getByTestID('resulting_UTXO').contains('21.00000000')
    cy.getByTestID('resulting_UTXO_label').contains('UTXO')
    cy.getByTestID('text_fee').should('exist')
    cy.getByTestID('button_cancel_convert').click()
  })

  it('should test UTXO to account conversion', function () {
    cy.getByTestID('button_convert_mode_toggle').click().wait(4000)
    cy.getByTestID('text_input_convert_from_input').clear().type('1')
    cy.getByTestID('button_continue_convert').click()
    cy.getByTestID('button_confirm_convert').should('not.have.attr', 'disabled')
    cy.getByTestID('button_cancel_convert').click()
    cy.getByTestID('text_input_convert_from_input').should('exist')

    cy.getByTestID('button_continue_convert').click()
    cy.getByTestID('text_convert_amount').contains('1.00000000')
    cy.getByTestID('convert_amount_source_suffix').contains('UTXO')
    cy.getByTestID('convert_amount_target_suffix').contains('Token')
    cy.getByTestID('resulting_UTXO').contains('18.90000000')
    cy.getByTestID('resulting_UTXO_label').contains('UTXO')
    cy.getByTestID('resulting_Token').contains('11.00000000')
    cy.getByTestID('resulting_Token_label').contains('Token')
    cy.getByTestID('text_fee').should('exist')
  })
})

context('Wallet - Convert UTXO to Account', function () {
  it('should test conversion of UTXO to account', function () {
    createDFIWallet()
    cy.getByTestID('text_input_convert_from_input').clear().type('1')
    cy.getByTestID('button_continue_convert').click()
    cy.getByTestID('button_confirm_convert').should('not.have.attr', 'disabled')
    cy.getByTestID('button_cancel_convert').click()
    cy.getByTestID('text_input_convert_from_input').should('exist')

    cy.getByTestID('button_continue_convert').click()

    cy.getByTestID('button_confirm_convert').click().wait(4000)
    cy.closeOceanInterface().wait(5000)

    cy.getByTestID('dfi_utxo_amount').contains('18.999') // 20 - 1 - fee
    cy.getByTestID('dfi_token_amount').contains('11')
  })

  it('should be able to convert correct amount when user cancel a tx and updated some inputs for UTXO to Account conversion', function () {
    const oldAmount = '1'
    const newAmount = '2'
    createDFIWallet()
    cy.getByTestID('text_input_convert_from_input').clear().type(oldAmount)
    cy.getByTestID('button_continue_convert').click()
    cy.getByTestID('button_confirm_convert').should('not.have.attr', 'disabled')
    cy.getByTestID('button_cancel_convert').click()
    cy.getByTestID('text_input_convert_from_input').should('exist').should('have.value', oldAmount)
    cy.getByTestID('button_continue_convert').click()
    cy.getByTestID('button_confirm_convert').click().wait(2000)
    // Check for authorization page description
    cy.getByTestID('txn_authorization_description')
      .contains(`Converting ${new BigNumber(oldAmount).toFixed(8)} UTXO to Token`)

    // Cancel send on authorisation page
    cy.getByTestID('cancel_authorization').click()
    cy.getByTestID('button_cancel_convert').click()
    // Update the input amount
    cy.getByTestID('text_input_convert_from_input').clear().type(newAmount)
    cy.getByTestID('button_continue_convert').click()
    // Confirm convert
    cy.getByTestID('button_confirm_convert').should('not.have.attr', 'disabled')
    cy.getByTestID('button_confirm_convert').click()
    // Check for authorization page description
    cy.getByTestID('txn_authorization_description')
      .contains(`Converting ${new BigNumber(newAmount).toFixed(8)} UTXO to Token`)
    cy.closeOceanInterface().wait(5000)

    cy.getByTestID('dfi_utxo_amount').contains('17.999') // 20 - 2 - fee
    cy.getByTestID('dfi_token_amount').contains('12')
  })
})

context('Wallet - Convert Account to UTXO', function () {
  it('should test conversion of account to UTXO', function () {
    createDFIWallet()
    cy.getByTestID('button_convert_mode_toggle').click().wait(4000)
    cy.getByTestID('text_input_convert_from_input').clear().type('1')
    cy.getByTestID('button_continue_convert').click()
    cy.getByTestID('button_confirm_convert').should('not.have.attr', 'disabled')
    cy.getByTestID('button_cancel_convert').click()
    cy.getByTestID('text_input_convert_from_input').should('exist')

    cy.getByTestID('button_continue_convert').click()

    cy.getByTestID('button_confirm_convert').click().wait(4000)
    cy.closeOceanInterface().wait(5000)

    cy.getByTestID('dfi_utxo_amount').contains('20.999')
    cy.getByTestID('dfi_token_amount').contains('9')
  })

  it('should be able to convert correct amount when user cancel a tx and updated some inputs for Account to UTXO conversion', function () {
    const oldAmount = '1'
    const newAmount = '2'
    createDFIWallet()
    cy.getByTestID('button_convert_mode_toggle').click().wait(4000)
    cy.getByTestID('text_input_convert_from_input').clear().type(oldAmount)
    cy.getByTestID('button_continue_convert').click()
    cy.getByTestID('button_confirm_convert').should('not.have.attr', 'disabled')
    cy.getByTestID('button_cancel_convert').click()
    cy.getByTestID('text_input_convert_from_input').should('exist')

    cy.getByTestID('button_continue_convert').click()

    cy.getByTestID('button_confirm_convert').click().wait(2000)
    // Check for authorization page description
    cy.getByTestID('txn_authorization_description')
      .contains(`Converting ${new BigNumber(oldAmount).toFixed(8)} Token to UTXO`)
    // Cancel send on authorisation page
    cy.getByTestID('cancel_authorization').click()
    cy.getByTestID('button_cancel_convert').click()
    // Update the input amount
    cy.getByTestID('text_input_convert_from_input').clear().type(newAmount)
    cy.getByTestID('button_continue_convert').click()
    // Confirm convert
    cy.getByTestID('button_confirm_convert').should('not.have.attr', 'disabled')
    cy.getByTestID('button_confirm_convert').click()
    // Check for authorization page description
    cy.getByTestID('txn_authorization_description')
      .contains(`Converting ${new BigNumber(newAmount).toFixed(8)} Token to UTXO`)
    cy.closeOceanInterface().wait(5000)

    cy.getByTestID('dfi_utxo_amount').contains('21.999') // 20 + 2 - fee
    cy.getByTestID('dfi_token_amount').contains('8')
  })
})
