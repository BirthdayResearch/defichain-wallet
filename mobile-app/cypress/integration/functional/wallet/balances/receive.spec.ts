import { THEMES } from '../../../../support/commands'

context('Wallet - Receive', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().wait(3000)
    cy.getByTestID('bottom_tab_balances').click()
  })

  it('should display valid address when clicked', function () {
    cy.getByTestID('balances_list').should('exist')
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
})

context('Wallet - Receive - QR Code - Check', () => {
  before(function () {
    cy.createEmptyWallet()
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('balances_row_0_utxo').click()
    cy.getByTestID('receive_button').click()
  })

  it('should match QR code', function () {
    cy.getByTestID('qr_code_container').compareSnapshot('qr-code-container')
  })
})

context('Wallet - Receive - Snapshot - Check', () => {
  THEMES.forEach((theme) => {
    it(`should match ${theme} snapshot`, function () {
      cy.createEmptyWallet()
      cy.setTheme(theme)
      cy.getByTestID('balances_list').should('exist')
      cy.getByTestID('balances_row_0_utxo').click()
      cy.getByTestID('receive_button').click()
      cy.getByTestID('main_screen').compareSnapshot(`receive-screen-${theme}`)
    })
  })
})
