context('Wallet - Ocean Interface', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet()
      .sendDFITokentoWallet().wait(3000)
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('dfi_total_balance_amount').contains('20.00000000')
    cy.getByTestID('dfi_balance_card').click()
    cy.getByTestID('convert_button').click()
    cy.getByTestID('button_convert_mode_toggle').click()
  })

  it('should able to convert page', function () {
    cy.getByTestID('convert_input').clear().type('1').blur()
    cy.getByTestID('button_continue_convert').click()
    cy.getByTestID('button_confirm_convert').click()
    cy.getByTestID('pin_authorize').type('000000').wait(5000)
  })

  it('should be able to redirect to explorer', function () {
    cy.getByTestID('oceanNetwork_explorer').click()
  })
})
