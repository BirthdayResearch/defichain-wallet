/**
 * This file will be used for mainnet testing or smoke testing
 * It will only test core features that doesn't require balances (e.g, Create, Restore wallet etc.)
 * Tests included here are not that extensive compared to functional testing (e.g, Color, disable test or styling tests won't be added here)
 * The goal is to have run smoke testing in Mainnet
 * */

import { WhaleApiClient } from '@defichain/whale-api-client'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import BigNumber from 'bignumber.js'

interface DexItem {
  type: 'your' | 'available'
  data: PoolPairData
}

context('Mainnet - Wallet', () => {
  const recoveryWords: string[] = []
  const settingsRecoveryWords: string[] = []
  const localAddress = {
    address: ''
  }
  const mainnetAddress = {
    address: ''
  }

  beforeEach(() => {
    cy.restoreLocalStorage()
  })

  afterEach(() => {
    cy.saveLocalStorage()
  })

  it('should store values of local wallet', function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(['BTC', 'ETH-DFI']).wait(3000)
    cy.verifyWalletAddress('regtest', localAddress)
  })

  it('should have MainNet', function () {
    cy.isNetworkConnected('Local')
    cy.switchNetwork('MainNet')
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

  it('should have displayed default tokens', function () {
    cy.getByTestID('dfi_utxo_amount').contains('0.00000000')
    cy.getByTestID('dfi_token_amount').contains('0.00000000')
    cy.getByTestID('dfi_total_balance_amount').contains('0.00000000')
  })

  context('Settings - Mnemonic Verification', () => {
    it('should be able to verify mnemonic from settings page', function () {
      cy.verifyMnemonicOnSettingsPage(settingsRecoveryWords, recoveryWords)
    })
  })

  context('Settings - Change Passcode', () => {
    it('should be able to change passcode and verify', function () {
      cy.changePasscode()
      cy.getByTestID('header_settings').click()
      cy.getByTestID('view_recovery_words').click().wait(3000)
      cy.getByTestID('pin_authorize').type('696969').wait(3000)
    })
  })

  context('Restore - Mnemonic Verification', () => {
    it('should be able to restore mnemonic words', function () {
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('header_settings').click()
      cy.getByTestID('setting_exit_wallet').click()
      cy.restoreMnemonicWords(settingsRecoveryWords)
    })
  })

  context('Wallet - Verify Wallet Address', () => {
    it('should be have selected valid network', function () {
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('header_settings').click()
      cy.getByTestID('button_selected_network').contains('MainNet').should('exist')
    })

    it('should be have valid network address', function () {
      cy.verifyWalletAddress('mainnet', mainnetAddress)
      cy.getByTestID('bottom_tab_balances').click()
    })
  })

  context('Wallet - On Refresh', () => {
    it('should load selected network', function () {
      cy.reload()
      cy.isNetworkConnected('MainNet')
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('receive_balance_button').click()
      cy.getByTestID('address_text').then(($txt: any) => {
        const address = $txt[0].textContent
        expect(address).eq(mainnetAddress.address)
      })
    })
  })

  // In this test, there are Local and MainNet wallets existing
  context('Wallet - Network Switch', () => {
    it('should change network to Local', function () {
      cy.switchNetwork('Local')
    })

    it('should have correct balances', function () {
      cy.fetchWalletBalance()
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('balances_list').should('exist')
      cy.getByTestID('dfi_utxo_amount').contains('10.00000000')
      cy.getByTestID('dfi_token_amount').contains('10')
      cy.getByTestID('dfi_total_balance_amount').contains('20')
      cy.checkBalanceRow('17', {
        name: 'Playground ETH-DeFiChain',
        amount: '10.00000000',
        displaySymbol: 'dETH-DFI',
        symbol: 'dETH-DFI'
      })
    })

    it('should have correct poolpairs', function () {
      cy.getByTestID('bottom_tab_dex').click()
      cy.getByTestID('close_dex_guidelines').click()
      cy.getByTestID('dex_tabs_YOUR_POOL_PAIRS').click()
      cy.getByTestID('share_in_pool_dETH-DFI').contains('10.00000000')
      cy.getByTestID('bottom_tab_balances').click()
    })

    it('should have correct address', function () {
      cy.getByTestID('bottom_tab_balances').click()
      cy.getByTestID('receive_balance_button').click()
      cy.getByTestID('address_text').then(($txt: any) => {
        const address = $txt[0].textContent
        expect(address).eq(localAddress.address)
      })
    })
  })
})

context('Mainnet - Wallet - Pool Pair Values', () => {
  beforeEach(function () {
    cy.restoreLocalStorage()
  })

  afterEach(function () {
    cy.saveLocalStorage()
  })

  let whale: WhaleApiClient
  before(function () {
    cy.createEmptyWallet(true)
    cy.switchNetwork('MainNet')
    cy.createEmptyWallet(true)
    whale = new WhaleApiClient({ url: 'https://ocean.defichain.com', network: 'mainnet', version: 'v0' })
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('close_dex_guidelines').click()
  })

  it('should verify poolpair values', function () {
    cy.getByTestID('dex_tabs_AVAILABLE_POOL_PAIRS').click()
    cy.wrap<DexItem[]>(whale.poolpairs.list(5), { timeout: 20000 }).then((pairs) => {
      const available: PoolPairData[] = pairs.map(data => ({ type: 'available', data: data }))
      cy.wait(5000)
      cy.getByTestID('available_liquidity_tab').scrollTo('bottom')
      available.forEach((pair, index) => {
        const data: PoolPairData = pair.data
        cy.intercept('**/poolpairs?size=*', {
          statusCode: 200,
          body: {
            data: pairs
          }
        })
        const symbol = `${data.tokenA.displaySymbol}-${data.tokenB.displaySymbol}`
        cy.getByTestID('dex_search_icon').click()
        cy.getByTestID('dex_search_input').clear().type(symbol).blur()
        cy.getByTestID(`your_symbol_${symbol}`).contains(symbol)
        cy.getByTestID(`apr_${symbol}`).contains(`${new BigNumber(data.apr.total).times(100).toFixed(2)}%`)
        cy.getByTestID(`details_${symbol}`).click()
        cy.getByTestID(`available_${data.symbol}_${data.tokenA.displaySymbol}`).contains(`${new BigNumber(new BigNumber(data.tokenA.reserve).toFixed(2, 1)).toNumber().toLocaleString()}`)
        cy.getByTestID(`available_${data.symbol}_${data.tokenB.displaySymbol}`).contains(`${new BigNumber(new BigNumber(data.tokenB.reserve).toFixed(2, 1)).toNumber().toLocaleString()}`)
        cy.getByTestID('dex_search_input_close').click()
      })
    })
  })
})
