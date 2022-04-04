import { WhaleApiClient } from '@defichain/whale-api-client'

context('Wallet - Addresses', () => {
  let whale: WhaleApiClient

  before(function () {
    cy.createEmptyWallet(true)
  })

  beforeEach(function () {
    cy.getByTestID('bottom_tab_balances').click()
    cy.restoreLocalStorage()
    const network = localStorage.getItem('Development.NETWORK')
    whale = new WhaleApiClient({
      url: network === 'Playground' ? 'https://playground.defichain.com' : 'http://localhost:19553',
      network: 'regtest',
      version: 'v0'
    })
  })

  afterEach(() => {
    cy.saveLocalStorage()
  })

  it('should display partial address and can tap to copy', function () {
    cy.getByTestID('switch_account_button').click()
    cy.getByTestID('active_address').invoke('css', 'text-overflow').should('eq', 'ellipsis')
    cy.getByTestID('active_address').click()
    cy.getByTestID('wallet_toast').should('exist')
  })

  it('should not present create new address when wallet is freshly setup', function () {
    cy.getByTestID('switch_account_button').should('exist').click().wait(1000).should(() => {
      const network: string = localStorage.getItem('Development.NETWORK')
      expect(localStorage.getItem(`Development.${network}.WALLET_ADDRESS.INDEX.active`)).to.eq(null)
      expect(localStorage.getItem(`Development.${network}.WALLET_ADDRESS.INDEX.length`)).to.eq(null)
    })
    cy.getByTestID('address_row_text_0').invoke('text').then((address: string) => {
      cy.getByTestID(`address_active_indicator_${address}`).should('exist')
      cy.getByTestID('create_new_address').should('not.exist')
      cy.getByTestID('address_detail_address_count').contains('1')
      cy.getByTestID('close_address_detail_button').click()
      cy.getByTestID('address_count_badge').should('not.exist')
      cy.getByTestID('receive_balance_button').click()
      cy.getByTestID('address_text').contains(address)
    })
  })

  it('should be able to create new address when all available address are active', function () {
    cy.sendDFItoWallet().wait(3000)
    cy.getByTestID('details_dfi').click()
    cy.getByTestID('dfi_utxo_amount').contains('10.00000000')
    cy.getByTestID('dfi_token_amount').contains('0.00000000')
    cy.getByTestID('dfi_total_balance_amount').contains('10.00000000')
    cy.getByTestID('switch_account_button').should('exist').click().wait(1000)
    cy.getByTestID('create_new_address').should('exist').click().should(() => {
      const network: string = localStorage.getItem('Development.NETWORK')
      expect(localStorage.getItem(`Development.${network}.WALLET_ADDRESS.INDEX.active`)).to.eq('1')
      expect(localStorage.getItem(`Development.${network}.WALLET_ADDRESS.INDEX.length`)).to.eq('1')
    })
    cy.wait(3000)
    cy.url().should('include', 'app/balances')
    cy.getByTestID('switch_account_button').should('exist').click().wait(1000)
    cy.getByTestID('address_row_0').should('exist')
    cy.getByTestID('address_row_1').should('exist')
    cy.getByTestID('address_detail_address_count').contains('2')
    cy.getByTestID('close_address_detail_button').click()
    cy.getByTestID('switch_account_button').should('exist').click().wait(1000)
    cy.getByTestID('create_new_address').should('not.exist')
    cy.getByTestID('address_row_text_1').invoke('text').then((address: string) => {
      cy.getByTestID(`address_active_indicator_${address}`).should('exist')
      cy.getByTestID('close_address_detail_button').click()
      cy.getByTestID('address_count_badge').should('exist').contains('2')
      cy.getByTestID('receive_balance_button').click()
      cy.getByTestID('address_text').contains(address)
    })
  })

  it('should be able to persist selected address', function () {
    cy.getByTestID('switch_account_button').should('exist').click().wait(1000)
    cy.getByTestID('address_row_text_1').invoke('text').then((activeAddress: string) => {
      cy.getByTestID('address_row_1').click()
      cy.reload()
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('wallet_address').contains(activeAddress)
      cy.getByTestID('switch_account_button').should('exist').click().wait(1000)
      cy.getByTestID(`address_active_indicator_${activeAddress}`).should('exist')
      cy.getByTestID('close_address_detail_button').click()
      cy.getByTestID('receive_balance_button').click()
      cy.getByTestID('address_text').contains(activeAddress)
    })
  })

  context('Wallet - Addresses transfer dfi between addresses', () => {
    let address: string
    it('should able to transfer dfi between addresses', function () {
      cy.getByTestID('switch_account_button').should('exist').click().wait(1000)
      cy.getByTestID('address_row_text_1').invoke('text').then((sendAddress: string) => {
        address = sendAddress
        cy.getByTestID('address_row_0').should('exist').click().should(() => {
          const network: string = localStorage.getItem('Development.NETWORK')
          expect(localStorage.getItem(`Development.${network}.WALLET_ADDRESS.INDEX.active`)).to.eq('0')
          expect(localStorage.getItem(`Development.${network}.WALLET_ADDRESS.INDEX.length`)).to.eq('1')
        })
        cy.getByTestID('dfi_balance_card').should('exist')
        cy.getByTestID('details_dfi').click()
        cy.getByTestID('dfi_utxo_amount').contains('10.00000000')
        cy.getByTestID('send_dfi_button').click()
        cy.getByTestID('address_input').type(sendAddress)
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
    })

    it('should check if exist on other side second address', function () {
      cy.wrap(whale.address.getBalance(address)).then((response) => {
        expect(response).eq('1.00000000')
      })
      cy.getByTestID('switch_account_button').should('exist').click().wait(1000)
      cy.getByTestID('create_new_address').should('exist')
      cy.getByTestID('address_row_1').should('exist').click().should(() => {
        const network: string = localStorage.getItem('Development.NETWORK')
        expect(localStorage.getItem(`Development.${network}.WALLET_ADDRESS.INDEX.active`)).to.eq('1')
        expect(localStorage.getItem(`Development.${network}.WALLET_ADDRESS.INDEX.length`)).to.eq('1')
      })
      cy.getByTestID('dfi_utxo_amount').contains('1.00000000')
      cy.exitWallet()
    })
  })
})

context('Wallet - Addresses should persist addresses after restore with no active address', () => {
  const recoveryWords: string[] = []
  const settingsRecoveryWords: string[] = []
  let address: string

  before(() => {
    cy.visit('/')
    cy.exitWallet()
  })

  beforeEach(function () {
    cy.restoreLocalStorage()
  })

  afterEach(() => {
    cy.saveLocalStorage()
  })

  it('should start creation of mnemonic wallet and store values of local address', function () {
    cy.startCreateMnemonicWallet(recoveryWords)
    cy.selectMnemonicWords(recoveryWords)
    cy.setupPinCode()
    cy.getByTestID('details_dfi').click()
    cy.getByTestID('dfi_utxo_amount').contains('0.00000000')
    cy.getByTestID('dfi_token_amount').contains('0.00000000')
    cy.getByTestID('dfi_total_balance_amount').contains('0.00000000')
    cy.getByTestID('switch_account_button').should('exist').click().wait(1000)
    cy.getByTestID('address_row_text_0').invoke('text').then((activeAddress: string) => {
      address = activeAddress
    })
    cy.verifyMnemonicOnSettingsPage(settingsRecoveryWords, recoveryWords)
    cy.exitWallet().wait(3000)
  })

  it('should be able to restore wallet and get only one old addresses loaded', function () {
    cy.restoreMnemonicWords(settingsRecoveryWords)
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('switch_account_button').should('exist').click().wait(1000).should(() => {
      const network: string = localStorage.getItem('Development.NETWORK')
      expect(localStorage.getItem(`Development.${network}.WALLET_ADDRESS.INDEX.active`)).to.eq('0')
      expect(localStorage.getItem(`Development.${network}.WALLET_ADDRESS.INDEX.length`)).to.eq('0')
    })
    cy.getByTestID('address_row_0').should('exist')
    cy.getByTestID('address_row_text_0').contains(address)
    cy.getByTestID(`address_active_indicator_${address}`).should('exist')
  })
})

context('Wallet - Addresses should persist addresses after restore with active address', () => {
  const recoveryWords: string[] = []
  const settingsRecoveryWords: string[] = []
  const addresses: string[] = []
  let maxAddress: string

  before(() => {
    cy.visit('/')
    cy.exitWallet()
  })

  it('should start creation of mnemonic wallet and store values of local addresses', function () {
    cy.startCreateMnemonicWallet(recoveryWords)
    cy.selectMnemonicWords(recoveryWords)
    cy.setupPinCode()
    cy.getByTestID('details_dfi').click()
    cy.getByTestID('dfi_utxo_amount').contains('0.00000000')
    cy.getByTestID('dfi_token_amount').contains('0.00000000')
    cy.getByTestID('dfi_total_balance_amount').contains('0.00000000')
    cy.sendDFItoWallet().wait(3000)
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('dfi_utxo_amount').contains('10.00000000')
    cy.getByTestID('dfi_token_amount').contains('0.00000000')
    cy.getByTestID('dfi_total_balance_amount').contains('10.00000000')
    cy.getByTestID('switch_account_button').should('exist').click()
    cy.getByTestID('create_new_address').should('exist').click().should(() => {
      const network: string = localStorage.getItem('Development.NETWORK')
      maxAddress = localStorage.getItem(`Development.${network}.WALLET_ADDRESS.INDEX.length`)
      const activeAddress = localStorage.getItem(`Development.${network}.WALLET_ADDRESS.INDEX.active`)
      expect(activeAddress).to.eq('1')
      expect(maxAddress).to.eq('1')
    })
    cy.getByTestID('switch_account_button').should('exist').click()
    cy.getByTestID('address_row_text_0').invoke('text').then((address: string) => {
      addresses.push(address)
    })
    cy.getByTestID('address_row_text_1').invoke('text').then((address: string) => {
      addresses.push(address)
    })
    cy.sendDFItoWallet().wait(3000)
    cy.getByTestID('dfi_utxo_amount').contains('10.00000000')
    cy.getByTestID('dfi_token_amount').contains('0.00000000')
    cy.getByTestID('dfi_total_balance_amount').contains('10.00000000')
    cy.verifyMnemonicOnSettingsPage(settingsRecoveryWords, recoveryWords)
    cy.exitWallet()
  })

  it('should be able to restore wallet and get old addresses loaded', function () {
    cy.restoreMnemonicWords(settingsRecoveryWords)
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('switch_account_button').should('exist').click().wait(1000).should(() => {
      const network: string = localStorage.getItem('Development.NETWORK')
      expect(localStorage.getItem(`Development.${network}.WALLET_ADDRESS.INDEX.active`)).to.eq(null)
      expect(localStorage.getItem(`Development.${network}.WALLET_ADDRESS.INDEX.length`)).to.eq(maxAddress)
    })
    addresses.forEach(function (address, index) {
      cy.getByTestID(`address_row_${index}`).should('exist')
      cy.getByTestID(`address_row_text_${index}`).contains(address)
    })
    cy.getByTestID(`address_active_indicator_${addresses[0]}`).should('exist')
  })
})

context('Wallet - Addresses should able to create maximum 10 addresses', () => {
  before(function () {
    cy.createEmptyWallet(true)
  })

  it('should able to create maximum 10 address', function () {
    cy.getByTestID('details_dfi').click()
    cy.getByTestID('dfi_utxo_amount').contains('0.00000000')
    cy.getByTestID('dfi_token_amount').contains('0.00000000')
    cy.getByTestID('dfi_total_balance_amount').contains('0.00000000')
    cy.sendDFItoWallet().wait(3000)
    cy.getByTestID('dfi_utxo_amount').contains('10.00000000')
    cy.getByTestID('dfi_token_amount').contains('0.00000000')
    cy.getByTestID('dfi_total_balance_amount').contains('10.00000000')
    for (let i = 1; i < 10; i++) {
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('switch_account_button').should('exist').click().wait(1000)
      cy.getByTestID('create_new_address').should('exist').click()
      cy.sendDFItoWallet().wait(3000)
      cy.getByTestID('dfi_utxo_amount').contains('10.00000000')
      cy.getByTestID('dfi_token_amount').contains('0.00000000')
      cy.getByTestID('dfi_total_balance_amount').contains('10.00000000')
    }
    cy.getByTestID('create_new_address').should('not.exist')
  })
})

context('Wallet - should be able to discover Wallet Addresses', () => {
  const recoveryWords: string[] = []
  let address: string
  before(function () {
    cy.visit('/')
    cy.exitWallet()
    cy.createEmptyWallet(true)
    cy.verifyMnemonicOnSettingsPage(recoveryWords, recoveryWords)
    cy.getByTestID('bottom_tab_balances').click()
    cy.sendDFItoWallet().wait(5000)
    cy.getByTestID('details_dfi').click()
    cy.getByTestID('dfi_utxo_amount').contains('10.00000000')
    cy.getByTestID('dfi_token_amount').contains('0.00000000')
    cy.getByTestID('dfi_total_balance_amount').contains('10.00000000')
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('switch_account_button').should('exist').click()
    cy.getByTestID('create_new_address').should('exist').click()
    cy.getByTestID('wallet_address').invoke('text').then(text => {
      address = text
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('switch_account_button').should('exist').click()
      cy.getByTestID('address_row_0').should('exist').click()
      cy.exitWallet()
    })
  })

  it('should able to discover address after restore existing wallet', function () {
    cy.restoreMnemonicWords(recoveryWords)
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('dfi_balance_card').should('exist')
    cy.getByTestID('details_dfi').click()
    cy.getByTestID('send_dfi_button').click()
    cy.getByTestID('address_input').clear().type(address)
    cy.getByTestID('amount_input').clear().type('1')
    cy.getByTestID('button_confirm_send_continue').should('not.have.attr', 'disabled')
    cy.getByTestID('button_confirm_send_continue').click()
    cy.getByTestID('button_confirm_send').click().wait(3000)
    cy.closeOceanInterface()
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('switch_account_button').should('exist').click()
    cy.getByTestID('address_row_1').should('not.exist')
    cy.getByTestID('discover_wallet_addresses').click().wait(3000)
    cy.getByTestID('address_row_1').should('exist')
  })
})

context('Wallet - Address Label', () => {
  function validateLabel (label: string, shouldAllow: boolean): void {
    cy.getByTestID('address_book_label_input').clear().type(label).blur()
    if (shouldAllow) {
      cy.getByTestID('button_confirm_save_address_label').should('not.have.attr', 'aria-disabled')
      cy.getByTestID('address_book_label_input_error').should('not.exist')
    } else {
      cy.getByTestID('button_confirm_save_address_label').should('have.attr', 'aria-disabled')
      cy.getByTestID('address_book_label_input_error').should('exist')
    }
  }

  function validateAddressLabel (label: string, index: number): void {
    cy.getByTestID(`address_row_text_${index}`).invoke('text').then((address: string) => {
      cy.getByTestID(`address_edit_indicator_${address}`).should('exist').click()
      cy.getByTestID('address_book_label_input').clear().type(label)
      cy.getByTestID('button_confirm_save_address_label').should('not.have.attr', 'aria-disabled')
      cy.getByTestID('button_confirm_save_address_label').click()
      cy.getByTestID(`list_address_label_${address}`).contains(label)
      cy.getByTestID('list_header_address_label').contains(label)
      cy.getByTestID('close_address_detail_button').click()
      cy.getByTestID('wallet_address').contains(label)
    })
  }

  before(function () {
    const localStorageFlag = [{
      id: 'local_storage',
      name: 'Native local storage',
      stage: 'public',
      version: '>=0.0.0',
      description: 'Native local storage',
      networks: [
        'MainNet',
        'TestNet',
        'Playground',
        'Local'
      ],
      platforms: [
        'ios',
        'android',
        'web'
      ]
    }]
    cy.intercept('**/settings/flags', {
      statusCode: 200,
      body: localStorageFlag
    })
    cy.createEmptyWallet(true)
  })

  it('should not allow edit if edit button is not toggled', function () {
    cy.getByTestID('switch_account_button').click()
    cy.getByTestID('address_list_edit_button').contains('EDIT')
    cy.getByTestID('address_row_text_0').invoke('text').then((address: string) => {
      cy.getByTestID(`address_edit_indicator_${address}`).should('not.exist')
      cy.getByTestID(`address_active_indicator_${address}`).should('exist')
    })
    cy.getByTestID('address_row_0').click()
    cy.getByTestID('create_or_edit_label_address_form').should('not.exist')
  })

  it('should validate label input', function () {
    cy.getByTestID('address_list_edit_button').click()
    cy.getByTestID('address_list_edit_button').contains('CANCEL')
    cy.getByTestID('address_row_text_0').invoke('text').then((address: string) => {
      cy.getByTestID(`address_edit_indicator_${address}`).should('exist').click()
      // block
      validateLabel('abcdefghijklmnopqrstuvwxyz12345', false) // block >30 char
      validateLabel('😀🙌👶👩🏻‍💻🐶🌵🌝🍏🥨⚽️🪂🚗⌚️', false) // not all emoji equivalent to 1 char
      // allow
      validateLabel('abcdefghijklmnopqrstuvwxyz1234', true)
      validateLabel('😀🙌👶👩🏻‍💻', true)
      validateLabel('a                              ', true)

      cy.getByTestID('button_cancel_save_address_label').click()
    })
  })

  it('should be able to edit address label', function () {
    validateAddressLabel('foo', 0)
    cy.sendDFItoWallet().wait(6000)
    cy.getByTestID('switch_account_button').click()
    cy.getByTestID('create_new_address').click().wait(1000)
    cy.getByTestID('switch_account_button').click()
    cy.getByTestID('address_list_edit_button').click()
    validateAddressLabel('😀🙌👶👩🏻‍💻', 1)
    cy.sendDFItoWallet().wait(6000)
  })

  it('should trim leading and trailing empty spaces upon save', function () {
    cy.getByTestID('switch_account_button').click()
    cy.getByTestID('create_new_address').click().wait(1000)
    cy.getByTestID('switch_account_button').click()
    cy.getByTestID('address_list_edit_button').click()
    cy.getByTestID('address_row_text_2').invoke('text').then((address: string) => {
      const inputLabel = ' abc    '
      const trimmedLabel = inputLabel.trim()
      cy.getByTestID(`address_edit_indicator_${address}`).should('exist').click()
      cy.getByTestID('address_book_label_input').clear().type(inputLabel)
      cy.getByTestID('button_confirm_save_address_label').should('not.have.attr', 'aria-disabled')
      cy.getByTestID('button_confirm_save_address_label').click()
      cy.getByTestID(`list_address_label_${address}`).contains(trimmedLabel)
      cy.getByTestID('list_header_address_label').contains(trimmedLabel)
      cy.getByTestID('close_address_detail_button')
      cy.getByTestID('wallet_address').contains(trimmedLabel)
    })
  })
})

context('Wallet - Local Storage feature', () => {
  before(function () {
    cy.intercept('**/settings/flags', {
      statusCode: 200,
      body: []
    })
    cy.createEmptyWallet()
  })

  it('should not allow edit if feature is blocked', function () {
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('switch_account_button').click()
    cy.getByTestID('address_list_edit_button').should('not.exist')
  })
})
