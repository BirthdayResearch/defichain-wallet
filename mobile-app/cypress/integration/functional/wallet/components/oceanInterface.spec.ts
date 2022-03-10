context('Wallet - Ocean Interface', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet()
      .sendDFITokentoWallet().wait(3000)
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('details_DFI').click()
    cy.getByTestID('convert_dfi_button').click()
  })

  it('should able to convert page', function () {
    cy.getByTestID('text_input_convert_from_input').clear().type('1').blur()
    cy.getByTestID('button_continue_convert').click()
    cy.getByTestID('button_confirm_convert').click()
    cy.getByTestID('pin_authorize').type('000000').wait(5000)
  })

  it('should be able to redirect to explorer', function () {
    cy.getByTestID('oceanNetwork_explorer').click()
  })
})
