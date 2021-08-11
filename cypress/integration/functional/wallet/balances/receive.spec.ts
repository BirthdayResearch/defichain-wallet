context('Wallet - Receive', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().wait(10000)
  })

  it('should display valid address when clicked', function () {
    cy.getByTestID('balances_row_0_utxo').click()
    cy.getByTestID('receive_button').click()
  })

  it('should get address value and validate', function () {
    cy.getByTestID('qr_code_container').should('exist')
    cy.getByTestID('copy_button').should('exist')
    cy.getByTestID('copy_button').click()
    cy.getByTestID('address_text').then(($txt: any) => {
      const address = $txt[0].textContent
      cy.go('back')
      cy.getByTestID('send_button').click()
      cy.getByTestID('amount_input').clear().type('1')
      cy.getByTestID('address_input').type(address)
      cy.getByTestID('send_submit_button').should('not.have.attr', 'disabled')
    })
  })

  it('should be able to click share', function () {
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('header_receive_balance').click()
    cy.getByTestID('share_button').should('exist')
  })
})
