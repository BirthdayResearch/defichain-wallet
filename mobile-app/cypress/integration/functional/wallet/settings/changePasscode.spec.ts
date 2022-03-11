function sendWithNewPin (): void {
  cy.getByTestID('bottom_tab_balances').click()
  cy.getByTestID('balances_list').should('exist')
  cy.getByTestID('details_dfi').click()
  cy.getByTestID('send_dfi_button').click()
  cy.getByTestID('address_input').clear().type('bcrt1qjhzkxvrgs3az4sv6ca9nqxqccwudvx768cgq93')
  cy.getByTestID('amount_input').clear().type('1')
  cy.getByTestID('button_confirm_send_continue').click()
  cy.getByTestID('button_confirm_send').click().wait(3000)
  cy.getByTestID('pin_authorize').type('000000').wait(3000)
  cy.closeOceanInterface('696969')
}

function nonTransactionNewPin (): void {
  cy.getByTestID('bottom_tab_balances').click()
  cy.getByTestID('header_settings').click()
  cy.getByTestID('view_recovery_words').click()
  cy.getByTestID('pin_authorize').type('696969').wait(3000)
  cy.getByTestID('recovery_word_screen').should('exist')
}

context('Wallet - Change Passcode', () => {
  beforeEach(() => {
    cy.restoreLocalStorage()
  })

  afterEach(() => {
    cy.saveLocalStorage()
  })

  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendTokenToWallet(['BTC']).wait(10000)
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('details_dfi').click()
    cy.getByTestID('dfi_utxo_amount').contains('10.00000000')
  })

  it('should be able to go passcode FAQ', function () {
    cy.getByTestID('header_settings').click()
    cy.getByTestID('view_change_passcode').click()
    cy.getByTestID('pin_authorize').type('000000').wait(3000)
    cy.getByTestID('passcode_faq_link').click()
    cy.url().should('include', 'app/Settings/PasscodeFaq')
    cy.go('back')
    cy.url().should('include', '/app/Settings/ChangePinScreen')
  })

  it('should be able to change passcode', function () {
    cy.changePasscode()
  })

  it('should not be able to use old passcode for non transaction UI', function () {
    nonTransactionNewPin()
  })

  it('should not be able to use old passcode for transaction UI', function () {
    sendWithNewPin()
  })

  it('should be able to input new passcode on reload for non transaction UI', function () {
    cy.reload()
    nonTransactionNewPin()
  })

  it('should be able to input new passcode on reload for transaction UI', function () {
    cy.reload()
    sendWithNewPin()
  })

  it('should not display on unencrypted mnemonic wallet', function () {
    cy.createEmptyWallet(false)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('view_change_passcode').should('not.exist')
  })
})
