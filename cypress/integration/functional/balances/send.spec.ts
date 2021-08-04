import BigNumber from 'bignumber.js'

context('wallet/send', () => {
  // bech32, p2sh, legacy
  const addresses = ['bcrt1q8rfsfny80jx78cmk4rsa069e2ckp6rn83u6ut9', '2MxnNb1MYSZvS3c26d4gC7gXsNMkB83UoXB', 'n1xjm9oekw98Rfb3Mv4ApyhwxC5kMuHnCo']
  let network: string
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendTokenToWallet(['BTC']).wait(10000)
    cy.getByTestID('playground_wallet_fetch_balances').click()
    cy.getByTestID('bottom_tab_balances').click()
    network = localStorage.getItem('Development.NETWORK')
  })

  describe('DFI UTXO', () => {
    it('should be able to validate form', function () {
      cy.getByTestID('balances_list').should('exist')
      cy.getByTestID('balances_row_0_utxo').should('exist')
      cy.getByTestID('balances_row_0_utxo_amount').contains(10).click()
      cy.getByTestID('send_button').click()

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
        cy.getByTestID('playground_wallet_fetch_balances').click()
        cy.getByTestID('bottom_tab_balances').click()
      })

      it(`should check if exist on other side ${address}`, function () {
        // TODO(jj): we should inject a WhaleClient into cypress global for operations
        //  such as this as versioning is automatically handled there
        let url: string
        if (network === 'Playground') {
          url = 'https://playground.defichain.com/v0.8/regtest'
        } else {
          url = 'http://localhost:19553/v0.8/regtest'
        }
        cy.request(`${url}/address/${address}/balance`).then((response) => {
          expect(response.body).to.have.property('data', '1.00000000')
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
        cy.getByTestID('playground_wallet_fetch_balances').click()
        cy.getByTestID('bottom_tab_balances').click()
        cy.getByTestID('balances_row_1_amount').should('not.exist')

        cy.sendTokenToWallet(['BTC']).wait(10000)
        cy.getByTestID('playground_wallet_fetch_balances').click()
      })
    })
  })
})
