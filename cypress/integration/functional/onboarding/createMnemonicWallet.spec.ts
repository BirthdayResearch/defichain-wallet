context('wallet/createmnemonic', () => {
  const numbers = Array.from(Array(24), (v, i) => i + 1)
  const recoveryWords: string[] = []
  before(function () {
    cy.visit('/')
    cy.getByTestID('playground_wallet_clear').click()
    cy.getByTestID('create_wallet_button').click()
    cy.getByTestID('guidelines_switch').click()
    cy.getByTestID('create_recovery_words_button').click()
    cy.url().should('include', 'wallet/mnemonic/create')
  })

  numbers.forEach((i) => {
    it(`should display word #${i}`, function () {
      cy.getByTestID(`word_${i}`).should('exist')
      cy.getByTestID(`word_${i}_number`).should('exist').contains(`${i}.`)
      cy.getByTestID(`word_${i}`).then(($txt: any) => {
        recoveryWords.push($txt[0].textContent)
      })
    })
  })

  it('should be able to click verify button', function () {
    cy.getByTestID('verify_button').should('not.have.attr', 'disabled')
    cy.getByTestID('verify_button').click()
  })

  it('should have disabled button', function () {
    cy.getByTestID('verify_words_button').should('have.attr', 'disabled')
  })

  it('should be able to select correct words', function () {
    [0, 1, 2, 3, 4, 5].forEach((key, index) => {
      cy.getByTestID(`line_${index}`).then(($txt: any) => {
        const wordIndex = (+$txt[0].textContent.replace('?', '').replace('#', '')) - 1
        cy.getByTestID(`line_${index}_${recoveryWords[wordIndex]}`).click()
      })
    })
  })

  it('should be able to verify', function () {
    cy.getByTestID('verify_words_button').should('not.have.attr', 'disabled')
    cy.getByTestID('verify_words_button').click()
  })

  it('should be able to verify and set pincode', function () {
    cy.getByTestID('pin_input').type('000000')
    cy.getByTestID('create_pin_button').click()
    cy.getByTestID('pin_confirm_input').type('777777').wait(5000)
    cy.getByTestID('wrong_passcode_text').should('exist')
    cy.getByTestID('pin_confirm_input').type('000000')
  })

  it('should be able to restore mnemonic words', function () {
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('playground_wallet_clear').click()
    cy.getByTestID('restore_wallet_button').click()
    recoveryWords.forEach((word, index) => {
      cy.getByTestID(`recover_word_${index + 1}`).clear().type(word).blur()
      cy.getByTestID(`recover_word_${index + 1}`).should('have.css', 'color', 'rgb(0, 0, 0)')
    })
    cy.getByTestID('recover_wallet_button').should('not.have.attr', 'disabled')
    cy.getByTestID('recover_wallet_button').click()
    cy.getByTestID('pin_input').type('000000')
    cy.getByTestID('create_pin_button').click()
    cy.getByTestID('pin_confirm_input').type('000000')
    cy.getByTestID('balances_list').should('exist')
  })
})
