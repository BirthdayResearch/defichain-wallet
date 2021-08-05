context('wallet/recover', () => {
  const recoveryWords = ['abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'art']

  before(function () {
    cy.visit('/')
    cy.getByTestID('playground_wallet_clear').click()
    cy.getByTestID('restore_wallet_button').click()
    cy.url().should('include', 'wallet/mnemonic/restore')
  })

  it('should have disabled button', function () {
    cy.getByTestID('recover_wallet_button').should('have.attr', 'disabled')
  })

  recoveryWords.forEach((word, index) => {
    it(`should validate input recovery word #${index + 1} ${word}`, function () {
      // Invalid forms - number, uppercase, space, special character
      cy.getByTestID(`recover_word_${index + 1}`).clear().type('1').type('{enter}')
      cy.getByTestID(`recover_word_${index + 1}`).should('have.css', 'color', 'rgb(255, 0, 0)')
      cy.getByTestID(`recover_word_${index + 1}`).clear().type('A').type('{enter}')
      cy.getByTestID(`recover_word_${index + 1}`).should('have.css', 'color', 'rgb(255, 0, 0)')
      cy.getByTestID(`recover_word_${index + 1}`).clear().type('a a').type('{enter}')
      cy.getByTestID(`recover_word_${index + 1}`).should('have.css', 'color', 'rgb(255, 0, 0)')
      cy.getByTestID(`recover_word_${index + 1}`).clear().type('$$$').type('{enter}')
      cy.getByTestID(`recover_word_${index + 1}`).should('have.css', 'color', 'rgb(255, 0, 0)')

      cy.getByTestID(`recover_word_${index + 1}`).clear().type(word).blur()
      cy.getByTestID(`recover_word_${index + 1}`).should('have.css', 'color', 'rgb(0, 0, 0)')
    })
  })

  it('should be able to submit form', function () {
    cy.getByTestID('recover_wallet_button').should('not.have.attr', 'disabled')
    cy.getByTestID('recover_wallet_button').click().wait(2000)
  })

  it('should be able to set pincode', function () {
    cy.getByTestID('pin_input').type('000000')
    cy.getByTestID('create_pin_button').click()
    cy.getByTestID('pin_confirm_input').type('000000')
    cy.getByTestID('balances_list').should('exist')
  })
})
