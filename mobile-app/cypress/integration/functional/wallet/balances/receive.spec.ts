context('Wallet - Receive', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().wait(3000)
    cy.getByTestID('bottom_tab_balances').click()
  })

  it('should display valid address when clicked', function () {
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('receive_balance_button').click()
  })

  it('should get address value and validate', function () {
    cy.getByTestID('qr_code_container').should('exist')
    cy.getByTestID('copy_button').should('exist')
    cy.getByTestID('copy_button').click()
    cy.getByTestID('address_text').then(($txt: any) => {
      const address = $txt[0].textContent
      cy.go('back')
      cy.getByTestID('send_dfi_button').click()
      cy.getByTestID('amount_input').clear().type('1')
      cy.getByTestID('address_input').type(address)
      cy.getByTestID('button_confirm_send_continue').should('not.have.attr', 'disabled')
    })
  })
})

context('Wallet - Receive - QR Code - Check', () => {
  before(function () {
    cy.createEmptyWallet()
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('receive_balance_button').click()
  })

  it('should match QR code', function () {
    cy.getByTestID('qr_code_container').compareSnapshot('qr-code-container')
  })
})
