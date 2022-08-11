import { WhaleApiClient } from '@defichain/whale-api-client'
import BigNumber from 'bignumber.js'

const validateAmountButtonResult = (value: string, usdValue: string): void => {
  cy.getByTestID('amount_input').should('have.value', value)

  const usdValueWithThousandSep = Number(usdValue).toLocaleString(undefined, {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  })
  cy.getByTestID('amount_input_in_usd').should('have.text', `$${usdValueWithThousandSep}`)
}

const validateInfotext = (infoTextType: 'insufficient_balance' | 'lp_warning' | 'utxo_warning' | 'minimal_fee_warning'): void => {
  const infoText = {
    insufficient_balance: 'Insufficient balance',
    lp_warning: 'Make sure to send your LP Tokens to only DeFiChain-compatible wallets. Failing to do so may lead to irreversible loss of funds',
    utxo_warning: 'A small amount of UTXO is reserved for fees',
    minimal_fee_warning: 'There is a minimal fee for the transaction'
  }
  cy.getByTestID('info_text').should('have.text', infoText[infoTextType])
}

context('Wallet - Send', function () {
  let whale: WhaleApiClient
  beforeEach(function () {
    cy.restoreLocalStorage()
    const network = localStorage.getItem('Development.NETWORK')
    whale = new WhaleApiClient({
      url: network === 'Playground' ? 'https://playground.jellyfishsdk.com' : 'http://localhost:19553',
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
    cy.sendDFItoWallet().sendTokenToWallet(['BTC', 'BTC-DFI']).wait(4000)
    cy.getByTestID('bottom_tab_portfolio').click()
  })

  describe('DFI UTXO', function () {
    it('should be able redirect to QR screen page', function () {
      cy.getByTestID('portfolio_list').should('exist')
      cy.getByTestID('action_button_group').should('exist')
      cy.getByTestID('send_balance_button').click().wait(3000)
      cy.getByTestID('select_DFI').click().wait(3000)
      cy.getByTestID('qr_code_button').click()
      cy.url().should('include', 'app/BarCodeScanner')
      cy.go('back')
    })

    it('should be able to validate form', function () {
      // Valid form
      cy.getByTestID('address_input').type(addresses[0])
      cy.getByTestID('amount_input').type('0.1')
      cy.getByTestID('button_confirm_send_continue').should('not.have.attr', 'disabled')
      cy.getByTestID('amount_input').clear()

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

    it('should be able to search for tokens', function () {
      cy.getByTestID('select_token_input').click()

      // empty result
      cy.getByTestID('token_search_input').clear().type('xxx').wait(2000)
      cy.getByTestID('empty_search_result_text').should('have.text', 'Search results for “xxx“')
      cy.getByTestID('select_DFI').should('not.exist')
      cy.getByTestID('select_dBTC-DFI').should('not.exist')

      // has result
      cy.getByTestID('token_search_input').clear().type('btc').wait(2000)
      cy.getByTestID('empty_search_result_text').should('not.exist')
      cy.getByTestID('select_DFI').should('not.exist')
      cy.getByTestID('select_dBTC-DFI').should('exist')
      cy.getByTestID('token_search_input').clear().wait(2000)
      cy.getByTestID('select_DFI').click().wait(3000)
    })

    it('should be able to display elements', function () {
      cy.getByTestID('qr_code_button').should('be.visible')
    })

    it('should be able to display info text when sending UTXO', function () {
      // zero
      cy.getByTestID('amount_input').clear().type('0')
      validateInfotext('minimal_fee_warning')

      // invalid
      cy.getByTestID('amount_input').clear().type('xx')
      validateInfotext('minimal_fee_warning')

      // max amount
      cy.getByTestID('MAX_amount_button').click()
      validateInfotext('utxo_warning')

      // over max amount
      cy.getByTestID('amount_input').clear().type('12')
      validateInfotext('insufficient_balance')
    })

    it('should be able to compute amount from amount buttons', function () {
      const amountButtons = {
        '25%': 0.25,
        '50%': 0.50,
        '75%': 0.75,
        MAX: 1
      }
      const amountButtonList = Object.keys(amountButtons) as Array<keyof typeof amountButtons>
      amountButtonList.forEach((key) => {
        cy.getByTestID('max_value').invoke('text').then((text) => {
          cy.getByTestID(`${key}_amount_button`).click()
          const availableBalance = new BigNumber(text)
          const inputAfterButtonPress = availableBalance.multipliedBy(amountButtons[key])
          validateAmountButtonResult(inputAfterButtonPress.toFixed(8), inputAfterButtonPress.multipliedBy(10000).toFixed(2))
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
        cy.getByTestID('bottom_tab_portfolio').click()
        cy.getByTestID('portfolio_list').should('exist')
        cy.getByTestID('send_balance_button').click().wait(3000)
        cy.getByTestID('select_DFI').click().wait(3000)
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
      cy.getByTestID('bottom_tab_portfolio').click()
      cy.getByTestID('portfolio_list').should('exist')
      cy.getByTestID('send_balance_button').click().wait(3000)
      cy.getByTestID('select_DFI').click().wait(3000)
      cy.getByTestID('address_input').clear().type(oldAddress)
      cy.getByTestID('amount_input').clear().type(oldAmount)
      cy.getByTestID('button_confirm_send_continue').should('not.have.attr', 'disabled')
      cy.getByTestID('button_confirm_send_continue').click()

      // Summary title
      cy.getByTestID('confirm_title').contains('You are sending')
      cy.getByTestID('text_send_amount').should('have.text', new BigNumber(oldAmount).toFixed(8))

      // Address
      cy.getByTestID('summary_to_value').should('have.text', oldAddress)

      // Transaction details
      cy.getByTestID('transaction_fee_label').should('have.text', 'Transaction fee')
      cy.getByTestID('transaction_fee_value').should('exist')
      cy.getByTestID('text_amount_label').should('have.text', 'Amount to send')
      cy.getByTestID('text_amount').contains(oldAmount)
      const usdValueWithThousandSep = Number(new BigNumber(oldAmount).multipliedBy(10000).toFixed(2)).toLocaleString(undefined, {
        minimumFractionDigits: 2, maximumFractionDigits: 2
      })
      cy.getByTestID('text_amount_rhsUsdAmount').should('have.text', `$${usdValueWithThousandSep}`)
      cy.getByTestID('button_confirm_send').click().wait(5000)

      // Check for authorization page description
      cy.getByTestID('txn_authorization_title')
        .contains(`Sending ${new BigNumber(oldAmount).toFixed(8)} DFI to ${oldAddress}`)
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
      cy.getByTestID('txn_authorization_title')
        .contains(`Sending ${new BigNumber(newAmount).toFixed(8)} DFI to ${newAddress}`)
      cy.closeOceanInterface()
    })
  })

  describe('dBTC', function () {
    addresses.forEach(function (address) {
      it(`should be able to send to address ${address}`, function () {
        cy.getByTestID('bottom_tab_portfolio').click()
        cy.getByTestID('portfolio_list').should('exist')
        cy.getByTestID('portfolio_row_1').should('exist')
        cy.getByTestID('portfolio_row_1_amount').contains(10).click()
        cy.getByTestID('send_button').click()
        cy.getByTestID('address_input').type(address)
        cy.getByTestID('MAX_amount_button').click()
        cy.getByTestID('button_confirm_send_continue').click()
        cy.getByTestID('button_confirm_send').click().wait(3000)
        cy.closeOceanInterface()
        cy.getByTestID('portfolio_row_1_amount').should('not.exist')

        cy.sendTokenToWallet(['BTC']).wait(3000)
      })
    })
  })

  describe('BTC-DFI', function () {
    addresses.forEach(function (address) {
      it(`should be able to send to address ${address}`, function () {
        cy.getByTestID('bottom_tab_portfolio').click()
        cy.getByTestID('portfolio_list').should('exist')
        cy.getByTestID('portfolio_row_17').should('exist')
        cy.getByTestID('portfolio_row_17_amount').contains(10).click()
        cy.getByTestID('send_button').click()
        validateInfotext('minimal_fee_warning')
        cy.getByTestID('address_input').type(address)
        cy.getByTestID('MAX_amount_button').click()
        cy.getByTestID('button_confirm_send_continue').click()
        cy.getByTestID('button_confirm_send').should('have.attr', 'aria-disabled')
        cy.getByTestID('lp_ack_switch').click()
        cy.getByTestID('button_confirm_send').click().wait(3000)
        cy.closeOceanInterface()
        cy.getByTestID('portfolio_row_17_amount').should('not.exist')

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
      url: network === 'Playground' ? 'https://playground.jellyfishsdk.com' : 'http://localhost:19553',
      network: 'regtest',
      version: 'v0'
    })
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().wait(4000)
    cy.getByTestID('bottom_tab_portfolio').click()
  })

  addresses.forEach(function (address) {
    it(`should be able to send to address ${address}`, function () {
      cy.getByTestID('bottom_tab_portfolio').click()
      cy.getByTestID('portfolio_list').should('exist')
      cy.getByTestID('dfi_total_balance_amount').contains('10.00000000')
      cy.getByTestID('dfi_balance_card').should('exist')
      cy.getByTestID('action_button_group').should('exist')
      cy.getByTestID('send_balance_button').click().wait(3000)
      cy.getByTestID('select_DFI').click().wait(3000)
      cy.getByTestID('address_input').clear().type(address)
      cy.getByTestID('MAX_amount_button').click()
      cy.getByTestID('button_confirm_send_continue').should('not.have.attr', 'disabled')
      cy.getByTestID('button_confirm_send_continue').click()
      cy.getByTestID('confirm_title').contains('You are sending')
      cy.getByTestID('text_send_amount').contains('9.90000000')
      cy.getByTestID('text_amount').contains('9.90000000 DFI')
      const usdValueWithThousandSep = Number(new BigNumber(9.90).multipliedBy(10000).toFixed(2)).toLocaleString(undefined, {
        minimumFractionDigits: 2, maximumFractionDigits: 2
      })
      cy.getByTestID('text_amount_rhsUsdAmount').should('have.text', `$${usdValueWithThousandSep}`)
      cy.getByTestID('button_confirm_send').click().wait(3000)
      cy.closeOceanInterface()
      cy.getByTestID('bottom_tab_portfolio').click()
      cy.getByTestID('dfi_total_balance_amount').contains('0.09')
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
      url: network === 'Playground' ? 'https://playground.jellyfishsdk.com' : 'http://localhost:19553',
      network: 'regtest',
      version: 'v0'
    })
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendDFITokentoWallet().wait(4000)
    cy.getByTestID('bottom_tab_portfolio').click()
  })

  addresses.forEach(function (address) {
    it(`should be able to send to address ${address}`, function () {
      cy.getByTestID('bottom_tab_portfolio').click()
      cy.getByTestID('portfolio_list').should('exist')
      cy.getByTestID('dfi_balance_card').should('exist')
      cy.getByTestID('action_button_group').should('exist')
      cy.getByTestID('send_balance_button').click().wait(3000)
      cy.getByTestID('select_DFI').click().wait(3000)
      cy.getByTestID('address_input').clear().type(address)
      cy.getByTestID('amount_input').type('12')
      cy.getByTestID('transaction_details_info_text').should('contain', 'By continuing, the required amount of DFI will be converted')

      cy.getByTestID('button_confirm_send_continue').click()
      cy.getByTestID('txn_authorization_title')
        .contains(`Convert ${new BigNumber('2.1').toFixed(8)} DFI to UTXO`)
      cy.closeOceanInterface().wait(3000)

      cy.getByTestID('amount_to_convert_label').should('have.text', 'Amount to convert')
      cy.getByTestID('amount_to_convert_value').should('contain', '2.10000000 DFI')
      cy.getByTestID('conversion_status').should('have.text', 'Converted')
      cy.getByTestID('transaction_fee_label').should('have.text', 'Transaction fee')
      cy.getByTestID('transaction_fee_value').should('exist')

      cy.getByTestID('text_amount').should('have.text', '12.00000000 DFI')
      const usdValueWithThousandSep = Number(new BigNumber(12).multipliedBy(10000).toFixed(2)).toLocaleString(undefined, {
        minimumFractionDigits: 2, maximumFractionDigits: 2
      })
      cy.getByTestID('text_amount_rhsUsdAmount').should('have.text', `$${usdValueWithThousandSep}`)

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
      .wait(6000)
    cy.getByTestID('bottom_tab_portfolio').click()
  })

  it('should be able to select token', function () {
    cy.getByTestID('send_balance_button').click()
    cy.getByTestID('select_DFI_value').should('have.text', '19.90000000')
    cy.getByTestID('select_dBTC_value').should('have.text', '10.00000000')
    cy.getByTestID('select_dETH_value').should('have.text', '10.00000000')
    cy.wait(3000) // timeout to allow max. one block-cycle of re-render
    cy.getByTestID('select_DFI').click()
    cy.getByTestID('button_confirm_send_continue').should('have.attr', 'aria-disabled')
    cy.getByTestID('max_value').should('have.text', '19.90000000')
    cy.getByTestID('max_value_display_symbol').contains('DFI')
  })

  it('should be able to switch token', function () {
    cy.getByTestID('select_token_input').click()
    cy.wait(3000) // timeout to allow max. one block-cycle of re-render
    cy.getByTestID('select_dBTC').click()
    cy.getByTestID('max_value').should('have.text', '10.00000000')
    cy.getByTestID('max_value_display_symbol').contains('dBTC')
    cy.getByTestID('button_confirm_send_continue').should('have.attr', 'aria-disabled')
  })

  it('should be able to pre-select token', function () {
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('portfolio_list').should('exist')
    cy.getByTestID('portfolio_row_2').should('exist')
    cy.getByTestID('portfolio_row_2_amount').contains(10).click()
    cy.getByTestID('send_button').click()
    cy.getByTestID('max_value').should('have.text', '10.00000000')
    cy.getByTestID('max_value_display_symbol').contains('dETH')
  })

  it('should be able to enable/disable token selection', function () {
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.createEmptyWallet(true)

    // No token
    cy.getByTestID('action_button_group').should('exist')
    cy.getByTestID('send_balance_button').click().wait(3000)
    cy.getByTestID('no_asset_text').should('exist')
    cy.getByTestID('no_asset_sub_text').should('exist')

    // With DFI
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.sendDFITokentoWallet().wait(3000)
    cy.getByTestID('action_button_group').should('exist')
    cy.getByTestID('send_balance_button').click().wait(3000)
    cy.getByTestID('select_DFI').click().wait(3000)
    cy.getByTestID('max_value').should('have.text', '9.90000000')
    cy.getByTestID('max_value_display_symbol').contains('DFI')
  })
})

context('Wallet - Send - Address book', function () {
  function populateAddressBook (): void {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .wait(6000)
    cy.getByTestID('action_button_group').should('exist')
    cy.getByTestID('send_balance_button').click().wait(3000)
    cy.getByTestID('select_DFI').click().wait(3000)
    cy.getByTestID('address_book_button').click()
    cy.wrap(labels).each((_v, index: number) => {
      if (index === 0) {
        cy.getByTestID('button_add_address').click()
      } else {
        cy.getByTestID('add_new_address').click()
      }
      cy.getByTestID('address_book_label_input').type(labels[index])
      cy.getByTestID('address_book_label_input_error').should('not.exist')
      cy.getByTestID('address_book_address_input').clear().type(addresses[index]).blur()
      cy.getByTestID('address_book_address_input_error').should('not.exist')
      cy.getByTestID('save_address_label').click().wait(1000)
      cy.getByTestID('pin_authorize').type('000000').wait(2000)
      validateMatchAddress(addresses[index], labels[index])
      cy.getByTestID('address_book_button').click()
      cy.getByTestID(`address_row_label_${index}_WHITELISTED`).contains(labels[index])
      cy.getByTestID(`address_row_text_${index}_WHITELISTED`).contains(addresses[index])
    })
  }

  function validateMatchAddress (address: string, label: string): void {
    cy.getByTestID('address_input').contains(address)
    cy.getByTestID('address_input_footer').contains(label)
  }

  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .wait(6000)
    cy.getByTestID('bottom_tab_portfolio').click()
  })
  const labels = ['Light', 'Wallet', '🪨']
  const addresses = ['bcrt1q8rfsfny80jx78cmk4rsa069e2ckp6rn83u6ut9', '2MxnNb1MYSZvS3c26d4gC7gXsNMkB83UoXB', 'n1xjm9oekw98Rfb3Mv4ApyhwxC5kMuHnCo']

  it('should be able to open address book', function () {
    cy.getByTestID('action_button_group').should('exist')
    cy.getByTestID('send_balance_button').click().wait(3000)
    cy.getByTestID('select_DFI').click().wait(3000)
    cy.getByTestID('address_book_button').click()
    cy.getByTestID('address_row_0_WHITELISTED').should('not.exist')
    cy.getByTestID('button_add_address').should('exist')
  })

  it('should be able to validate add new address form', function () {
    cy.getByTestID('button_add_address').click()
    cy.getByTestID('save_address_label').should('have.attr', 'aria-disabled')
    cy.getByTestID('address_book_label_input').type('foo')
    cy.getByTestID('save_address_label').should('have.attr', 'aria-disabled')
    cy.getByTestID('address_book_address_input').type('fake address')
    cy.getByTestID('save_address_label').should('have.attr', 'aria-disabled')
    cy.getByTestID('address_book_address_input_error').contains('Please enter a valid address')
    cy.getByTestID('address_book_label_input_clear_button').click()
    cy.getByTestID('address_book_label_input_error').contains('Required field. Please enter a label. Maximum of 40 characters.')
    cy.getByTestID('address_book_address_input').clear()
    cy.getByTestID('address_book_address_input_error').contains('Please enter a valid address')
    cy.getByTestID('save_address_label').should('have.attr', 'aria-disabled')
  })

  it('should be able to add new address', function () {
    populateAddressBook()
  })

  it('should not have favourite button in Your addresses tab', function () {
    cy.getByTestID('address_button_group_YOUR_ADDRESS').click()
    cy.getByTestID('address_row_star_0_WHITELISTED').should('not.exist')
  })

  it('should be able to select address from address book and display in address input', function () {
    cy.getByTestID('address_button_group_WHITELISTED').click()
    cy.wrap(addresses).each((_v, index: number) => {
      cy.getByTestID(`address_row_${index}_WHITELISTED`).click()
      validateMatchAddress(addresses[index], labels[index])
      cy.getByTestID('address_book_button').click()
    })
  })

  it('should be able to select wallet address and display default label in address input', function () {
    cy.getByTestID('address_button_group_YOUR_ADDRESS').click()
    cy.getByTestID('address_row_text_0_YOUR_ADDRESS').invoke('text').then(walletAddress => {
      cy.getByTestID('address_row_text_0_YOUR_ADDRESS').click()
      validateMatchAddress(walletAddress, 'Saved address')
    })
  })

  it('should be able to block duplicate address', function () {
    cy.getByTestID('address_book_button').click()
    cy.getByTestID('address_button_group_WHITELISTED').click()
    cy.wrap(addresses).each((_v, index: number) => {
      cy.getByTestID('add_new_address').click()
      cy.getByTestID('address_book_address_input').clear().type(addresses[index]).blur()
      cy.getByTestID('address_book_address_input_error').contains('This address already exists in your address book, please enter a different address')
      cy.go('back')
    })
  })

  it('should be able to block wallet address', function () {
    cy.getByTestID('address_button_group_YOUR_ADDRESS').click()
    cy.getByTestID('address_row_text_0_YOUR_ADDRESS').invoke('text').then(walletAddress => {
      cy.getByTestID('address_button_group_WHITELISTED').click()
      cy.getByTestID('add_new_address').click()
      cy.getByTestID('address_book_address_input').clear().type(walletAddress).blur()
      cy.getByTestID('address_book_address_input_error').contains('This address already exists in your address book, please enter a different address')
    })
  })

  it('should disable add new, edit and favourite button has has refresh button in Your address tab', function () {
    cy.go('back')
    cy.getByTestID('address_button_group_YOUR_ADDRESS').click()
    cy.getByTestID('add_new_address').should('not.exist')
    cy.getByTestID('address_list_edit_button').should('not.exist')
    cy.getByTestID('address_row_favourite_0_YOUR_ADDRESS').should('not.exist')
    cy.getByTestID('discover_wallet_addresses').should('exist')
  })

  it('should remove address book from storage after exiting wallet through setting', function () {
    populateAddressBook()
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('header_settings').click()
    cy.wait(1000)
    cy.blockAllFeatureFlag()
    cy.getByTestID('setting_exit_wallet').click()
    cy.on('window:confirm', () => { })
    cy.getByTestID('onboarding_carousel').should('exist')
    cy.getByTestID('get_started_button').should('exist')
    cy.getByTestID('restore_wallet_button').should('exist').then(() => {
      const walletUserPreference = JSON.parse(localStorage.getItem('Local.WALLET.SETTINGS') ?? '{}')
      expect(walletUserPreference).to.have.deep.property('addressBook', {})
    })
  })

  it('should remove address book from storage after forced exit from invalid passcode', function () {
    const MAX_PASSCODE_ATTEMPT = 3
    populateAddressBook()
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('header_settings').click()
    cy.getByTestID('view_recovery_words').click()
    cy.blockAllFeatureFlag()
    cy.wrap(Array(MAX_PASSCODE_ATTEMPT)).each(() => {
      cy.getByTestID('pin_authorize').type('696969').wait(2000)
    })
    cy.on('window:confirm', () => { })
    cy.getByTestID('onboarding_carousel').should('exist')
    cy.getByTestID('get_started_button').should('exist')
    cy.getByTestID('restore_wallet_button').should('exist').then(() => {
      const walletUserPreference = JSON.parse(localStorage.getItem('Local.WALLET.SETTINGS') ?? '{}')
      expect(walletUserPreference).to.have.deep.property('addressBook', {})
    })
  })
})
