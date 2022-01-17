import { EnvironmentNetwork } from '../../../../../../shared/environment'
import { VaultStatus } from '../../../../../app/screens/AppNavigator/screens/Loans/VaultStatusTypes'
import BigNumber from 'bignumber.js'

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
  const walletTheme = { isDark: false }
  before(function () {
    cy.intercept('**/settings/flags', {
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
    })
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['CD10']).wait(6000)
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
    cy.go('back')
    cy.getByTestID('loans_tabs_YOUR_VAULTS').click()
    cy.getByTestID('vault_card_0_manage_loans_button').click()
    cy.getByTestID('button_browse_loans').click()
    cy.getByTestID('loan_card_dTU10').click()
    cy.getByTestID('max_loan_amount_text').invoke('text').then((text: string) => {
      const maxLoanAmount = new BigNumber(text).toFixed(2, 1) // use 2dp and round down
      cy.getByTestID('form_input_borrow').clear().type(maxLoanAmount).blur()
    })
    cy.getByTestID('borrow_loan_submit_button').click()
    cy.getByTestID('button_confirm_borrow_loan').click().wait(3000)
    cy.closeOceanInterface()
    cy.getByTestID('loans_tabs_YOUR_VAULTS').click()
    generateBlockUntilLiquidate()
    cy.checkVaultTag('IN LIQUIDATION', VaultStatus.Liquidated, 'vault_card_0_status', walletTheme.isDark)
    cy.createVault(0, true)
    cy.getByTestID('vault_card_1_edit_collaterals_button').click()
    cy.addCollateral('0.60000000', 'DFI')
    cy.go('back')
    cy.getByTestID('vault_card_1_manage_loans_button').click()
    cy.getByTestID('button_browse_loans').click()
    cy.getByTestID('loan_card_dTU10').click()
    cy.getByTestID('max_loan_amount_text').invoke('text').then((text: string) => {
      const maxLoanAmount = new BigNumber(text).toFixed(2, 1) // use 2dp and round down
      cy.getByTestID('form_input_borrow').clear().type(maxLoanAmount).blur()
    })
    cy.getByTestID('borrow_loan_submit_button').click()
    cy.getByTestID('button_confirm_borrow_loan').click().wait(3000)
    cy.closeOceanInterface()
  })

  it('should show liquidated vault in auctions', function () {
    cy.getByTestID('bottom_tab_auctions').click()
    cy.getByTestID('batch_0_dTU10').should('exist')
  })

  it('should be able to quick/place bid', function () {
    cy.getByTestID('batch_card_0_owned_vault').should('exist')
    cy.getByTestID('batch_card_0_no_bid').should('exist')

    cy.getByTestID('batch_card_0').click()
    cy.getByTestID('empty_bid_history').should('exist')
    cy.getByTestID('collateral_tab_COLLATERALS').click()
    cy.getByTestID('collateral_row_0_amount').contains('0.20000000 DFI')
    cy.go('back')
    cy.getByTestID('batch_card_0_quick_bid').click()
    cy.getByTestID('quick_bid_submit_button').click().wait(1000)
    cy.closeOceanInterface()
    cy.getByTestID('batch_card_0_no_bid').should('not.exist')
    cy.getByTestID('bid_highest_text').should('exist')
    cy.getByTestID('batch_card_0').click()
    cy.getByTestID('bid_1').should('exist')

    // place bid
    cy.getByTestID('bottom_tab_auctions').click()
    cy.getByTestID('batch_card_0_place_bid').click()
    cy.getByTestID('MAX_amount_button').click()
    cy.getByTestID('button_submit').click()
    cy.getByTestID('button_confirm_bid').click()
    cy.closeOceanInterface()
    cy.getByTestID('bid_highest_text').should('exist')
    cy.getByTestID('batch_card_0').click()
    cy.getByTestID('bid_1').should('exist')
    cy.getByTestID('bid_2').should('exist')
  })
})
