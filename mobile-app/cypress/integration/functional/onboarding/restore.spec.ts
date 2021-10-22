context('Onboarding - Restore Wallet', () => {
  const recoveryWords = ['abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'art']

  before(function () {
    cy.visit('/')
    cy.exitWallet()
    cy.getByTestID('restore_wallet_button').click()
    cy.url().should('include', 'wallet/mnemonic/restore')
  })

  it('should have disabled button', function () {
    cy.getByTestID('recover_wallet_button').should('have.attr', 'aria-disabled')
  })

  it('should not prompt when navigate back without filling any recovery word', function () {
    cy.go('back')
    cy.getByTestID('onboarding_carousel').should('exist')
  })

  it('should be able to navigate back if at least one recovery word is filled', function () {
    cy.getByTestID('restore_wallet_button').click()
    cy.getByTestID('recover_word_1').type('a')
    cy.go('back')
    cy.on('window:confirm', () => {})
    cy.getByTestID('onboarding_carousel').should('exist')
  })

  it('should reset all recover word input on every landing', function () {
    cy.getByTestID('restore_wallet_button').click()
    Array.from(Array(24), (v, i) => i + 1).forEach((key) => {
      cy.getByTestID(`recover_word_${key}`).invoke('val').then((text: any) =>
        expect(text).to.be.empty
      )
    })
  })

  recoveryWords.forEach((word, index) => {
    it(`should validate input recovery word #${index + 1} ${word}`, function () {
      // Invalid forms - number, uppercase, space, special character
      cy.getByTestID(`recover_word_${index + 1}`).clear().type('{enter}')
      cy.getByTestID(`recover_word_${index + 1}_error`).should('have.text', 'Required field is missing')
      cy.getByTestID(`recover_word_${index + 1}`).clear().type('1').type('{enter}')
      cy.getByTestID(`recover_word_${index + 1}`).should('have.css', 'color', 'rgb(64, 64, 64)')
      cy.getByTestID(`recover_word_${index + 1}_error`).should('have.text', 'Uppercase, numbers and special characters are not allowed')
      cy.getByTestID(`recover_word_${index + 1}`).clear().type('A').type('{enter}')
      cy.getByTestID(`recover_word_${index + 1}`).should('have.css', 'color', 'rgb(64, 64, 64)')
      cy.getByTestID(`recover_word_${index + 1}_error`).should('have.text', 'Uppercase, numbers and special characters are not allowed')
      cy.getByTestID(`recover_word_${index + 1}`).clear().type('a a').type('{enter}')
      cy.getByTestID(`recover_word_${index + 1}`).should('have.css', 'color', 'rgb(64, 64, 64)')
      cy.getByTestID(`recover_word_${index + 1}_error`).should('have.text', 'Uppercase, numbers and special characters are not allowed')
      cy.getByTestID(`recover_word_${index + 1}`).clear().type('$$$').type('{enter}')
      cy.getByTestID(`recover_word_${index + 1}`).should('have.css', 'color', 'rgb(64, 64, 64)')
      cy.getByTestID(`recover_word_${index + 1}_error`).should('have.text', 'Uppercase, numbers and special characters are not allowed')

      cy.getByTestID(`recover_word_${index + 1}`).clear().type(word).blur()
      cy.getByTestID(`recover_word_${index + 1}`).should('have.css', 'color', 'rgb(64, 64, 64)')
    })
  })

  it('should stay on current screen when restore with at least one invalid recovery word', function () {
    cy.getByTestID('recover_word_1').clear().type('a')
    cy.getByTestID('recover_wallet_button').should('not.have.attr', 'disabled')
    cy.getByTestID('recover_wallet_button').click().wait(2000)
    cy.on('window:confirm', () => {})
    cy.url().should('include', 'wallet/mnemonic/restore')
  })

  it('should be able to submit form', function () {
    cy.getByTestID('recover_word_1').clear().type(recoveryWords[0])
    cy.getByTestID('recover_wallet_button').should('not.have.attr', 'disabled')
    cy.getByTestID('recover_wallet_button').click().wait(2000)
  })

  it('should be able to set pincode', function () {
    cy.getByTestID('pin_input').type('000000')
    cy.getByTestID('pin_confirm_input').type('000000')
    cy.getByTestID('balances_list').should('exist')
  })
})
