import { WhaleApiClient } from '@defichain/whale-api-client'
import BigNumber from 'bignumber.js'

context('Wallet - Send', function () {
  let whale: WhaleApiClient
  beforeEach(function () {
    cy.restoreLocalStorage()
    const network = localStorage.getItem('Development.NETWORK')
    whale = new WhaleApiClient({
      url: network === 'Playground' ? 'https://playground.defichain.com' : 'http://localhost:19553',
      network: 'regtest',
      version: 'v0'
    })
  })

  afterEach(function () {
    cy.saveLocalStorage()
  })
  // bech32, p2sh, legacy
  const addresses = ['bcrt1q8rfsfny80jx78cmk4rsa069e2ckp6rn83u6ut9', '2MxnNb1MYSZvS3c26d4gC7gXsNMkB83UoXB', 'n1xjm9oekw98Rfb3Mv4ApyhwxC5kMuHnCo']
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendTokenToWallet(['BTC', 'BTC-DFI']).wait(3000)
    cy.getByTestID('bottom_tab_balances').click()
  })

  describe('DFI UTXO', function () {
    it('should be able redirect to QR screen page', function () {
      cy.getByTestID('balances_list').should('exist')
      cy.getByTestID('details_DFI').click()
      cy.getByTestID('dfi_utxo_amount').contains('10.00000000')
      cy.getByTestID('send_dfi_button').click()
      cy.getByTestID('qr_code_button').click()
      cy.url().should('include', 'app/BarCodeScanner')
      cy.go('back')
    })

    it('should be able to validate form', function () {
      // Valid form
      cy.getByTestID('address_input').type(addresses[0])
      cy.getByTestID('amount_input').type('0.1')
      cy.getByTestID('button_confirm_send_continue').should('not.have.attr', 'disabled')
      cy.getByTestID('amount_input_clear_button').click()

      // Invalid address
      cy.getByTestID('address_input').type('z')
      cy.getByTestID('button_confirm_send_continue').should('have.attr', 'aria-disabled')
      cy.getByTestID('address_input_clear_button').click()
      cy.getByTestID('button_confirm_send_continue').should('have.attr', 'aria-disabled')

      // Invalid amount - Character, over max amount, zero
      cy.getByTestID('address_input').clear().type(addresses[0])
      cy.getByTestID('amount_input').clear().type('a')
      cy.getByTestID('button_confirm_send_continue').should('have.attr', 'aria-disabled')
      cy.getByTestID('amount_input').clear().type('12')
      cy.getByTestID('button_confirm_send_continue').should('have.attr', 'aria-disabled')
      cy.getByTestID('amount_input').clear().type('0')
      cy.getByTestID('button_confirm_send_continue').should('have.attr', 'aria-disabled')
    })

    it('should be able to display elements', function () {
      cy.getByTestID('qr_code_button').should('be.visible')
    })

    it('should contain info text when sending UTXO', function () {
      cy.getByTestID('reserved_info_text').should('be.visible')
    })

    it('should be able to compute for max values', function () {
      cy.getByTestID('transaction_fee').then(($txt: any) => {
        const transactionFee = $txt[0].textContent.replace(' DFI', '')
        cy.getByTestID('max_value').then(($txt: any) => {
          const maxValue = $txt[0].textContent.replace(' DFI', '')
          expect(new BigNumber(transactionFee).plus(maxValue).toFixed(0)).eq('10')
          cy.getByTestID('amount_input').clear()
          cy.getByTestID('MAX_amount_button').click()
          cy.getByTestID('amount_input').should('have.value', maxValue)
          cy.getByTestID('button_confirm_send_continue').should('not.have.attr', 'disabled')
        })
      })
    })

    it('should be able to compute half of max values', function () {
      cy.getByTestID('transaction_fee').then(($txt: any) => {
        const transactionFee = $txt[0].textContent.replace(' DFI', '')
        cy.getByTestID('max_value').then(($txt: any) => {
          const maxValue = $txt[0].textContent.replace(' DFI', '')
          const halfValue = new BigNumber(maxValue).div(2)
          expect(new BigNumber(halfValue).multipliedBy(2).plus(transactionFee).toFixed(0)).eq('10')
          cy.getByTestID('amount_input').clear()
          cy.getByTestID('50%_amount_button').click()
          cy.getByTestID('amount_input').should('have.value', halfValue.toFixed(8))
          cy.getByTestID('button_confirm_send_continue').should('not.have.attr', 'disabled')
        })
      })
    })

    it.skip('should be able to check txn details and compute pending balance', function () {
      cy.getByTestID('transaction_fee').invoke('text').then(transactionValue => {
        const transactionFee = transactionValue.replace(' DFI', '')
        cy.getByTestID('max_value').invoke('text').then((balanceValue) => {
          const balance = balanceValue.replace(' DFI', '')
          const sendAmount = '1'
          const slippage = '0.1'
          cy.getByTestID('amount_input').clear().type(sendAmount)
          cy.getByTestID('button_confirm_send_continue').should('not.have.attr', 'disabled')
          cy.getByTestID('button_confirm_send_continue').click()
          // Check txn value
          cy.getByTestID('text_send_amount').invoke('text').then((textAmount) => {
            const amount = textAmount.replace(' DFI', '')
            expect(new BigNumber(amount).toFixed(8)).eq(new BigNumber(sendAmount).toFixed(8))
            cy.getByTestID('text_fee').invoke('text').then((textFeeValue) => {
              const textFee = textFeeValue.replace(' DFI', '')
              expect(new BigNumber(transactionFee).toFixed(8)).eq(new BigNumber(textFee).toFixed(8))
              // Check computed pending balance
              cy.getByTestID('resulting_DFI').invoke('text').then((pendingBalanceValue) => {
                const pendingBalance = pendingBalanceValue.replace(' DFI', '')
                expect(new BigNumber(balance).plus(slippage)
                  .minus(transactionFee).minus(sendAmount).toFixed(8)
                ).eq(pendingBalance)
                cy.getByTestID('button_cancel_send').click()
              })
            })
          })
        })
      })
    })

    addresses.forEach(function (address) {
      it(`should be able to send to address ${address}`, function () {
        cy.getByTestID('bottom_tab_balances').click()
        cy.getByTestID('balances_list').should('exist')
        cy.getByTestID('dfi_balance_card').should('exist')
        cy.getByTestID('send_dfi_button').click()
        cy.getByTestID('address_input').clear().type(address)
        cy.getByTestID('amount_input').clear().type('1')
        cy.getByTestID('button_confirm_send_continue').should('not.have.attr', 'disabled')
        cy.getByTestID('button_confirm_send_continue').click()
        cy.getByTestID('confirm_title').contains('You are sending')
        // Cancel button
        cy.getByTestID('button_cancel_send').click()
        cy.getByTestID('address_input').should('exist')

        cy.getByTestID('button_confirm_send_continue').click()
        cy.getByTestID('button_confirm_send').click().wait(3000)
        cy.closeOceanInterface()
      })

      it(`should check if exist on other side ${address}`, function () {
        cy.wrap(whale.address.getBalance(address)).then((response) => {
          expect(response).eq('1.00000000')
        })
      })
    })

    it('should be able to transfer correct amount when user cancel a tx and updated some inputs', function () {
      const oldAddress = addresses[0]
      const newAddress = addresses[1]
      const oldAmount = '1'
      const newAmount = '2'
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('balances_list').should('exist')
      cy.getByTestID('dfi_balance_card').should('exist')
      cy.getByTestID('send_dfi_button').click()
      cy.getByTestID('address_input').clear().type(oldAddress)
      cy.getByTestID('amount_input').clear().type(oldAmount)
      cy.getByTestID('button_confirm_send_continue').should('not.have.attr', 'disabled')
      cy.getByTestID('button_confirm_send_continue').click()
      cy.getByTestID('confirm_title').contains('You are sending')
      cy.getByTestID('button_confirm_send').click().wait(3000)
      // Check for authorization page description
      cy.getByTestID('txn_authorization_description')
        .contains(`Sending ${new BigNumber(oldAmount).toFixed(8)} DFI`)
      // Cancel send on authorisation page
      cy.getByTestID('cancel_authorization').click()
      // Check for correct amount
      cy.getByTestID('text_amount').contains(oldAmount)
      // Cancel button
      cy.getByTestID('button_cancel_send').click()
      // Check correct value exists for input field
      cy.getByTestID('address_input').should('have.value', oldAddress)
      cy.getByTestID('amount_input').should('have.value', oldAmount)
      // Update the input amount
      cy.getByTestID('address_input').clear().type(newAddress)
      cy.getByTestID('amount_input').clear().type(newAmount)
      cy.getByTestID('button_confirm_send_continue').should('not.have.attr', 'disabled')
      cy.getByTestID('button_confirm_send_continue').click()
      // Check address and amount in confirm send page
      cy.getByTestID('address_input').should('have.value', newAddress)
      cy.getByTestID('amount_input').should('have.value', newAmount)
      cy.getByTestID('confirm_title').contains('You are sending')
      cy.getByTestID('button_confirm_send').click().wait(3000)
      // Check for authorization page description
      cy.getByTestID('txn_authorization_description')
        .contains(`Sending ${new BigNumber(newAmount).toFixed(8)} DFI`)
      cy.closeOceanInterface()
    })
  })

  describe('dBTC', function () {
    addresses.forEach(function (address) {
      it(`should be able to send to address ${address}`, function () {
        cy.getByTestID('bottom_tab_balances').click()
        cy.getByTestID('balances_list').should('exist')
        cy.getByTestID('balances_row_1').should('exist')
        cy.getByTestID('balances_row_1_amount').contains(10).click()
        cy.getByTestID('send_button').click()
        cy.getByTestID('address_input').type(address)
        cy.getByTestID('MAX_amount_button').click()
        cy.getByTestID('button_confirm_send_continue').click()
        cy.getByTestID('button_confirm_send').click().wait(3000)
        cy.closeOceanInterface()
        cy.getByTestID('balances_row_1_amount').should('not.exist')

        cy.sendTokenToWallet(['BTC']).wait(3000)
      })
    })
  })

  describe('BTC-DFI', function () {
    addresses.forEach(function (address) {
      it(`should be able to send to address ${address}`, function () {
        cy.getByTestID('bottom_tab_balances').click()
        cy.getByTestID('balances_list').should('exist')
        cy.getByTestID('balances_row_17').should('exist')
        cy.getByTestID('balances_row_17_amount').contains(10).click()
        cy.getByTestID('send_button').click()
        cy.getByTestID('lp_info_text').should('exist')
        cy.getByTestID('address_input').type(address)
        cy.getByTestID('MAX_amount_button').click()
        cy.getByTestID('button_confirm_send_continue').click()
        cy.getByTestID('button_confirm_send').should('have.attr', 'aria-disabled')
        cy.getByTestID('lp_ack_switch').click()
        cy.getByTestID('button_confirm_send').click().wait(3000)
        cy.closeOceanInterface()
        cy.getByTestID('balances_row_17_amount').should('not.exist')

        cy.sendTokenToWallet(['BTC-DFI']).wait(3000)
      })
    })
  })
})

context('Wallet - Send - Max Values', function () {
  let whale: WhaleApiClient

  const addresses = ['bcrt1q6np0fh47ykhznjhrtfvduh73cgjg32yac8t07d', 'bcrt1qyynghf6xv66c7zewd6aansn9j9hy3q2hsl7ms7']
  beforeEach(function () {
    const network = localStorage.getItem('Development.NETWORK')
    whale = new WhaleApiClient({
      url: network === 'Playground' ? 'https://playground.defichain.com' : 'http://localhost:19553',
      network: 'regtest',
      version: 'v0'
    })
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().wait(3000)
    cy.getByTestID('bottom_tab_balances').click()
  })

  addresses.forEach(function (address) {
    it(`should be able to send to address ${address}`, function () {
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('balances_list').should('exist')
      cy.getByTestID('dfi_balance_card').should('exist')
      cy.getByTestID('details_DFI').click()
      cy.getByTestID('send_dfi_button').click()
      cy.getByTestID('address_input').clear().type(address)
      cy.getByTestID('MAX_amount_button').click()
      cy.getByTestID('button_confirm_send_continue').should('not.have.attr', 'disabled')
      cy.getByTestID('button_confirm_send_continue').click()
      cy.getByTestID('confirm_title').contains('You are sending')
      cy.getByTestID('text_send_amount').contains('9.90000000')
      cy.getByTestID('text_send_amount_suffix').contains('DFI')
      cy.getByTestID('button_confirm_send').click().wait(3000)
      cy.closeOceanInterface()
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('dfi_utxo_amount').contains('0.09')
    })

    it(`should check if exist on other side ${address}`, function () {
      cy.wrap(whale.address.getBalance(address)).then((response) => {
        expect(response).contains('9.90000000')
      })
    })
  })
})

context('Wallet - Send - with Conversion', function () {
  let whale: WhaleApiClient

  const addresses = ['bcrt1qh5callw3zuxtnks96ejtekwue04jtnm84f04fn', 'bcrt1q6ey8k3w0ll3cn5sg628nxthymd3une2my04j4n']
  beforeEach(function () {
    const network = localStorage.getItem('Development.NETWORK')
    whale = new WhaleApiClient({
      url: network === 'Playground' ? 'https://playground.defichain.com' : 'http://localhost:19553',
      network: 'regtest',
      version: 'v0'
    })
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendDFITokentoWallet().wait(3000)
    cy.getByTestID('bottom_tab_balances').click()
  })

  addresses.forEach(function (address) {
    it(`should be able to send to address ${address}`, function () {
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('balances_list').should('exist')
      cy.getByTestID('dfi_balance_card').should('exist')
      cy.getByTestID('details_DFI').click()
      cy.getByTestID('send_dfi_button').click()
      cy.getByTestID('address_input').clear().type(address)
      cy.getByTestID('transaction_details_info_text').should('contain', 'Review full transaction details in the next screen')
      cy.getByTestID('amount_input').type('12')
      cy.getByTestID('conversion_info_text').should('exist')
      cy.getByTestID('conversion_info_text').should('contain', 'Conversion will be required. Your passcode will be asked to authorize both transactions.')
      cy.getByTestID('text_amount_to_convert_label').should('exist')
      cy.getByTestID('text_amount_to_convert_label').should('contain', 'UTXO to be converted')
      cy.getByTestID('text_amount_to_convert').should('contain', '2.10000000')
      cy.getByTestID('transaction_details_info_text').should('contain', 'Authorize transaction in the next screen to convert')
      cy.getByTestID('button_confirm_send_continue').click()
      cy.getByTestID('txn_authorization_description')
        .contains(`Converting ${new BigNumber('2.1').toFixed(8)} Token to UTXO`)
      cy.closeOceanInterface().wait(3000)
      cy.getByTestID('conversion_tag').should('exist')
      cy.getByTestID('text_send_amount').should('contain', '12.00000000')
      cy.getByTestID('button_confirm_send').click().wait(3000)
      cy.closeOceanInterface()
    })

    it(`should check if exist on other side ${address}`, function () {
      cy.wrap(whale.address.getBalance(address)).then((response) => {
        expect(response).contains('12.00000000')
      })
    })
  })
})

context('Wallet - Send - Switch token', function () {
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(['BTC', 'ETH'])
      .wait(3000)
    cy.getByTestID('bottom_tab_balances').click()
  })

  it('should be able to select token', function () {
    cy.getByTestID('send_balance_button').click()
    cy.getByTestID('select_token_placeholder').should('exist')
    cy.getByTestID('button_confirm_send_continue').should('have.attr', 'aria-disabled')
    cy.getByTestID('select_token_input').click()
    cy.getByTestID('select_DFI_value').should('have.text', '20.00000000')
    cy.getByTestID('select_dBTC_value').should('have.text', '10.00000000')
    cy.getByTestID('select_dETH_value').should('have.text', '10.00000000')
    cy.wait(3000) // timeout to allow max. one block-cycle of re-render
    cy.getByTestID('select_DFI').click()
    cy.getByTestID('selected_token').should('have.text', 'DFI')
    cy.getByTestID('max_value').contains('DFI')
  })

  it('should be able to switch token', function () {
    cy.getByTestID('select_token_input').click()
    cy.wait(3000) // timeout to allow max. one block-cycle of re-render
    cy.getByTestID('select_dBTC').click()
    cy.getByTestID('selected_token').should('have.text', 'dBTC')
    cy.getByTestID('max_value').contains('dBTC')
    cy.getByTestID('button_confirm_send_continue').should('have.attr', 'aria-disabled')
  })

  it('should be able to pre-select token', function () {
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('balances_row_2').should('exist')
    cy.getByTestID('balances_row_2_amount').contains(10).click()
    cy.getByTestID('send_button').click()
    cy.getByTestID('selected_token').should('have.text', 'dETH')
    cy.getByTestID('max_value').contains('dETH')
  })

  it('should be able to enable/disable token selection', function () {
    cy.getByTestID('bottom_tab_balances').click()
    cy.createEmptyWallet(true)

    // No token
    cy.getByTestID('details_DFI').click()
    cy.getByTestID('send_dfi_button').click()
    cy.getByTestID('select_token_input').should('have.attr', 'aria-disabled')

    // With DFI
    cy.getByTestID('bottom_tab_balances').click()
    cy.sendDFITokentoWallet().wait(3000)
    cy.getByTestID('send_dfi_button').click()
    cy.getByTestID('select_token_placeholder').should('not.exist')
    cy.getByTestID('selected_token').should('have.text', 'DFI')

    // With DFI and other token
    cy.getByTestID('bottom_tab_balances').click()
    cy.sendTokenToWallet(['BTC']).wait(3000)
    cy.getByTestID('send_dfi_button').click()
    cy.getByTestID('select_token_placeholder').should('not.exist')
    cy.getByTestID('selected_token').should('have.text', 'DFI')

    // No DFI, with other token
    cy.getByTestID('bottom_tab_balances').click()
    cy.createEmptyWallet(true).wait(3000)
    cy.sendTokenToWallet(['BTC']).wait(3000)
    cy.getByTestID('details_DFI').click()
    cy.getByTestID('send_dfi_button').click()
    cy.getByTestID('select_token_input').should('not.have.attr', 'aria-disabled')
    cy.getByTestID('select_token_placeholder').should('exist')
  })
})
