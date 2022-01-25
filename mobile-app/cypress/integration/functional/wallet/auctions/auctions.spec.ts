import { EnvironmentNetwork } from '../../../../../../shared/environment'
import { VaultStatus } from '../../../../../app/screens/AppNavigator/screens/Loans/VaultStatusTypes'
import BigNumber from 'bignumber.js'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { LoanVaultLiquidated } from '@defichain/whale-api-client/dist/api/loan'

function generateBlockUntilLiquidate (): void {
  cy.getByTestID('playground_generate_blocks').click()
  cy.wait(3000)
  cy.getByTestID('vault_card_0_status').invoke('text').then((status: string) => {
    if (status !== 'IN LIQUIDATION') {
      generateBlockUntilLiquidate()
    }
  })
}

context('Wallet - Auctions', () => {
  let whale: WhaleApiClient
  let retries = 0
  const walletTheme = { isDark: false }
  const network = localStorage.getItem('Development.NETWORK')
  beforeEach(function () {
    whale = new WhaleApiClient({
      url: network === 'Playground' ? 'https://playground.defichain.com' : 'http://localhost:19553',
      network: 'regtest',
      version: 'v0'
    })
  })

  function runIfAuctionsIsAvailable (callback: any): void {
    cy.wrap<LoanVaultLiquidated[]>(whale.loan.listAuction(200), { timeout: 20000 }).then(async (response) => {
      const stats = await whale.stats.get()
      const blockCount = stats.count.blocks

      if (
        retries <= 8 &&
        response.length > 0 &&
        BigNumber.max(response[0].liquidationHeight - blockCount, 0).toNumber() >= 15) {
        retries = 0
        callback()
        return
      }

      retries += 1
      cy.wait(5000)
      runIfAuctionsIsAvailable(callback)
    })
  }

  const flags = {
    body: [{
      id: 'loan',
      name: 'Loan',
      stage: 'public',
      version: '>=0.0.0',
      description: 'Browse loan tokens provided by DeFiChain',
      networks: [EnvironmentNetwork.MainNet, EnvironmentNetwork.TestNet, EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
      platforms: ['ios', 'android', 'web']
    }, {
      id: 'auction',
      name: 'Auction',
      stage: 'public',
      version: '>=0.0.0',
      description: 'Browse auctions provided by DeFiChain',
      networks: [EnvironmentNetwork.MainNet, EnvironmentNetwork.TestNet, EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
      platforms: ['ios', 'android', 'web']
    }]
  }
  const recoveryWords: string[] = []

  before(function () {
    cy.intercept('**/settings/flags', flags)
    cy.visit('/')
    // Bidder 2
    cy.startCreateMnemonicWallet(recoveryWords)
    cy.selectMnemonicWords(recoveryWords)
    cy.setupPinCode()
    cy.sendDFItoWallet().sendDFItoWallet().sendDFITokentoWallet()
    cy.wait(6000)
    cy.getByTestID('dfi_token_amount').contains('10.00000000')
    cy.getByTestID('dfi_utxo_amount').contains('20.00000000')
    cy.getByTestID('total_dfi_amount').contains('30.00000000')
    cy.getByTestID('bottom_tab_loans').click()
    cy.createVault(0)
    cy.getByTestID('vault_card_0_edit_collaterals_button').click()
    cy.addCollateral('0.60000000', 'DFI')
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('vault_card_0_manage_loans_button').click()
    cy.getByTestID('button_browse_loans').click()
    cy.getByTestID('loan_card_dTU10').click()
    cy.getByTestID('max_loan_amount_text').invoke('text').then((text: string) => {
      const maxLoanAmount = new BigNumber(text).toFixed(2, 1) // use 2dp and round down
      cy.getByTestID('form_input_borrow').clear().type(maxLoanAmount).blur()
    })
    cy.getByTestID('borrow_loan_submit_button').click()
    cy.getByTestID('button_confirm_borrow_loan').click()
    cy.closeOceanInterface()

    // Bidder 1
    cy.exitWallet()
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['CD10']).wait(6000)

    cy.getByTestID('dfi_token_amount').contains('10.00000000')
    cy.getByTestID('dfi_utxo_amount').contains('20.00000000')
    cy.getByTestID('total_dfi_amount').contains('30.00000000')
    cy.setWalletTheme(walletTheme)
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('empty_vault').should('exist')
    cy.createVault(0)
    cy.getByTestID('vault_card_0_manage_loans_button').should('not.exist')
    cy.getByTestID('vault_card_0_edit_collaterals_button').click()
    cy.addCollateral('0.20000000', 'DFI')
    cy.addCollateral('0.00000001', 'dCD10')
  })

  it('should liquidate vault', function () {
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('loans_tabs_YOUR_VAULTS').click()
    cy.getByTestID('vault_card_0_manage_loans_button').click()
    cy.getByTestID('button_browse_loans').click()
    cy.getByTestID('loan_card_dTU10').click()
    cy.getByTestID('max_loan_amount_text').invoke('text').then((text: string) => {
      const maxLoanAmount = new BigNumber(text).toFixed(4, 1) // use 2dp and round down
      cy.getByTestID('form_input_borrow').clear().type(maxLoanAmount).blur()
    })
    cy.getByTestID('borrow_loan_submit_button').click()
    cy.getByTestID('button_confirm_borrow_loan').click()
    cy.closeOceanInterface()
    cy.getByTestID('loans_tabs_YOUR_VAULTS').click()
    generateBlockUntilLiquidate()
    cy.checkVaultTag('IN LIQUIDATION', VaultStatus.Liquidated, 'vault_card_0_status', walletTheme.isDark)
    cy.createVault(0, true)
    cy.getByTestID('vault_card_1_edit_collaterals_button').click()
    cy.addCollateral('0.60000000', 'DFI')
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('vault_card_1_manage_loans_button').click()
    cy.getByTestID('button_browse_loans').click()
    cy.getByTestID('loan_card_dTU10').click()
    cy.getByTestID('max_loan_amount_text').invoke('text').then((text: string) => {
      const maxLoanAmount = new BigNumber(text).minus(1).toFixed(2, 1) // use 2dp and round down
      cy.getByTestID('form_input_borrow').clear().type(maxLoanAmount).blur()
    })
    cy.getByTestID('borrow_loan_submit_button').click()
    cy.getByTestID('button_confirm_borrow_loan').click()
    cy.closeOceanInterface()
  })

  it('should show liquidated vault in auctions', function () {
    cy.getByTestID('bottom_tab_auctions').click()
    cy.getByTestID('batch_0_dTU10').should('exist')
  })

  it('should display impt auction details', function () {
    runIfAuctionsIsAvailable(() => {
      cy.getByTestID('batch_card_0_owned_vault').should('exist')
      cy.getByTestID('batch_card_0_no_bid').should('exist')
    })
  })

  it('should be able to quick/place bid', function () {
    runIfAuctionsIsAvailable(() => {
      cy.getByTestID('batch_card_0').click()
      cy.getByTestID('empty_bid_history').should('exist')
      cy.getByTestID('collateral_tab_COLLATERALS').click()
      cy.getByTestID('collateral_row_0_amount').contains('0.20000000 DFI')
      cy.getByTestID('bottom_tab_auctions').click()
      cy.getByTestID('batch_card_0_quick_bid').click()
      cy.getByTestID('quick_bid_submit_button').click().wait(1000)
      cy.closeOceanInterface()

      cy.getByTestID('batch_card_0_no_bid').should('not.exist')
      cy.getByTestID('batch_card_0_highest_text').should('exist')
      cy.getByTestID('batch_card_0').click()
      cy.getByTestID('bid_1').should('exist')

      // place bid
      cy.getByTestID('bottom_tab_auctions').click()
      cy.getByTestID('batch_card_0_place_bid').click()
      cy.getByTestID('MAX_amount_button').click()
      cy.getByTestID('button_submit').click()
      cy.getByTestID('button_confirm_bid').click()
      cy.closeOceanInterface()
      cy.getByTestID('batch_card_0_highest_text').should('exist')
      cy.getByTestID('batch_card_0').click()
      cy.getByTestID('bid_1').should('exist')
      cy.getByTestID('bid_2').should('exist')
    })
  })

  it('should allow others to place bid', function () {
    cy.wait(5000)
    cy.exitWallet()
    cy.restoreMnemonicWords(recoveryWords).wait(3000)
    runIfAuctionsIsAvailable(() => {
      cy.getByTestID('bottom_tab_auctions').click()
      cy.getByTestID('batch_card_0_owned_vault').should('exist')
      cy.getByTestID('batch_card_0_no_bid').should('exist')
      cy.getByTestID('batch_card_0_place_bid').click()
      cy.getByTestID('MAX_amount_button').click()
      cy.getByTestID('button_submit').click()
      cy.getByTestID('button_confirm_bid').click()
      cy.closeOceanInterface()

      cy.getByTestID('batch_card_0_highest_text').should('exist')
      cy.getByTestID('batch_card_0').click()
      cy.getByTestID('bid_3').should('exist')
    })
  })
})
