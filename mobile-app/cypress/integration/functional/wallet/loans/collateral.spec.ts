import { CollateralToken } from '@defichain/whale-api-client/dist/api/loan'
import BigNumber from 'bignumber.js'
import { EnvironmentNetwork } from '../../../../../../shared/environment'
import {
  checkCollateralCardValues,
  checkCollateralDetailValues,
  checkCollateralFormValues,
  checkConfirmEditCollateralValues
} from '../../../../support/loanCommands'
import { checkValueWithinRange } from '../../../../support/walletCommands'

function addCollateral (token: string, balance: string, amount: string, usdValue: string, colFactor: string, vaultShare: string, vaultId: string, vaultRequirementPercentage?: string): void {
  const precisedAmount = new BigNumber(amount).toFixed(8)
  cy.getByTestID(`select_${token}`).click()
  cy.getByTestID('add_collateral_button_submit').should('have.attr', 'aria-disabled')
  checkCollateralFormValues(`How much ${token} to add?`, token, balance)
  if (vaultRequirementPercentage === undefined) {
    cy.getByTestID('bottom-sheet-vault-percentage-text').contains('N/A')
  }
  cy.wait(3000)
  cy.getByTestID('form_input_text').type(amount).blur()
  cy.wait(3000)
  if (vaultRequirementPercentage === undefined) {
    cy.getByTestID('bottom-sheet-vault-percentage-text').contains(vaultShare)
  } else {
    cy.getByTestID('bottom-sheet-vault-requirement-text').contains(vaultRequirementPercentage)
  }
  cy.getByTestID('add_collateral_button_submit').click()
  checkConfirmEditCollateralValues('You are adding collateral to', vaultId, 'Add Collateral', colFactor, token, precisedAmount, usdValue, vaultShare)
  cy.getByTestID('button_confirm_confirm_edit_collateral').click().wait(3000)
  cy.getByTestID('txn_authorization_description')
    .contains(`Adding ${precisedAmount} ${token} as collateral`)
  cy.closeOceanInterface()
}

function removeCollateral (token: string, balance: string, amount: string, usdValue: string, colFactor: string, vaultShare: string, vaultId: string): void {
  const precisedAmount = new BigNumber(amount).toFixed(8)
  cy.getByTestID(`collateral_card_remove_${token}`).click()
  checkCollateralFormValues(`How much ${token} to remove?`, token, balance)
  cy.getByTestID('form_input_text').type(amount).blur()
  cy.wait(3000)
  cy.getByTestID('bottom-sheet-vault-percentage-text').contains(vaultShare)
  cy.getByTestID('add_collateral_button_submit').click()
  checkConfirmEditCollateralValues('You are removing collateral from', vaultId, 'Remove Collateral', colFactor, token, precisedAmount, usdValue, vaultShare)
  cy.getByTestID('button_confirm_confirm_edit_collateral').click().wait(3000)
  cy.getByTestID('txn_authorization_description')
    .contains(`Removing ${precisedAmount} ${token} collateral from vault`)
  cy.closeOceanInterface()
}

function removeMaxCollateral (token: string, balance: string, amount: string, usdValue: string, colFactor: string, vaultShare: string, vaultId: string): void {
  const precisedAmount = new BigNumber(amount).toFixed(8)
  cy.getByTestID(`collateral_card_remove_${token}`).click()
  checkCollateralFormValues(`How much ${token} to remove?`, token, balance)
  cy.getByTestID('form_input_text').type(amount).blur()
  cy.wait(3000)
  cy.getByTestID('bottom-sheet-vault-percentage-text').contains('0.00%')
  cy.getByTestID('add_collateral_button_submit').click()
  checkConfirmEditCollateralValues('You are removing collateral from', vaultId, 'Remove Collateral', colFactor, token, precisedAmount, usdValue, vaultShare)
  cy.getByTestID('button_confirm_confirm_edit_collateral').click().wait(3000)
  cy.getByTestID('txn_authorization_description')
    .contains(`Removing ${precisedAmount} ${token} collateral from vault`)
  cy.wait(3000)
  cy.closeOceanInterface()
}

function removeMaxCollateralNA (token: string, balance: string, amount: string, usdValue: string, colFactor: string, vaultShare: string, vaultId: string): void {
  const precisedAmount = new BigNumber(amount).toFixed(8)
  cy.getByTestID(`collateral_card_remove_${token}`).click()
  checkCollateralFormValues(`How much ${token} to remove?`, token, balance)
  cy.getByTestID('form_input_text').type(amount).blur()
  cy.wait(3000)
  cy.getByTestID('bottom-sheet-vault-percentage-text').contains('N/A')
  cy.getByTestID('add_collateral_button_submit').click()
  checkConfirmEditCollateralValues('You are removing collateral from', vaultId, 'Remove Collateral', colFactor, token, precisedAmount, usdValue, vaultShare)
  cy.getByTestID('button_confirm_confirm_edit_collateral').click().wait(3000)
  cy.getByTestID('txn_authorization_description')
    .contains(`Removing ${precisedAmount} ${token} collateral from vault`)
  cy.wait(3000)
  cy.closeOceanInterface()
  cy.getByTestID('add_collateral_button').click()
}

function borrowLoan (symbol: string, amount: string): void {
  cy.getByTestID('vault_card_0_manage_loans_button').click()
  const amountToBorrow = new BigNumber(amount).toFixed(8)
  cy.getByTestID('button_browse_loans').click()
  cy.getByTestID(`loan_card_${symbol}`).click()
  cy.getByTestID('form_input_borrow').clear().type(amountToBorrow)
  cy.wait(3000)
  cy.getByTestID('borrow_loan_submit_button').click()
  cy.getByTestID('text_borrow_amount').contains(amountToBorrow)
  cy.getByTestID('text_borrow_amount_suffix').contains(symbol)
  cy.getByTestID('button_confirm_borrow_loan').click().wait(3000)
  cy.getByTestID('txn_authorization_description')
    .contains(`Borrowing ${amountToBorrow} ${symbol}`)
  cy.closeOceanInterface()
}

context('Wallet - Loans - Add/Remove Collateral', () => {
  let vaultId = ''

  function validateCollateralInPortfolio (token: string, tokenId: string, availableAmount: string, lockedAmount: string): void {
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID(`balances_row_${tokenId}_symbol`).contains(token)
    cy.getByTestID(`balances_row_${tokenId}_amount`).contains(availableAmount)
    cy.getByTestID(`${token}_locked_amount_text`).contains(lockedAmount)
  }

  before(function () {
    // TODO remove intercept wile removing vault share functionality
    cy.intercept('**/settings/flags', {
      body: []
    })
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['BTC', 'ETH', 'DUSD']).wait(6000)
  })

  it('should create vault', function () {
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('empty_vault').should('exist')
    cy.createVault(0)
    cy.getByTestID('vault_card_0_status').contains('EMPTY')
    cy.getByTestID('vault_card_0_vault_id').then(($txt: any) => {
      vaultId = $txt[0].textContent
    })
  })

  it('should go to collateral page', function () {
    cy.intercept('**/loans/collaterals?size=50').as('loanCollaterals')
    cy.getByTestID('vault_card_0_edit_collaterals_button').click()
    cy.getByTestID('collateral_vault_id').contains(vaultId)
    checkCollateralDetailValues('EMPTY', '$0.00', '$0.00', undefined, 'N/A', '150.00', '5.00')
    cy.getByTestID('add_collateral_button').click()
    cy.wait(['@loanCollaterals']).then((intercept: any) => {
      const amounts: any = {
        DFI: 18,
        dBTC: 10,
        dETH: 10,
        DUSD: 10
      }
      const data: any[] = intercept.response.body.data
      data.forEach((collateralToken: CollateralToken) => {
        cy.getByTestID(`token_symbol_${collateralToken.token.displaySymbol}`).contains(collateralToken.token.displaySymbol)
        cy.getByTestID(`select_${collateralToken.token.displaySymbol}_value`).contains(amounts[collateralToken.token.displaySymbol] ?? 0)
      })
    })
  })

  it('should display vault % as N/A with addition and removal of one collateral', function () {
    addCollateral('DFI', '18', '10', '$1,000.00', '100', '100.00%', vaultId)
    removeMaxCollateralNA('DFI', '10', '10', '$0.00', '100', 'N/A', vaultId)
  })

  it('should add DFI as collateral', function () {
    addCollateral('DFI', '18', '10', '$1,000.00', '100', '100.00%', vaultId)
  })

  it('should update locked DFI in portfolio screen', function () {
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('details_dfi').click()
    cy.getByTestID('dfi_locked_amount').contains('10.00000000')
    cy.getByTestID('dfi_locked_value_amount').contains('≈ $100,000.00')
    cy.getByTestID('dfi_total_balance_amount').invoke('text').then(text => {
      checkValueWithinRange(text, '8.9', 0.1)
    })
  })

  it('should update vault details', function () {
    cy.getByTestID('bottom_tab_loans').click()
    checkCollateralDetailValues('READY', '$1,000.00', '$0.00', undefined, 'N/A', '150.00', '5.00')
  })

  it('should update collateral list', function () {
    checkCollateralCardValues('DFI', '10.00000000 DFI', '$1,000.00', '100.00%')
  })

  it('should add dBTC as collateral', function () {
    cy.getByTestID('add_collateral_button').click()
    addCollateral('dBTC', '10', '10', '$500.00', '100', '33.33%', vaultId)
  })

  it('should add dETH as collateral', function () {
    cy.getByTestID('add_collateral_button').click()
    addCollateral('dETH', '10', '10', '$100.00', '70', '4.38%', vaultId)
  })

  it('should display locked collateral token in portfolio even though it has no balance', function () {
    validateCollateralInPortfolio('dBTC', '1', '0.00000000', '10.00000000')
    validateCollateralInPortfolio('dETH', '2', '0.00000000', '10.00000000')
  })

  it('should update vault details', function () {
    cy.getByTestID('bottom_tab_loans').click()
    checkCollateralDetailValues('READY', '$1,570.00', '$0.00', undefined, 'N/A', '150.00', '5.00')
  })

  it('should add DUSD as collateral', function () {
    cy.getByTestID('add_collateral_button').click()
    addCollateral('DUSD', '10', '5.1357', '$5.14', '99', '0.32%', vaultId)
  })

  it('should update collateral list', function () {
    checkCollateralCardValues('DFI', '10.00000000 DFI', '$1,000.00', '63.49%')
    checkCollateralCardValues('dBTC', '10.00000000 dBTC', '$500.00', '31.74%')
    checkCollateralCardValues('dETH', '10.00000000 dETH', '$100.00', '4.44%')
    checkCollateralCardValues('DUSD', '5.13570000 DUSD', '$5.14', '0.32%')
  })

  it('should remove dBTC collateral', function () {
    removeCollateral('dBTC', '10', '1', '$450.00', '100', '29.51%', vaultId)
  })

  it('should remove DUSD collateral', function () {
    removeCollateral('DUSD', '5.1357', '1.8642', '$3.27', '99', '0.21%', vaultId)
  })

  it('vault % should be 0.00% when MAX amount of DUSD collateral is removed', function () {
    removeMaxCollateral('DUSD', '3.2715', '3.2715', '0.00000000', '99', '0.00%', vaultId)
  })

  it('should update collateral list', function () {
    checkCollateralCardValues('DFI', '10.00000000 DFI', '$1,000.00', '65.79%')
    checkCollateralCardValues('dBTC', '9.00000000 dBTC', '$450.00', '29.61%')
    checkCollateralCardValues('dETH', '10.00000000 dETH', '$100.00', '4.61%')
  })
})

context('Wallet - Loans - Add/Remove Collateral - Invalid data', () => {
  const getVault = (loanValue: string): any => ({
    vaultId: 'vaultidhere',
    loanScheme: {
      id: 'MIN150',
      minColRatio: '150',
      interestRate: '5'
    },
    ownerAddress: 'bcrt1qjk6p9kc28wdj84c500lh2h5zlzf5ce3r8r0y92',
    state: 'ACTIVE',
    informativeRatio: '-1',
    collateralRatio: '100', // must be positive
    collateralValue: '0',
    loanValue: loanValue,
    interestValue: '0',
    collateralAmounts: [],
    loanAmounts: [],
    interestAmounts: []
  })
  const walletTheme = { isDark: false }
  beforeEach(function () {
    // TODO remove intercept wile removing vault share functionality
    cy.intercept('**/settings/flags', {
      body: []
    })
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().wait(4000)
    cy.setWalletTheme(walletTheme)
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('empty_vault').should('exist')
    cy.createVault(0)
  })

  it('should display N/A if resulting collateralization is infinity', () => {
    cy.getByTestID('bottom_tab_loans').click()
    cy.intercept('**/vaults?size=200', {
      statusCode: 200,
      body: { data: getVault('0') }
    }).as('getVaults')

    cy.wait('@getVaults').then(() => {
    /* (collateralValueInUSD / vault.loanValue) * 100
       (any number / 0) = Infinity
    */
      cy.wait(3000)
      cy.getByTestID('vault_card_0_edit_collaterals_button').click()
      cy.getByTestID('add_collateral_button').click()
      cy.getByTestID('select_DFI').click()
      cy.getByTestID('MAX_amount_button').click()
      cy.getByTestID('resulting_collateralization').should('have.text', 'N/A')
    })
  })

  it('should display N/A if resulting collateralization is NaN', () => {
    cy.getByTestID('bottom_tab_loans').click()
    cy.intercept('**/vaults?size=200', {
      statusCode: 200,
      body: { data: getVault('0') }
    }).as('getVaults')
    cy.wait('@getVaults').then(() => {
    /* (collateralValueInUSD / vault.loanValue) * 100
       (any number / '') = NaN
    */
      cy.wait(3000)
      cy.getByTestID('vault_card_0_edit_collaterals_button').click()
      cy.getByTestID('add_collateral_button').click()
      cy.getByTestID('select_DFI').click()
      cy.getByTestID('MAX_amount_button').click()
      cy.getByTestID('resulting_collateralization').should('have.text', 'N/A')
    })
  })

  it('should display N/A if resulting collateralization is negative', () => {
    cy.getByTestID('bottom_tab_loans').click()
    cy.intercept('**/vaults?size=200', {
      statusCode: 200,
      body: { data: getVault('-10') }
    }).as('getVaults')
    cy.wait('@getVaults').then(() => {
    /* (collateralValueInUSD / vault.loanValue) * 100
       (any number / -10) = -number
    */
      cy.wait(3000)
      cy.getByTestID('vault_card_0_edit_collaterals_button').click()
      cy.getByTestID('add_collateral_button').click()
      cy.getByTestID('select_DFI').click()
      cy.getByTestID('MAX_amount_button').click()
      cy.getByTestID('resulting_collateralization').should('have.text', 'N/A')
    })
  })
})

context('Wallet - Loans - valid collateral token ratio', () => {
  const walletTheme = { isDark: false }
  let vaultId: string
  beforeEach(function () {
    cy.intercept('**/settings/flags', {
      body: [{
        id: 'dusd_vault_share',
        name: 'DUSD 50% contribution',
        stage: 'public',
        version: '>=0.0.0',
        description: 'DUSD 50% contribution in required collateral token',
        networks: [EnvironmentNetwork.MainNet, EnvironmentNetwork.TestNet, EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
        platforms: ['ios', 'android', 'web']
      }]
    })
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['BTC', 'DUSD']).wait(4000)
    cy.setWalletTheme(walletTheme)
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('empty_vault').should('exist')
    cy.createVault(0)
    cy.getByTestID('vault_card_0_status').contains('EMPTY')
    cy.getByTestID('vault_card_0_vault_id').then(($txt: any) => {
      vaultId = $txt[0].textContent
    })
  })

  it('should display warning message while taking loan', () => {
    cy.getByTestID('bottom_tab_loans').click()
    cy.wait(3000)
    cy.getByTestID('vault_card_0_edit_collaterals_button').click()
    cy.getByTestID('add_collateral_button').click()
    addCollateral('dBTC', '10', '10', '$500.00', '100', '100.00%', vaultId, '0.00%')
    cy.go('back')
    cy.wait(2000)
    cy.getByTestID('loans_tabs_BROWSE_LOANS').click()
    cy.getByTestID('header_loans_search').click()
    cy.getByTestID('loans_search_input').type('dTS25').blur()
    cy.getByTestID('loan_card_dTS25').click()
    cy.getByTestID('borrow_loan_vault').click()
    cy.wait(2000)
    cy.getByTestID('select_vault_0').click()
    cy.getByTestID('vault_min_share_warning').should('exist')
  })

  it('should not display warning message while taking loan with little DFI and DUSD', () => {
    cy.getByTestID('bottom_tab_loans').click()
    cy.wait(3000)
    cy.getByTestID('vault_card_0_edit_collaterals_button').click()
    cy.getByTestID('add_collateral_button').click()
    addCollateral('dBTC', '10', '10', '$500.00', '100', '100.00%', vaultId, '0.00%')
    cy.getByTestID('add_collateral_button').click()
    addCollateral('DFI', '18', '0.0001', '$0.01', '100', '0.00%', vaultId, '0.00%')
    cy.getByTestID('add_collateral_button').click()
    addCollateral('DUSD', '10', '0.01', '$0.01', '99', '0.00%', vaultId, '0.00%')
    cy.go('back')
    cy.wait(2000)
    cy.getByTestID('loans_tabs_BROWSE_LOANS').click()
    cy.getByTestID('header_loans_search').click()
    cy.getByTestID('loans_search_input').type('dTS25').blur()
    cy.getByTestID('loan_card_dTS25').click()
    cy.getByTestID('borrow_loan_vault').click()
    cy.wait(2000)
    cy.getByTestID('select_vault_0').click()
    cy.getByTestID('vault_min_share_warning').should('not.exist')
  })

  it.only('should display warning message when 50% of the minimum required collateral is not DFI or DUSD', () => {
    cy.getByTestID('bottom_tab_loans').click()
    cy.wait(3000)
    cy.getByTestID('vault_card_0_edit_collaterals_button').click()
    cy.getByTestID('add_collateral_button').click()
    addCollateral('dBTC', '10', '10', '$500.00', '100', '100.00%', vaultId, '0.00%')
    cy.getByTestID('add_collateral_button').click()
    addCollateral('DFI', '18', '10', '$1,000.00', '100', '66.67%', vaultId, '66.67%')
    cy.go('back')
    borrowLoan('DUSD', '1')
    cy.getByTestID('vault_card_0_edit_collaterals_button').click()
    cy.getByTestID('collateral_card_remove_DFI').click()
    checkCollateralFormValues('How much DFI to remove?', 'DFI', '10')
    cy.getByTestID('form_input_text').type('9.993').blur()
    cy.getByTestID('vault_min_share_warning').should('exist')
  })

  it('should have valid vault requirement', () => {
    cy.sendTokenToWallet(['DUSD']).wait(4000)
    cy.getByTestID('bottom_tab_loans').click()
    cy.wait(3000)
    cy.getByTestID('vault_card_0_edit_collaterals_button').click()
    cy.getByTestID('add_collateral_button').click()
    addCollateral('dBTC', '10', '10', '$500.00', '100', '0.00%', vaultId, '0.00%')
    cy.getByTestID('add_collateral_button').click()
    addCollateral('DFI', '18', '4.9', '$490.00', '100', '49.49%', vaultId, '49.49%')
    cy.getByTestID('add_collateral_button').click()
    addCollateral('DUSD', '20', '20', '$20.00', '99', '1.96%', vaultId, '50.48%')
    cy.go('back')
  })
})
