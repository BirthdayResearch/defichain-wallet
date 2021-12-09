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

  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['BTC']).wait(6000)
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
    checkCollateralDetailValues('EMPTY', '$0.00', '$0.00', '', 'N/A', '150.00', '5.00')
    cy.getByTestID('add_collateral_button').click()
    cy.wait(['@loanCollaterals']).then((intercept: any) => {
      const amounts: any = {
        DFI: 18,
        dBTC: 10
      }
      const data: any[] = intercept.response.body.data
      data.forEach((collateralToken: CollateralToken) => {
        cy.getByTestID(`token_symbol_${collateralToken.token.displaySymbol}`).contains(collateralToken.token.displaySymbol)
        cy.getByTestID(`select_${collateralToken.token.displaySymbol}_value`).contains(amounts[collateralToken.token.displaySymbol] ?? 0)
      })
    })
  })

  it('should add DFI as collateral', function () {
    cy.getByTestID('select_DFI').click()
    cy.getByTestID('add_collateral_button_submit').should('have.attr', 'aria-disabled')
    checkCollateralFormValues('How much DFI to add?', 'DFI', '18')
    cy.getByTestID('form_input_text').type('10').blur()
    cy.getByTestID('add_collateral_button_submit').click()
    checkConfirmEditCollateralValues('You are adding collateral to', vaultId, 'Add Collateral', '100', 'DFI', '10.00000000', '$1,000.00', '100.00%')
    cy.getByTestID('button_confirm_confirm_edit_collateral').click().wait(3000)
    cy.getByTestID('txn_authorization_description')
      .contains(`Adding ${new BigNumber(10).toFixed(8)} DFI as collateral`)
    cy.closeOceanInterface()
  })

  it('should update vault details', function () {
    checkCollateralDetailValues('READY', '$1,000.00', '$0.00', '', 'N/A', '150.00', '5.00')
  })

  it('should update collateral list', function () {
    checkCollateralCardValues('DFI', '10.00000000 DFI', '$1,000.00', '100.00%')
  })

  it('should add dBTC as collateral', function () {
    cy.getByTestID('add_collateral_button').click()
    cy.getByTestID('select_dBTC').click()
    cy.getByTestID('add_collateral_button_submit').should('have.attr', 'aria-disabled')
    checkCollateralFormValues('How much dBTC to add?', 'dBTC', '10')
    cy.getByTestID('form_input_text').type('10').blur()
    cy.getByTestID('add_collateral_button_submit').click()
    checkConfirmEditCollateralValues('You are adding collateral to', vaultId, 'Add Collateral', '100', 'dBTC', '10.00000000', '$500.00', '33.33%')
    cy.getByTestID('button_confirm_confirm_edit_collateral').click().wait(3000)
    cy.getByTestID('txn_authorization_description')
      .contains(`Adding ${new BigNumber(10).toFixed(8)} dBTC as collateral`)
    cy.closeOceanInterface()
  })

  it('should update vault details', function () {
    checkCollateralDetailValues('READY', '$1,500.00', '$0.00', '', 'N/A', '150.00', '5.00')
  })

  it('should update collateral list', function () {
    checkCollateralCardValues('DFI', '10.00000000 DFI', '$1,000.00', '66.67%')
    checkCollateralCardValues('dBTC', '10.00000000 dBTC', '$500.00', '33.33%')
  })

  it('should remove collateral', function () {
    cy.getByTestID('collateral_card_remove_dBTC').click()
    checkCollateralFormValues('How much dBTC to remove?', 'dBTC', '10')
    cy.getByTestID('form_input_text').type('1').blur()
    cy.getByTestID('add_collateral_button_submit').click()
    checkConfirmEditCollateralValues('You are removing collateral from', vaultId, 'Remove Collateral', '100', 'dBTC', '1.00000000', '$450.00', '31.03%')
    cy.getByTestID('button_confirm_confirm_edit_collateral').click().wait(3000)
    cy.getByTestID('txn_authorization_description')
      .contains(`Removing ${new BigNumber(1).toFixed(8)} dBTC collateral from vault`)
    cy.closeOceanInterface()
  })

  it('should update collateral list', function () {
    checkCollateralCardValues('DFI', '10.00000000 DFI', '$1,000.00', '68.97%')
    checkCollateralCardValues('dBTC', '9.00000000 dBTC', '$450.00', '31.03%')
  })
})
