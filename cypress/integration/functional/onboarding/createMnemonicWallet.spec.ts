context('Onboarding - Create Mnemonic Wallet', () => {
  const numbers = Array.from(Array(24), (v, i) => i + 1)
  const recoveryWords: string[] = []
  const settingsRecoveryWords: string[] = []

  before(function () {
    cy.visit('/')
    cy.exitWallet()
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

  it('should select incorrect words', function () {
    [0, 1, 2, 3, 4, 5].forEach((key, index) => {
      cy.getByTestID(`line_${index}`).then(($txt: any) => {
        const wordIndex = (+$txt[0].textContent.replace('?', '').replace('#', '')) - 1
        cy.getByTestID(`recovery_word_row_${wordIndex}`).children().first().click()
      })
    })
  })

  it('should return to previous page on error', function () {
    cy.getByTestID('verify_words_button').should('not.have.attr', 'disabled')
    cy.getByTestID('verify_words_button').click()
    // validate if they're the same words on return
    numbers.forEach((i) => {
      cy.getByTestID(`word_${i}`).should('exist')
      cy.getByTestID(`word_${i}_number`).should('exist').contains(`${i}.`)
    })
    cy.getByTestID('verify_button').click()
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
    cy.getByTestID('pin_confirm_input').type('777777').wait(1000)
    cy.getByTestID('wrong_passcode_text').should('exist')
    cy.getByTestID('pin_confirm_input').type('000000')
  })

  context('Settings - Mnemonic Verification', () => {
    it('should be able to verify mnemonic from settings page', function () {
      cy.getByTestID('balances_list').should('exist')
      cy.getByTestID('bottom_tab_settings').click()
      cy.getByTestID('view_recovery_words').click()
      cy.getByTestID('pin_authorize').type('000000')
    })

    numbers.forEach((i) => {
      it(`should display word #${i}`, function () {
        cy.getByTestID(`word_${i}`).should('exist')
        cy.getByTestID(`word_${i}_number`).should('exist').contains(`${i}.`)
        cy.getByTestID(`word_${i}`).then(($txt: any) => {
          settingsRecoveryWords.push($txt[0].textContent)
        })
      })
    })

    it('should be able to have equal words', function () {
      expect(recoveryWords).to.deep.eq(settingsRecoveryWords)
    })
  })

  context('Restore - Mnemonic Verification', () => {
    it('should be able to restore mnemonic words', function () {
      cy.exitWallet()
      cy.getByTestID('restore_wallet_button').click()
      settingsRecoveryWords.forEach((word, index) => {
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
})
