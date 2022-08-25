context('Wallet - Send Preview/Confirmation', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendTokenToWallet(['BTC']).wait(4000)
    cy.getByTestID('bottom_tab_portfolio').click()

    cy.getByTestID('portfolio_row_1').click()
    cy.getByTestID('send_button').click()
    cy.getByTestID('amount_input').clear().type('1.234')
    cy.getByTestID('address_input').clear().type('bcrt1q8rfsfny80jx78cmk4rsa069e2ckp6rn83u6ut9').wait(1000)
    cy.getByTestID('button_confirm_send_continue').click()
  })

  it('should preview send detail', () => {
    cy.getByTestID('confirm_title').should('have.text', 'You are sending')
    cy.getByTestID('text_send_amount').invoke('text').should(t => expect(t).equal('1.23400000'))
    cy.getByTestID('wallet_address').should('exist')
    cy.getByTestID('summary_to_value').should('have.text', 'bcrt1q8rfsfny80jx78cmk4rsa069e2ckp6rn83u6ut9')

    cy.getByTestID('transaction_fee_label').should('have.text', 'Transaction fee')
    cy.getByTestID('transaction_fee_value').contains('DFI')

    cy.getByTestID('text_amount_label').should('have.text', 'Amount to send')
    cy.getByTestID('text_amount').contains('1.23400000 dBTC')
    cy.getByTestID('text_amount_rhsUsdAmount').should('have.text', '$12,340.00')
    cy.getByTestID('button_confirm_send').should('not.have.attr', 'disabled')
  })
})
