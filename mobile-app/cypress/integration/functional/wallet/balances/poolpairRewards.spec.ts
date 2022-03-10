import BigNumber from 'bignumber.js'

context('Wallet - Pool Pair Rewards', () => {
  const walletA = {
    address: '',
    recoveryWords: []
  }

  it('should create Wallet A without any tokens', function () {
    cy.createEmptyWallet(true)
    cy.verifyWalletAddress('regtest', walletA)
    cy.verifyMnemonicOnSettingsPage(walletA.recoveryWords, walletA.recoveryWords)
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('header_settings').click()
    cy.getByTestID('setting_exit_wallet').click()
  })

  context('Wallet with LP Tokens', () => {
    it('should create Wallet B with LP tokens', function () {
      cy.createEmptyWallet(true)
    })

    it('should not have any DFI tokens', function () {
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('details_DFI').click()
      cy.getByTestID('dfi_token_amount').contains('0.00000000')
    })

    it('should receive LP tokens DFI tokens and receive rewards', function () {
      cy.sendDFItoWallet()
        .sendTokenToWallet(['BTC-DFI']).wait(10000)
      cy.getByTestID('dfi_token_amount').should('exist')
      cy.getByTestID('dfi_token_amount').then(($txt: any) => {
        const balanceAmount = $txt[0].textContent.replace(' DFI', '').replace(',', '')
        expect(new BigNumber(balanceAmount).toNumber()).be.gt(0)
      })
    })

    it('should be able to send LP tokens', function () {
      cy.getByTestID('balances_row_17_amount').click()
      cy.getByTestID('send_button').click()
      cy.getByTestID('address_input').type(walletA.address)
      cy.getByTestID('MAX_amount_button').click()
      cy.getByTestID('button_confirm_send_continue').click()
      cy.getByTestID('lp_ack_switch').click()
      cy.getByTestID('button_confirm_send').click().wait(3000)
      cy.closeOceanInterface().wait(3000)
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('balances_row_17_amount').should('not.exist').wait(3000)
    })

    it('should check if WalletA received LP tokens', function () {
      cy.exitWallet()
      cy.restoreMnemonicWords(walletA.recoveryWords)
      cy.getByTestID('balances_row_17_amount').contains('10')
      cy.getByTestID('details_DFI').click()
      cy.getByTestID('dfi_token_amount').then(($txt: any) => {
        const balanceAmount = $txt[0].textContent.replace(' DFI', '').replace(',', '')
        expect(new BigNumber(balanceAmount).toNumber()).be.gt(0)
      })
    })
  })
})
