context('Wallet - Transaction Authorization', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendTokenToWallet(['BTC']).wait(10000)
    cy.fetchWalletBalance()
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('balances_row_0_utxo').should('exist')
    cy.getByTestID('balances_row_0_utxo_amount').contains(10).click()
    cy.getByTestID('send_button').click()
  })

  context('Transaction Authorization', () => {
    // TODO(@ivan-zynesis) - Clicking on cancel re-opens twice
    /* it('should be able to cancel', function () {
      cy.getByTestID('address_input').clear().type('bcrt1q8rfsfny80jx78cmk4rsa069e2ckp6rn83u6ut9')
      cy.getByTestID('amount_input').clear().type('1')
      cy.getByTestID('send_submit_button').click().wait(3000)
      cy.getByTestID('cancel_authorization').click()
    }) */

    it('should be able to exit failed retries', function () {
      cy.getByTestID('address_input').clear().type('bcrt1q8rfsfny80jx78cmk4rsa069e2ckp6rn83u6ut9')
      cy.getByTestID('amount_input').clear().type('1')
      cy.getByTestID('send_submit_button').click()
      Array.from(Array(4), (v, i) => i + 1).forEach(() => {
        cy.getByTestID('pin_authorize').type('696969').wait(1000)
      })
      cy.url().should('include', 'wallet/onboarding')
    })
  })

  context('Non-Transaction Authorization', () => {
    it('should be prompt non-signing authorization', function () {
      cy.createEmptyWallet(true)
      cy.getByTestID('bottom_tab_settings').click()
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
