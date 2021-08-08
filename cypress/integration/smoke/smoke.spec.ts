/**
 * This file will be used for mainnet testing or smoke testing
 * It will only test core features that doesn't require balances (e.g, Create, Restore wallet etc.)
 * Tests included here are not that extensive compared to functional testing (e.g, Color, disable test or styling tests won't be added here)
 * The goal is to have run smoke testing in Mainnet
 * */

context('Mainnet - Wallet', () => {
  const recoveryWords: string[] = []
  const settingsRecoveryWords: string[] = []

  it('should have MainNet and Connected status', function () {
    cy.switchNetwork('MainNet')
    cy.getByTestID('playground_active_network').then(($txt: any) => {
      const network = $txt[0].textContent
      expect(network).eq('MainNet')
    })
    cy.getByTestID('playground_status_indicator').should('have.css', 'background-color', 'rgb(16, 185, 129)')
  })

  it('should start creation of mnemonic wallet', function () {
    cy.startCreateMnemonicWallet(recoveryWords)
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
      cy.getByTestID('bottom_tab_settings').click()
      cy.getByTestID('setting_exit_wallet').click()
      cy.restoreMnemonicWords(settingsRecoveryWords)
    })
  })

  context('Wallet - Verify Wallet Address', () => {
    it('should be have selected valid network', function () {
      cy.getByTestID('bottom_tab_settings').click()
      cy.getByTestID('button_network_MainNet_check').should('exist')
    })

    it('should be have valid network address', function () {
      cy.verifyWalletAddress('mainnet')
    })
  })
})
