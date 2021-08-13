context('Wallet - Transaction Authorization with Error', () => {
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
    cy.getByTestID('balances_row_0_utxo').should('exist')
    cy.getByTestID('balances_row_0_utxo_amount').contains(10).click()
    cy.getByTestID('convert_button').click()
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
    Array.from(Array(3), (v, i) => i + 1).forEach(() => {
      cy.getByTestID('pin_authorize').type('696969').wait(1000)
    })
    cy.getByTestID('cancel_authorization').click()
    cy.getByTestID('button_confirm_convert').click().wait(2000)
    cy.getByTestID('pin_attempt_error').should('not.exist')
    cy.getByTestID('pin_authorize').type('696969').wait(1000)
    cy.url().should('include', 'wallet/onboarding')
  })

  it('should not reset attempts on cancel - non transaction UI', function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_settings').click()
    cy.getByTestID('view_recovery_words').click()
    Array.from(Array(3), (v, i) => i + 1).forEach(() => {
      cy.getByTestID('pin_authorize').type('696969').wait(1000)
    })
    cy.getByTestID('cancel_authorization').click()
    cy.getByTestID('view_recovery_words').click()
    cy.getByTestID('pin_attempt_error').should('not.exist')
    cy.getByTestID('pin_authorize').type('696969').wait(1000)
    cy.url().should('include', 'wallet/onboarding')
  })
})

context('Wallet - Transaction Authorization', () => {
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
    cy.getByTestID('balances_row_0_utxo').should('exist')
    cy.getByTestID('balances_row_0_utxo_amount').contains(10).click()
    cy.getByTestID('send_button').click()
  })

  context('Transaction Authorization', () => {
    it('should be able to cancel', function () {
      cy.getByTestID('address_input').clear().type('bcrt1qjhzkxvrgs3az4sv6ca9nqxqccwudvx768cgq93')
      cy.getByTestID('amount_input').clear().type('1')
      cy.getByTestID('send_submit_button').click()
      cy.getByTestID('button_confirm_send').click().wait(3000)
      cy.getByTestID('cancel_authorization').click()
    })

    it('should be able to exit failed retries', function () {
      cy.go('back')
      cy.getByTestID('address_input').clear().type('bcrt1qjhzkxvrgs3az4sv6ca9nqxqccwudvx768cgq93')
      cy.getByTestID('amount_input').clear().type('1')
      cy.getByTestID('send_submit_button').click()
      cy.getByTestID('button_confirm_send').click().wait(3000)
      Array.from(Array(4), (v, i) => i + 1).forEach(() => {
        cy.getByTestID('pin_authorize').type('696969').wait(1000)
      })
      cy.url().should('include', 'wallet/onboarding')
    })

    it('should clear attempt on success', function () {
      cy.createEmptyWallet(true)
      cy.sendDFItoWallet().sendTokenToWallet(['BTC']).wait(10000)
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('balances_list').should('exist')
      cy.getByTestID('balances_row_0_utxo').should('exist')
      cy.getByTestID('balances_row_0_utxo_amount').contains(10).click()
      cy.getByTestID('send_button').click()
      cy.getByTestID('address_input').clear().type('bcrt1qjhzkxvrgs3az4sv6ca9nqxqccwudvx768cgq93')
      cy.getByTestID('amount_input').clear().type('1')
      cy.getByTestID('send_submit_button').click()
      cy.getByTestID('button_confirm_send').click().wait(3000)
      Array.from(Array(3), (v, i) => i + 1).forEach(() => {
        cy.getByTestID('pin_authorize').type('696969').wait(1000)
      })
      cy.closeOceanInterface()
      cy.getByTestID('balances_list').should('exist')
      cy.getByTestID('balances_row_0_utxo').should('exist')
      cy.getByTestID('balances_row_0_utxo_amount').click()
      cy.getByTestID('send_button').click()
      cy.getByTestID('address_input').clear().type('bcrt1qjhzkxvrgs3az4sv6ca9nqxqccwudvx768cgq93')
      cy.getByTestID('amount_input').clear().type('1')
      cy.getByTestID('send_submit_button').click()
      cy.getByTestID('button_confirm_send').click().wait(3000)
      Array.from(Array(1), (v, i) => i + 1).forEach(() => {
        cy.getByTestID('pin_authorize').type('696969').wait(1000)
      })
      cy.getByTestID('pin_authorize').type('000000').wait(1000)
    })
  })

  context('Non-Transaction Authorization', () => {
    it('should be prompt non-signing authorization', function () {
      cy.createEmptyWallet(true)
      cy.getByTestID('bottom_tab_settings').click()
      cy.getByTestID('view_recovery_words').click()
    })

    it('should be able to cancel', function () {
      cy.getByTestID('cancel_authorization').click()
      cy.getByTestID('view_recovery_words').click()
    })

    it('should be able to exit failed retries', function () {
      Array.from(Array(4), (v, i) => i + 1).forEach(() => {
        cy.getByTestID('pin_authorize').type('696969').wait(1000)
      })
      cy.url().should('include', 'wallet/onboarding')
    })

    it('should clear attempt on success', function () {
      cy.createEmptyWallet(true)
      cy.getByTestID('bottom_tab_settings').click()
      cy.getByTestID('view_recovery_words').click()
      Array.from(Array(3), (v, i) => i + 1).forEach(() => {
        cy.getByTestID('pin_authorize').type('696969').wait(1000)
      })
      cy.getByTestID('pin_authorize').type('000000').wait(1000)
      cy.getByTestID('recovery_word_screen').should('exist')
      cy.go('back')
      cy.getByTestID('view_recovery_words').click()
      Array.from(Array(1), (v, i) => i + 1).forEach(() => {
        cy.getByTestID('pin_authorize').type('696969').wait(1000)
      })
      cy.getByTestID('pin_authorize').type('000000').wait(1000)
      cy.getByTestID('recovery_word_screen').should('exist')
    })
  })
})
