import BigNumber from 'bignumber.js'

context('wallet/send', () => {
  let address: string

  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('balances_row_0_utxo').click()
    cy.getByTestID('receive_button').click()
    cy.getByTestID('address_text').then(($txt: any) => {
      // store random address
      address = $txt[0].textContent

      cy.getByTestID('bottom_tab_settings').click()
      cy.getByTestID('setting_exit_wallet').click()
      cy.createEmptyWallet(true)
      cy.sendDFItoWallet().sendTokenToWallet(['BTC']).wait(10000)
      cy.getByTestID('playground_wallet_fetch_balances').click()
      cy.getByTestID('bottom_tab_balances').click()
    })
  })

  describe('DFI UTXO', () => {
    it('should be able to validate form', function () {
      cy.getByTestID('balances_list').should('exist')
      cy.getByTestID('balances_row_0_utxo').should('exist')
      cy.getByTestID('balances_row_0_utxo_amount').contains(10).click()
      cy.getByTestID('send_button').click()

      // Valid form
      cy.getByTestID('address_input').type(address)
      cy.getByTestID('amount_input').type('0.1')
      cy.getByTestID('send_submit_button').should('not.have.attr', 'disabled')

      // Invalid address
      cy.getByTestID('address_input').type('z')
      cy.getByTestID('send_submit_button').should('have.attr', 'disabled')

      // Invalid amount - Character, over max amount, zero
      cy.getByTestID('address_input').clear().type(address)
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

    it('should be able to compute max values', function () {
      cy.getByTestID('transaction_fee').then(($txt: any) => {
        const transactionFee = $txt[0].textContent.replace(' DFI', '')
        cy.getByTestID('max_value').then(($txt: any) => {
          const maxValue = $txt[0].textContent.replace(' DFI', '')
          expect(new BigNumber(transactionFee).plus(maxValue).toFixed(0)).eq('10')
          cy.getByTestID('amount_input').clear()
          cy.getByTestID('max_button').click()
          cy.getByTestID('amount_input').should('have.value', maxValue)
          cy.getByTestID('send_submit_button').should('not.have.attr', 'disabled')
        })
      })
    })

    it('should be able to send', function () {
      cy.getByTestID('amount_input').clear().type('1')
      cy.getByTestID('send_submit_button').click()
      cy.wait(5000).getByTestID('oceanInterface_close').click().wait(5000)
      cy.getByTestID('playground_wallet_fetch_balances').click()
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('balances_row_0_utxo_amount').contains('8.999')
    })

    it('check if exist on other side', function () {
      const network = localStorage.getItem('Development.NETWORK')
      let url: string
      if (network === 'Playground') {
        url = 'https://playground.defichain.com/'
      } else {
        url = 'http://localhost:19553/'
      }
      cy.request(`${url}v0/regtest/address/${address}/balance`).then((response) => {
        expect(response.body).to.have.property('data', '1.00000000')
      })
    })
  })

  describe('dBTC', () => {
    it('should be able to send', function () {
      cy.getByTestID('balances_list').should('exist')
      cy.getByTestID('balances_row_1').should('exist')
      cy.getByTestID('balances_row_1_amount').contains(10).click()
      cy.getByTestID('send_button').click()
      cy.getByTestID('address_input').type(address)
      cy.getByTestID('max_button').click()
      cy.getByTestID('send_submit_button').click()
      cy.wait(5000).getByTestID('oceanInterface_close').click().wait(5000)
      cy.getByTestID('playground_wallet_fetch_balances').click()
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('balances_row_1_amount').should('not.exist')
    })
  })
})
