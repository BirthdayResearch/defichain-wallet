import { WhaleApiClient } from '@defichain/whale-api-client'
import BigNumber from 'bignumber.js'

context('Wallet - Send', function () {
  let whale: WhaleApiClient
  beforeEach(function () {
    cy.restoreLocalStorage()
    const network = localStorage.getItem('Development.NETWORK')
    whale = new WhaleApiClient({
      url: network === 'Playground' ? 'https://playground.defichain.com' : 'http://localhost:19553',
      network: 'regtest'
    })
  })

  afterEach(function () {
    cy.saveLocalStorage()
  })
  // bech32, p2sh, legacy
  const addresses = ['bcrt1q8rfsfny80jx78cmk4rsa069e2ckp6rn83u6ut9', '2MxnNb1MYSZvS3c26d4gC7gXsNMkB83UoXB', 'n1xjm9oekw98Rfb3Mv4ApyhwxC5kMuHnCo']
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendTokenToWallet(['BTC', 'DFI-BTC']).wait(3000)
    cy.getByTestID('bottom_tab_balances').click()
  })

  describe('DFI UTXO', function () {
    it('should be able redirect to QR screen page', function () {
      cy.getByTestID('balances_list').should('exist')
      cy.getByTestID('balances_row_0_utxo').should('exist')
      cy.getByTestID('balances_row_0_utxo_amount').contains(10).click()
      cy.getByTestID('send_button').click()
      cy.getByTestID('qr_code_button').click()
      cy.url().should('include', 'app/BarCodeScanner')
      cy.go('back')
    })

    it('should be able to validate form', function () {
      // Valid form
      cy.getByTestID('address_input').type(addresses[0])
      cy.getByTestID('amount_input').type('0.1')
      cy.getByTestID('send_submit_button').should('not.have.attr', 'disabled')

      // Invalid address
      cy.getByTestID('address_input').type('z')
      cy.getByTestID('send_submit_button').should('have.attr', 'disabled')

      // Invalid amount - Character, over max amount, zero
      cy.getByTestID('address_input').clear().type(addresses[0])
      cy.getByTestID('amount_input').clear().type('a')
      cy.getByTestID('send_submit_button').should('have.attr', 'disabled')
      cy.getByTestID('amount_input').clear().type('12')
      cy.getByTestID('send_submit_button').should('have.attr', 'disabled')
      cy.getByTestID('amount_input').clear().type('0')
      cy.getByTestID('send_submit_button').should('have.attr', 'disabled')
    })

    it('should be able to display elements', function () {
      cy.getByTestID('qr_code_button').should('be.visible')
      cy.getByTestID('token_symbol').should('contain', 'DFI')
    })

    it('should be able to compute for max values', function () {
      cy.getByTestID('transaction_fee').then(($txt: any) => {
        const transactionFee = $txt[0].textContent.replace(' DFI (UTXO)', '')
        cy.getByTestID('max_value').then(($txt: any) => {
          const maxValue = $txt[0].textContent.replace(' DFI', '')
          expect(new BigNumber(transactionFee).plus(maxValue).toFixed(0)).eq('10')
          cy.getByTestID('amount_input').clear()
          cy.getByTestID('MAX_amount_button').click()
          cy.getByTestID('amount_input').should('have.value', maxValue)
          cy.getByTestID('send_submit_button').should('not.have.attr', 'disabled')
        })
      })
    })

    it('should be able to compute half of max values', function () {
      cy.getByTestID('transaction_fee').then(($txt: any) => {
        const transactionFee = $txt[0].textContent.replace(' DFI (UTXO)', '')
        cy.getByTestID('max_value').then(($txt: any) => {
          const maxValue = $txt[0].textContent.replace(' DFI', '')
          const halfValue = new BigNumber(maxValue).div(2)
          expect(new BigNumber(halfValue).multipliedBy(2).plus(transactionFee).toFixed(0)).eq('10')
          cy.getByTestID('amount_input').clear()
          cy.getByTestID('50%_amount_button').click()
          cy.getByTestID('amount_input').should('have.value', halfValue.toFixed(8))
          cy.getByTestID('send_submit_button').should('not.have.attr', 'disabled')
        })
      })
    })

    it('should be able to check txn details and compute pending balance', function () {
      cy.getByTestID('transaction_fee').invoke('text').then(transactionValue => {
        const transactionFee = transactionValue.replace(' DFI (UTXO)', '')
        cy.getByTestID('max_value').invoke('text').then((balanceValue) => {
          const balance = balanceValue.replace(' DFI', '')
          const sendAmount = '1'
          cy.getByTestID('amount_input').clear().type(sendAmount)
          cy.getByTestID('send_submit_button').click()
          // Check txn value
          cy.getByTestID('text_amount').invoke('text').then((textAmount) => {
            const amount = textAmount.replace(' DFI', '')
            expect(new BigNumber(amount).toFixed(8)).eq(new BigNumber(sendAmount).toFixed(8))
          })
          // Check network value
          cy.getByTestID('header_active_network').first().invoke('text').then((headerNetworkValue) => {
            cy.getByTestID('text_network').invoke('text').then((networkValue) => {
              expect(headerNetworkValue).eq(networkValue)
            })
          })
          // Check txn value
          cy.getByTestID('text_fee').invoke('text').then((textFeeValue) => {
            const textFee = textFeeValue.replace(' DFI (UTXO)', '')
            expect(new BigNumber(transactionFee).toFixed(8)).eq(new BigNumber(textFee).toFixed(8))
          })
          // Check computed pending balance
          cy.getByTestID('text_balance').invoke('text').then((pendingBalanceValue) => {
            const pendingBalance = pendingBalanceValue.replace(' DFI', '')
            expect(new BigNumber(balance).minus(transactionFee).minus(sendAmount).toFixed(8)).eq(pendingBalance)
          })
        })
      })
    })

    addresses.forEach(function (address) {
      it(`should be able to send to address ${address}`, function () {
        cy.getByTestID('bottom_tab_balances').click()
        cy.getByTestID('balances_list').should('exist')
        cy.getByTestID('balances_row_0_utxo').should('exist')
        cy.getByTestID('balances_row_0_utxo_amount').click()
        cy.getByTestID('send_button').click()
        cy.getByTestID('address_input').clear().type(address)
        cy.getByTestID('amount_input').clear().type('1')
        cy.getByTestID('send_submit_button').should('not.have.attr', 'disabled')
        cy.getByTestID('send_submit_button').click()
        cy.getByTestID('confirm_title').contains('YOU ARE SENDING')
        // Cancel button
        cy.getByTestID('button_cancel_send').click()
        cy.getByTestID('address_input').should('exist')

        cy.getByTestID('send_submit_button').click()
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
      cy.getByTestID('balances_row_0_utxo').should('exist')
      cy.getByTestID('balances_row_0_utxo_amount').click()
      cy.getByTestID('send_button').click()
      cy.getByTestID('address_input').clear().type(oldAddress)
      cy.getByTestID('amount_input').clear().type(oldAmount)
      cy.getByTestID('send_submit_button').should('not.have.attr', 'disabled')
      cy.getByTestID('send_submit_button').click()
      cy.getByTestID('confirm_title').contains('YOU ARE SENDING')
      cy.getByTestID('button_confirm_send').click().wait(3000)
      // Check for authorization page description
      cy.getByTestID('txn_authorization_description')
        .contains(`Sending ${new BigNumber(oldAmount).toFixed(8)} DFI`)
      // Cancel send on authorisation page
      cy.getByTestID('cancel_authorization').contains('CANCEL').click()
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
      cy.getByTestID('send_submit_button').should('not.have.attr', 'disabled')
      cy.getByTestID('send_submit_button').click()
      // Check address and amount in confirm send page
      cy.getByTestID('address_input').should('have.value', newAddress)
      cy.getByTestID('amount_input').should('have.value', newAmount)
      cy.getByTestID('confirm_title').contains('YOU ARE SENDING')
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
        cy.getByTestID('send_submit_button').click()
        cy.getByTestID('button_confirm_send').click().wait(3000)
        cy.closeOceanInterface()
        cy.getByTestID('balances_row_1_amount').should('not.exist')

        cy.sendTokenToWallet(['BTC']).wait(3000)
      })
    })
  })

  describe('DFI-BTC', function () {
    addresses.forEach(function (address) {
      it(`should be able to send to address ${address}`, function () {
        cy.getByTestID('bottom_tab_balances').click()
        cy.getByTestID('balances_list').should('exist')
        cy.getByTestID('balances_row_6').should('exist')
        cy.getByTestID('balances_row_6_amount').contains(10).click()
        cy.getByTestID('send_button').click()
        cy.getByTestID('address_input').type(address)
        cy.getByTestID('MAX_amount_button').click()
        cy.getByTestID('send_submit_button').click()
        cy.getByTestID('button_confirm_send').click().wait(3000)
        cy.closeOceanInterface()
        cy.getByTestID('balances_row_6_amount').should('not.exist')

        cy.sendTokenToWallet(['DFI-BTC']).wait(3000)
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
      network: 'regtest'
    })
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().wait(3000)
    cy.getByTestID('bottom_tab_balances').click()
  })

  addresses.forEach(function (address) {
    it(`should be able to send to address ${address}`, function () {
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('balances_list').should('exist')
      cy.getByTestID('balances_row_0_utxo').should('exist')
      cy.getByTestID('balances_row_0_utxo_amount').click()
      cy.getByTestID('send_button').click()
      cy.getByTestID('address_input').clear().type(address)
      cy.getByTestID('MAX_amount_button').click()
      cy.getByTestID('send_submit_button').should('not.have.attr', 'disabled')
      cy.getByTestID('send_submit_button').click()
      cy.getByTestID('confirm_title').contains('YOU ARE SENDING')
      cy.getByTestID('text_send_amount').contains('9.90000000 DFI')
      cy.getByTestID('button_confirm_send').click().wait(3000)
      cy.closeOceanInterface()
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('balances_row_0_utxo_amount').contains('0.09')
    })

    it(`should check if exist on other side ${address}`, function () {
      cy.wrap(whale.address.getBalance(address)).then((response) => {
        expect(response).contains('9.90000000')
      })
    })
  })
})
