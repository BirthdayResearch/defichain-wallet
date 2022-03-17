context('Wallet - Transaction Authorization with Error', () => {
  const MAX_PASSCODE_ATTEMPT = 3
  beforeEach(() => {
    cy.restoreLocalStorage()
  })

  afterEach(() => {
    cy.saveLocalStorage()
  })

  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendTokenToWallet(['BTC']).wait(5000)
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('details_dfi').click()
    cy.getByTestID('dfi_utxo_amount').contains('10.00000000')
    cy.getByTestID('convert_dfi_button').click()
  })

  it('should be able to show ocean interface error', function () {
    cy.intercept('**/regtest/rawtx/send', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    }).as('sendToAddress')
    cy.getByTestID('text_input_convert_from_input').clear().type('1')
    cy.getByTestID('button_continue_convert').click()
    cy.getByTestID('button_confirm_convert').click().wait(2000)
    cy.closeOceanInterface()
  })

  it('should not reset attempts on cancel', function () {
    cy.getByTestID('button_confirm_convert').click().wait(2000)
    cy.wrap(Array(MAX_PASSCODE_ATTEMPT - 1)).each(() => {
      cy.getByTestID('pin_authorize').type('696969').wait(1000)
    })
    cy.getByTestID('cancel_authorization').click()
    cy.getByTestID('button_confirm_convert').click().wait(2000)
    cy.getByTestID('pin_attempt_error').should('not.exist')
    cy.getByTestID('pin_authorize').type('696969').wait(1000)
    cy.on('window:confirm', () => {})
    cy.url().should('include', 'wallet/onboarding')
  })
})

context('Wallet - Transaction Authorization with Error - non transaction UI', () => {
  const MAX_PASSCODE_ATTEMPT = 3
  it('should not reset attempts on cancel - non transaction UI', function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.getByTestID('view_recovery_words').click()
    cy.wait(3000)
    cy.wrap(Array(MAX_PASSCODE_ATTEMPT - 1)).each(() => {
      cy.getByTestID('pin_authorize').type('696969').wait(1000)
    })
    cy.getByTestID('cancel_authorization').click().wait(1000)
    cy.getByTestID('view_recovery_words').click()
    cy.getByTestID('pin_attempt_error').should('not.exist')
    cy.getByTestID('pin_authorize').type('696969').wait(1000)
    cy.on('window:confirm', () => {})
    cy.url().should('include', 'wallet/onboarding')
  })
})

context('Wallet - Transaction Authorization', () => {
  const MAX_PASSCODE_ATTEMPT = 3
  beforeEach(() => {
    cy.restoreLocalStorage()
  })

  afterEach(() => {
    cy.saveLocalStorage()
  })

  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendTokenToWallet(['BTC']).wait(5000)
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('details_dfi').click()
    cy.getByTestID('dfi_utxo_amount').contains('10.00000000')
    cy.getByTestID('send_dfi_button').click()
  })

  context('Transaction Authorization', () => {
    it('should be able to cancel', function () {
      cy.getByTestID('address_input').clear().type('bcrt1qjhzkxvrgs3az4sv6ca9nqxqccwudvx768cgq93')
      cy.getByTestID('amount_input').clear().type('1')
      cy.getByTestID('button_confirm_send_continue').click()
      cy.getByTestID('button_confirm_send').click().wait(3000)
      cy.getByTestID('cancel_authorization').click()
    })

    it('should be able to exit failed retries', function () {
      cy.go('back')
      cy.getByTestID('address_input').clear().type('bcrt1qjhzkxvrgs3az4sv6ca9nqxqccwudvx768cgq93')
      cy.getByTestID('amount_input').clear().type('1')
      cy.getByTestID('button_confirm_send_continue').click()
      cy.getByTestID('button_confirm_send').click().wait(3000)
      cy.wrap(Array(MAX_PASSCODE_ATTEMPT)).each(() => {
        cy.getByTestID('pin_authorize').type('696969').wait(1000)
      })
      cy.on('window:confirm', () => {})
      cy.url().should('include', 'wallet/onboarding')
    })

    it('should clear attempt on success', function () {
      cy.createEmptyWallet(true)
      cy.sendDFItoWallet().sendTokenToWallet(['BTC']).wait(5000)
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('balances_list').should('exist')
      cy.getByTestID('details_dfi').click()
      cy.getByTestID('dfi_utxo_amount').contains('10.00000000')
      cy.getByTestID('send_dfi_button').click()
      cy.getByTestID('address_input').clear().type('bcrt1qjhzkxvrgs3az4sv6ca9nqxqccwudvx768cgq93')
      cy.getByTestID('amount_input').clear().type('1')
      cy.getByTestID('button_confirm_send_continue').click()
      cy.getByTestID('button_confirm_send').click().wait(3000)
      cy.wrap(Array(MAX_PASSCODE_ATTEMPT - 1)).each(() => {
        cy.getByTestID('pin_authorize').type('696969').wait(1000)
      })
      cy.closeOceanInterface()
      cy.getByTestID('balances_list').should('exist')
      cy.getByTestID('dfi_utxo_amount').should('exist')
      cy.getByTestID('send_dfi_button').click()
      cy.getByTestID('address_input').clear().type('bcrt1qjhzkxvrgs3az4sv6ca9nqxqccwudvx768cgq93')
      cy.getByTestID('amount_input').clear().type('1')
      cy.getByTestID('button_confirm_send_continue').click()
      cy.getByTestID('button_confirm_send').click().wait(3000)
      cy.getByTestID('pin_authorize').type('696969').wait(1000)
      cy.getByTestID('pin_authorize').type('000000').wait(1000)
    })
  })

  context('Non-Transaction Authorization', () => {
    it('should be prompt non-signing authorization', function () {
      cy.createEmptyWallet(true).wait(4000)
      cy.getByTestID('header_settings').click()
      cy.wait(2000)
      cy.getByTestID('view_recovery_words').click()
    })

    it('should be able to cancel', function () {
      cy.getByTestID('cancel_authorization').click()
      cy.getByTestID('view_recovery_words').click().wait(3000)
    })

    it('should be able to exit failed retries', function () {
      cy.wrap(Array(MAX_PASSCODE_ATTEMPT)).each(() => {
        cy.getByTestID('pin_authorize').type('696969').wait(2000)
      })
      cy.on('window:confirm', () => {})
      cy.url().should('include', 'wallet/onboarding')
    })

    it('should clear attempt on success', function () {
      cy.createEmptyWallet(true).wait(4000)
      cy.getByTestID('header_settings').click()
      cy.getByTestID('view_recovery_words').click()
      cy.wrap(Array(MAX_PASSCODE_ATTEMPT - 1)).each(() => {
        cy.getByTestID('pin_authorize').type('696969').wait(1000)
      })
      cy.getByTestID('pin_authorize').type('000000').wait(1000)
      cy.getByTestID('recovery_word_screen').should('exist')
      cy.go('back')
      cy.getByTestID('view_recovery_words').click()
      cy.getByTestID('pin_authorize').type('696969').wait(1000)
      cy.getByTestID('pin_authorize').type('000000').wait(1000)
      cy.getByTestID('recovery_word_screen').should('exist')
    })
  })
})
