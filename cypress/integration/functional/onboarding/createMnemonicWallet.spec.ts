context('wallet/createmnemonic', () => {
  const recoveryWords = Array.from(Array(24), (v, i) => i + 1)
  before(function () {
    cy.visit('/')
    cy.getByTestID('playground_wallet_clear').click()
    cy.getByTestID('create_wallet_button').click()
    cy.getByTestID('guidelines_switch').click()
    cy.getByTestID('create_recovery_words_button').click()
    cy.url().should('include', 'wallet/mnemonic/create')
  })

  recoveryWords.forEach((i) => {
    it(`should display word #${i}`, function () {
      cy.getByTestID(`word_${i}`).should('exist')
      cy.getByTestID(`word_${i}_number`).should('exist').contains(`${i}.`)
    })
  })

  it('should be able to click verify button', function () {
    cy.getByTestID('verify_button').should('not.have.attr', 'disabled')
    cy.getByTestID('verify_button').click()
  })
})
