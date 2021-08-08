context('Onboarding - Create Mnemonic Wallet', () => {
  const recoveryWords: string[] = []
  const settingsRecoveryWords: string[] = []

  it('should start creation of mnemonic wallet', function () {
    cy.visit('/')
    cy.exitWallet()
    cy.startCreateMnemonicWallet(recoveryWords)
  })

  it('should have disabled button for verify words', function () {
    cy.getByTestID('verify_words_button').should('have.attr', 'disabled')
  })

  it('should select incorrect words', function () {
    Array.from(Array(6), (v, i) => i + 1).forEach((key, index) => {
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
    Array.from(Array(24), (v, i) => i + 1).forEach((i) => {
      cy.getByTestID(`word_${i}`).should('exist')
      cy.getByTestID(`word_${i}_number`).should('exist').contains(`${i}.`)
    })
    cy.getByTestID('verify_button').click()
  })

  it('should be able to select correct words', function () {
    cy.selectMnemonicWords(recoveryWords)
  })

  it('should be able to verify and set pincode', function () {
    cy.setupPinCode()
  })

  context('Settings - Mnemonic Verification', () => {
    it('should be able to verify mnemonic from settings page', function () {
      cy.verifyMnemonicOnSettingsPage(settingsRecoveryWords, recoveryWords)
    })
  })

  context('Restore - Mnemonic Verification', () => {
    it('should be able to restore mnemonic words', function () {
      cy.exitWallet()
      cy.restoreMnemonicWords(settingsRecoveryWords)
    })
  })
})
