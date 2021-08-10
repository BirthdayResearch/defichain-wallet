import { WhaleApiClient } from '@defichain/whale-api-client'
import BigNumber from 'bignumber.js'

context('Wallet - Send', () => {
  // bech32, p2sh, legacy
  const addresses = ['bcrt1q8rfsfny80jx78cmk4rsa069e2ckp6rn83u6ut9', '2MxnNb1MYSZvS3c26d4gC7gXsNMkB83UoXB', 'n1xjm9oekw98Rfb3Mv4ApyhwxC5kMuHnCo']
  let network: string
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendTokenToWallet(['BTC', 'DFI-BTC']).wait(10000)
    cy.getByTestID('bottom_tab_balances').click()
    network = localStorage.getItem('Development.NETWORK')
  })

  describe('DFI UTXO', () => {
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
        const transactionFee = $txt[0].textContent.replace(' DFI', '')
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
        const transactionFee = $txt[0].textContent.replace(' DFI', '')
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

    addresses.forEach((address) => {
      it(`should be able to send to address ${address}`, function () {
        cy.getByTestID('address_input').clear().type(address)
        cy.getByTestID('amount_input').clear().type('1')
        cy.getByTestID('send_submit_button').should('not.have.attr', 'disabled')
        cy.getByTestID('send_submit_button').click()
        cy.closeOceanInterface()
        cy.fetchWalletBalance()
        cy.getByTestID('bottom_tab_balances').click()
      })

      it(`should check if exist on other side ${address}`, function () {
        const whale = new WhaleApiClient({
          url: network === 'Playground' ? 'https://playground.defichain.com' : 'http://localhost:19553',
          network: 'regtest'
        })
        cy.wrap(whale.address.getBalance(address)).then((response) => {
          expect(response).eq('1.00000000')
        })
      })

      it('should return to balances and resume send flow', function () {
        cy.getByTestID('balances_row_0_utxo_amount').click()
        cy.getByTestID('send_button').click()
      })
    })
  })

  describe('dBTC', () => {
    addresses.forEach((address) => {
      it(`should be able to send to address ${address}`, function () {
        cy.getByTestID('bottom_tab_balances').click()
        cy.getByTestID('balances_list').should('exist')
        cy.getByTestID('balances_row_1').should('exist')
        cy.getByTestID('balances_row_1_amount').contains(10).click()
        cy.getByTestID('send_button').click()
        cy.getByTestID('address_input').type(address)
        cy.getByTestID('MAX_amount_button').click()
        cy.getByTestID('send_submit_button').click()
        cy.closeOceanInterface()
        cy.fetchWalletBalance()
        cy.getByTestID('bottom_tab_balances').click()
        cy.getByTestID('balances_row_1_amount').should('not.exist')

        cy.sendTokenToWallet(['BTC']).wait(10000)
      })
    })
  })

  describe('DFI-BTC', () => {
    addresses.forEach((address) => {
      it(`should be able to send to address ${address}`, function () {
        cy.getByTestID('bottom_tab_balances').click()
        cy.getByTestID('balances_list').should('exist')
        cy.getByTestID('balances_row_6').should('exist')
        cy.getByTestID('balances_row_6_amount').contains(10).click()
        cy.getByTestID('send_button').click()
        cy.getByTestID('address_input').type(address)
        cy.getByTestID('MAX_amount_button').click()
        cy.getByTestID('send_submit_button').click()
        cy.closeOceanInterface()
        cy.fetchWalletBalance()
        cy.getByTestID('bottom_tab_balances').click()
        cy.getByTestID('balances_row_6_amount').should('not.exist')

        cy.sendTokenToWallet(['DFI-BTC']).wait(10000)
      })
    })
  })
})
