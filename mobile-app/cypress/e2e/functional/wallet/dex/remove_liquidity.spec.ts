import BigNumber from 'bignumber.js'

function createAddLiquidityToWallet (): void {
  cy.createEmptyWallet(true)

  cy.getByTestID('header_settings').click()
  cy.sendDFItoWallet().sendTokenToWallet(['ETH-DFI']).wait(3000)
  cy.getByTestID('bottom_tab_dex').click().wait(1000)
  cy.getByTestID('close_dex_guidelines').click()
  cy.getByTestID('dex_tabs_YOUR_POOL_PAIRS').click().wait(1000)
  cy.getByTestID('your_liquidity_tab').wait(2000)
    .getByTestID('pool_pair_row_your').should('have.length', 1)

  cy.getByTestID('your_liquidity_tab')
    .wait(2000).getByTestID('pool_pair_row_your').first()
    .invoke('text').should(text => expect(text).to.contains('10.00000000'))

  cy.getByTestID('pool_pair_remove_dETH-DFI').click().wait(1000)
  cy.getByTestID('remove_liquidity_calculation_summary').should('not.exist')
}

function validatePriceSectionInfo (testID: string): void {
  cy.getByTestID(`${testID}_0`).should('exist')
  cy.getByTestID(`${testID}_0_label`).contains('dETH to receive')
  cy.getByTestID(`${testID}_1`).should('exist')
  cy.getByTestID(`${testID}_1_label`).contains('DFI to receive')
}

function validatePriceSelectionOnPercentage (): void {
  cy.getByTestID('25%_amount_button').click().wait(200)
  cy.getByTestID('tokens_remove_amount_input').should('have.value', '2.50000000')

  cy.getByTestID('50%_amount_button').click().wait(200)
  cy.getByTestID('tokens_remove_amount_input').should('have.value', '5.00000000')

  cy.getByTestID('75%_amount_button').click().wait(200)
  cy.getByTestID('tokens_remove_amount_input').should('have.value', '7.50000000')
}

context('Wallet - DEX - Remove Liquidity', () => {
  before(function () {
    createAddLiquidityToWallet()
  })

  after(function () {
    // Remove added liquidity
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('dex_tabs_YOUR_POOL_PAIRS').click().wait(1000)
    cy.getByTestID('pool_pair_remove_dETH-DFI').click().wait(1000)
    cy.getByTestID('75%_amount_button').click().wait(200)
    cy.getByTestID('button_continue_remove_liq').click()
    cy.getByTestID('button_confirm_remove').click().wait(2000)
    cy.closeOceanInterface()
  })

  it('should disable continue button by default', () => {
    cy.getByTestID('button_continue_remove_liq').should('have.attr', 'aria-disabled')
  })

  it('should disable continue button when input is invalid but enable when input is valid', () => {
    cy.getByTestID('tokens_remove_amount_input').clear().type('10000')
    cy.getByTestID('button_continue_remove_liq').should('have.attr', 'aria-disabled')
    cy.getByTestID('tokens_remove_amount_input').clear().type('2')
    cy.getByTestID('button_continue_remove_liq').should('not.have.attr', 'aria-disabled')
  })

  it('should show correct calculation summary when input is valid', () => {
    validatePriceSectionInfo('pricerate_value')
    cy.getByTestID('pricerate_value_0_label').contains('dETH to receive')
    cy.getByTestID('pricerate_value_0_rhsUsdAmount').should('have.text', '$2,000.00')
    cy.getByTestID('pricerate_value_1_label').contains('DFI to receive')
    cy.getByTestID('pricerate_value_1_rhsUsdAmount').should('have.text', '$2,000.00')
  })

  it('should show correct calculation summary based on percentage input', () => {
    validatePriceSelectionOnPercentage()
  })
})

context('Wallet - DEX - Remove Liquidity Confirm Txn', () => {
  beforeEach(function () {
    createAddLiquidityToWallet()
  })

  afterEach(function () {
    cy.getByTestID('pool_pair_row_your').should('not.exist')
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('portfolio_row_17').should('not.exist')
  })

  it('Should be able to remove liquidity', function () {
    cy.getByTestID('MAX_amount_button').click().wait(200)
    cy.getByTestID('pricerate_value_0').invoke('text').then((valueA) => {
      expect(new BigNumber(valueA).toNumber()).be.gte(new BigNumber('99').toNumber())
      cy.getByTestID('pricerate_value_1').invoke('text').then((valueB) => {
        expect(new BigNumber(valueB).toNumber()).be.gte(new BigNumber('0.99').toNumber())
        cy.getByTestID('button_continue_remove_liq').click()
        cy.getByTestID('button_cancel_remove').click()
        cy.getByTestID('remove_liquidity_calculation_summary').should('exist')
        cy.getByTestID('button_continue_remove_liq').click()
        cy.getByTestID('confirm_title').should('have.text', 'You are removing LP tokens')
        cy.getByTestID('text_remove_liquidity_amount').should('have.text', '10.00000000')
        cy.getByTestID('confirm_pricerate_value_0_label').contains('dETH to receive')
        cy.getByTestID('confirm_pricerate_value_0').should('have.text', new BigNumber(valueA).toFixed(8))
        cy.getByTestID('confirm_pricerate_value_1_label').contains('DFI to receive')
        cy.getByTestID('confirm_pricerate_value_1').should('have.text', new BigNumber(valueB).toFixed(8))

        cy.getByTestID('button_confirm_remove').click().wait(2000)
        cy.closeOceanInterface()
      })
    })
  })

  it('should be able to remove correct liquidity when user cancel a tx and updated some inputs', function () {
    const oldAmount = '5.00000000'
    const newAmount = '10.00000000'
    cy.getByTestID('50%_amount_button').click().wait(200)
    cy.getByTestID('pricerate_value_0').invoke('text').then((value) => {
      expect(new BigNumber(value).toNumber()).be.gte(new BigNumber('49').toNumber())
    })
    cy.getByTestID('pricerate_value_1').invoke('text').then((value) => {
      expect(new BigNumber(value).toNumber()).be.gte(new BigNumber('0.49').toNumber())
    })
    cy.getByTestID('button_continue_remove_liq').click()

    cy.getByTestID('confirm_title').should('have.text', 'You are removing LP tokens')
    cy.getByTestID('text_remove_liquidity_amount').should('have.text', oldAmount)
    validatePriceSectionInfo('pricerate_value')

    // Prices section
    cy.getByTestID('pricerate_value_0_label').contains('dETH to receive')
    cy.getByTestID('pricerate_value_0_rhsUsdAmount').should('have.text', '$5,000.00')
    cy.getByTestID('pricerate_value_1_label').contains('DFI to receive')
    cy.getByTestID('pricerate_value_1_rhsUsdAmount').should('have.text', '$5,000.00')

    cy.getByTestID('button_confirm_remove').click().wait(2000)
    // Check for authorization page description
    cy.getByTestID('txn_authorization_description')
      .contains(`Removing ${new BigNumber(oldAmount).toFixed(8)} dETH-DFI`)

    // Cancel send on authorisation page
    cy.getByTestID('cancel_authorization').click()
    cy.getByTestID('button_cancel_remove').click()
    // Update input values
    cy.getByTestID('MAX_amount_button').click().wait(200)
    cy.getByTestID('pricerate_value_0').invoke('text').then((value) => {
      expect(new BigNumber(value).toNumber()).be.gte(new BigNumber('99').toNumber())
    })
    cy.getByTestID('pricerate_value_1').invoke('text').then((value) => {
      expect(new BigNumber(value).toNumber()).be.gte(new BigNumber('0.99').toNumber())
    })
    cy.getByTestID('button_continue_remove_liq').click()

    cy.getByTestID('confirm_title').should('have.text', 'You are removing LP tokens')
    cy.getByTestID('text_remove_liquidity_amount').should('have.text', newAmount)
    validatePriceSectionInfo('pricerate_value')
    cy.getByTestID('button_confirm_remove').click().wait(2000)
    // Check for authorization page description
    cy.getByTestID('txn_authorization_description')
      .contains(`Removing ${new BigNumber(newAmount).toFixed(8)} dETH-DFI`)
    cy.closeOceanInterface()
  })
})
