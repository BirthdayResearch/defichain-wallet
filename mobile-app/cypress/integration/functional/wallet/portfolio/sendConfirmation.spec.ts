context('Wallet - Send Preview/Confirmation', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendTokenToWallet(['BTC']).wait(4000)
    cy.getByTestID('bottom_tab_balances').click()

    cy.getByTestID('balances_row_1').click()
    cy.getByTestID('send_button').click()
    cy.getByTestID('address_input').clear().type('bcrt1q8rfsfny80jx78cmk4rsa069e2ckp6rn83u6ut9')
    cy.getByTestID('amount_input').clear().type('1.234')
    cy.getByTestID('button_confirm_send_continue').click()
  })

  it('should preview send detail', () => {
    cy.getByTestID('text_send_amount').invoke('text').should(t => expect(t).equal('1.23400000'))
    cy.getByTestID('text_send_amount_suffix').contains('dBTC')
    cy.getByTestID('text_destination').invoke('text').should(t => expect(t).equal('bcrt1q8rfsfny80jx78cmk4rsa069e2ckp6rn83u6ut9'))
    cy.getByTestID('text_amount').invoke('text').should(t => expect(t).equal('1.23400000'))
    cy.getByTestID('text_amount_suffix').contains('dBTC')
    cy.getByTestID('button_confirm_send').should('not.have.attr', 'disabled')
  })
})
