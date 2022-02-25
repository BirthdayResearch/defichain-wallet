import { CollateralToken } from '@defichain/whale-api-client/dist/api/loan'
import BigNumber from 'bignumber.js'
import {
  checkCollateralCardValues,
  checkCollateralDetailValues,
  checkCollateralFormValues,
  checkConfirmEditCollateralValues
} from '../../../../support/loanCommands'

context('Wallet - Loans - Add/Remove Collateral', () => {
  let vaultId = ''

  function addCollateral (token: string, balance: string, amount: string, usdValue: string, colFactor: string, vaultShare: string): void {
    const precisedAmount = new BigNumber(amount).toFixed(8)
    cy.getByTestID(`select_${token}`).click()
    cy.getByTestID('add_collateral_button_submit').should('have.attr', 'aria-disabled')
    checkCollateralFormValues(`How much ${token} to add?`, token, balance)
    cy.getByTestID('form_input_text').type(amount).blur()
    cy.getByTestID('add_collateral_button_submit').click()
    checkConfirmEditCollateralValues('You are adding collateral to', vaultId, 'Add Collateral', colFactor, token, precisedAmount, usdValue, vaultShare)
    cy.getByTestID('button_confirm_confirm_edit_collateral').click().wait(3000)
    cy.getByTestID('txn_authorization_description')
      .contains(`Adding ${precisedAmount} ${token} as collateral`)
    cy.closeOceanInterface()
  }

  function removeCollateral (token: string, balance: string, amount: string, usdValue: string, colFactor: string, vaultShare: string): void {
    const precisedAmount = new BigNumber(amount).toFixed(8)
    cy.getByTestID(`collateral_card_remove_${token}`).click()
    checkCollateralFormValues(`How much ${token} to remove?`, token, balance)
    cy.getByTestID('form_input_text').type(amount).blur()
    cy.getByTestID('add_collateral_button_submit').click()
    checkConfirmEditCollateralValues('You are removing collateral from', vaultId, 'Remove Collateral', colFactor, token, precisedAmount, usdValue, vaultShare)
    cy.getByTestID('button_confirm_confirm_edit_collateral').click().wait(3000)
    cy.getByTestID('txn_authorization_description')
      .contains(`Removing ${precisedAmount} ${token} collateral from vault`)
    cy.closeOceanInterface()
  }

  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['BTC', 'DUSD']).wait(6000)
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
        DUSD: 10
      }
      const data: any[] = intercept.response.body.data
      data.forEach((collateralToken: CollateralToken) => {
        cy.getByTestID(`token_symbol_${collateralToken.token.displaySymbol}`).contains(collateralToken.token.displaySymbol)
        cy.getByTestID(`select_${collateralToken.token.displaySymbol}_value`).contains(amounts[collateralToken.token.displaySymbol] ?? 0)
      })
    })
  })

  it('should add DFI as collateral', function () {
    addCollateral('DFI', '18', '10', '$1,000.00', '100', '100.00%')
  })

  it('should update vault details', function () {
    checkCollateralDetailValues('READY', '$1,000.00', '$0.00', undefined, 'N/A', '150.00', '5.00')
  })

  it('should update collateral list', function () {
    checkCollateralCardValues('DFI', '10.00000000 DFI', '$1,000.00', '100.00%')
  })

  it('should add dBTC as collateral', function () {
    cy.getByTestID('add_collateral_button').click()
    addCollateral('dBTC', '10', '10', '$500.00', '100', '33.33%')
  })

  it('should update vault details', function () {
    checkCollateralDetailValues('READY', '$1,500.00', '$0.00', undefined, 'N/A', '150.00', '5.00')
  })

  it('should add DUSD as collateral', function () {
    cy.getByTestID('add_collateral_button').click()
    addCollateral('DUSD', '10', '5.1357', '$5.14', '99', '0.34%')
  })

  it('should update collateral list', function () {
    checkCollateralCardValues('DFI', '10.00000000 DFI', '$1,000.00', '66.44%')
    checkCollateralCardValues('dBTC', '10.00000000 dBTC', '$500.00', '33.22%')
    checkCollateralCardValues('DUSD', '5.13570000 DUSD', '$5.14', '0.34%')
  })

  it('should remove dBTC collateral', function () {
    removeCollateral('dBTC', '10', '1', '$450.00', '100', '30.93%')
  })

  it('should remove DUSD collateral', function () {
    removeCollateral('DUSD', '5.1357', '1.8642', '$3.27', '99', '0.22%')
  })

  it('should update collateral list', function () {
    checkCollateralCardValues('DFI', '10.00000000 DFI', '$1,000.00', '68.81%')
    checkCollateralCardValues('dBTC', '9.00000000 dBTC', '$450.00', '30.97%')
    checkCollateralCardValues('DUSD', '3.27150000 DUSD', '$3.27', '0.22%')
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
