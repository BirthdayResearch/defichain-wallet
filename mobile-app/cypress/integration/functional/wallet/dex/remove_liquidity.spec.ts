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

  cy.getByTestID('price_a').contains('0.00000000')
  cy.getByTestID('price_b').contains('0.00000000')
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
    cy.getByTestID('button_slider_max').click().wait(1000)
    cy.getByTestID('button_continue_remove_liq').click()
    cy.getByTestID('button_confirm_remove').click().wait(2000)
    cy.closeOceanInterface()
  })

  it('should display price based on pool tokenA:tokenB ratio regardless removal amount', function () {
    cy.wait(1000)
    cy.getByTestID('text_a_to_b_price').contains('0.01000000')
    cy.getByTestID('text_a_to_b_price_suffix').should('have.text', 'DFI per dETH')
    cy.getByTestID('text_a_to_b_price_label').contains('dETH price in DFI')
    cy.getByTestID('text_b_to_a_price').contains('100.00000000')
    cy.getByTestID('text_b_to_a_price_suffix').should('have.text', 'dETH per DFI')
    cy.getByTestID('text_b_to_a_price_label').contains('DFI price in dETH')
  })

  // // unable to trigger slider change event for react: https://github.com/cypress-io/cypress/issues/1570
  // it('Slider - should be draggable with 0.01% precision', function () {
  //   cy.getByTestID('slider_remove_liq_percentage').invoke('val', '11.1').trigger('change').wait(100)
  //   cy.getByTestID('text_slider_percentage').invoke('text').should(t => expect(t).equals('11.10 %'))

  //   cy.getByTestID('slider_remove_liq_percentage').invoke('val', '99.9949999').trigger('change').wait(100)
  //   cy.getByTestID('text_slider_percentage').invoke('text').should(t => expect(t).equals('99.99 %'))
  // })

  it('should disable continue button by default', () => {
    cy.getByTestID('button_continue_remove_liq').should('have.attr', 'aria-disabled')
  })

  it('should disable continue button when input is invalid', () => {
    cy.getByTestID('text_input_percentage').clear().type('0')
    cy.getByTestID('button_continue_remove_liq').should('have.attr', 'aria-disabled')
    cy.getByTestID('text_input_percentage').clear().type('123')
    cy.getByTestID('button_continue_remove_liq').should('have.attr', 'aria-disabled')
    cy.getByTestID('text_input_percentage').clear().type('100.000000000001')
    cy.getByTestID('button_continue_remove_liq').should('have.attr', 'aria-disabled')
    cy.getByTestID('text_input_percentage').clear().type('1.23.456.789')
    cy.getByTestID('button_continue_remove_liq').should('have.attr', 'aria-disabled')
    cy.getByTestID('text_input_percentage').clear().type('cake')
    cy.getByTestID('button_continue_remove_liq').should('have.attr', 'aria-disabled')
  })

  it('should be able to continue when input valid percentage', () => {
    cy.getByTestID('text_input_percentage').clear().type('1.23')
    cy.getByTestID('button_continue_remove_liq').should('not.have.attr', 'disabled')
    cy.getByTestID('text_input_percentage').clear().type('32.1')
    cy.getByTestID('button_continue_remove_liq').should('not.have.attr', 'disabled')
    cy.getByTestID('text_input_percentage').clear().type('100.00000000')
    cy.getByTestID('button_continue_remove_liq').should('not.have.attr', 'disabled')
  })

  it('Slider "None" / "All" button', function () {
    cy.getByTestID('button_slider_max').click().wait(1000)
    cy.getByTestID('text_input_percentage').invoke('val').then(text => {
      expect(text).to.equal('100.00')
    })
    cy.getByTestID('button_slider_min').click().wait(1000)
    cy.getByTestID('text_input_percentage').invoke('val').then(text => {
      expect(text).to.equal('0.00')
    })
    cy.getByTestID('price_a').contains('0.00000000')
    cy.getByTestID('price_b').contains('0.00000000')

    cy.getByTestID('button_continue_remove_liq').should('have.attr', 'aria-disabled')
  })
})

context('Wallet - DEX - Remove Liquidity Confirm Txn', () => {
  beforeEach(function () {
    createAddLiquidityToWallet()
  })

  afterEach(function () {
    cy.getByTestID('pool_pair_row_your').should('not.exist')
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('balances_row_17').should('not.exist')
  })

  it('Should be able to remove liquidity', function () {
    cy.getByTestID('button_slider_max').click().wait(1000)
    cy.getByTestID('price_a').invoke('text').then((valueA) => {
      expect(new BigNumber(valueA).toNumber()).be.gte(new BigNumber('99').toNumber())
      cy.getByTestID('price_b').invoke('text').then((valueB) => {
        expect(new BigNumber(valueB).toNumber()).be.gte(new BigNumber('0.99').toNumber())
        cy.getByTestID('button_continue_remove_liq').click()
        cy.getByTestID('button_cancel_remove').click()
        cy.getByTestID('button_slider_max').should('exist')
        cy.getByTestID('button_continue_remove_liq').click()

        cy.getByTestID('confirm_title').should('have.text', 'You are removing')
        cy.getByTestID('text_remove_amount').should('have.text', '10.00000000')
        cy.getByTestID('text_remove_amount_suffix').should('have.text', ' dETH-DFI')

        // Transaction Details section
        cy.getByTestID('text_transaction_type').should('have.text', 'Remove liquidity')

        // Estimated Amount to Receive section
        cy.getByTestID('price_a').contains('0.01000000')
        cy.getByTestID('price_a_label').contains('dETH price in DFI')
        cy.getByTestID('price_b').contains('100.00000000')
        cy.getByTestID('price_b_label').contains('DFI price in dETH')

        // Price Details section
        cy.getByTestID('a_amount').should('have.text', new BigNumber(valueA).toFixed(8))
        cy.getByTestID('b_amount').should('have.text', new BigNumber(valueB).toFixed(8))

        cy.getByTestID('button_confirm_remove').click().wait(2000)
        cy.closeOceanInterface()
      })
    })
  })

  it('should be able to remove correct liquidity when user cancel a tx and updated some inputs', function () {
    const oldAmount = '5.00000000'
    const newAmount = '10.00000000'
    cy.getByTestID('text_input_percentage').clear().type('50')
    cy.getByTestID('price_a').invoke('text').then((value) => {
      expect(new BigNumber(value).toNumber()).be.gte(new BigNumber('49').toNumber())
    })
    cy.getByTestID('price_b').invoke('text').then((value) => {
      expect(new BigNumber(value).toNumber()).be.gte(new BigNumber('0.49').toNumber())
    })
    cy.getByTestID('button_continue_remove_liq').click()

    cy.getByTestID('confirm_title').should('have.text', 'You are removing')
    cy.getByTestID('text_remove_amount').should('have.text', oldAmount)
    cy.getByTestID('text_remove_amount_suffix').should('have.text', ' dETH-DFI')
    cy.getByTestID('a_amount').should('exist')
    cy.getByTestID('b_amount').should('exist')
    cy.getByTestID('text_fee').should('exist')
    cy.getByTestID('price_a').contains('0.01000000')
    cy.getByTestID('price_a_label').contains('dETH price in DFI')
    cy.getByTestID('price_a_suffix').should('have.text', 'DFI per dETH')
    cy.getByTestID('price_b').contains('100.00000000')
    cy.getByTestID('price_b_label').contains('DFI price in dETH')
    cy.getByTestID('price_b_suffix').should('have.text', 'dETH per DFI')

    cy.getByTestID('button_confirm_remove').click().wait(2000)
    // Check for authorization page description
    cy.getByTestID('txn_authorization_description')
      .contains(`Removing ${new BigNumber(oldAmount).toFixed(8)} dETH-DFI`)

    // Cancel send on authorisation page
    cy.getByTestID('cancel_authorization').click()
    cy.getByTestID('button_cancel_remove').click()
    // Update input values
    cy.getByTestID('text_input_percentage').clear().type('100')
    cy.getByTestID('price_a').invoke('text').then((value) => {
      expect(new BigNumber(value).toNumber()).be.gte(new BigNumber('99').toNumber())
    })
    cy.getByTestID('price_b').invoke('text').then((value) => {
      expect(new BigNumber(value).toNumber()).be.gte(new BigNumber('0.99').toNumber())
    })
    cy.getByTestID('button_continue_remove_liq').click()

    cy.getByTestID('confirm_title').should('have.text', 'You are removing')
    cy.getByTestID('text_remove_amount').should('have.text', newAmount)
    cy.getByTestID('text_remove_amount_suffix').should('have.text', ' dETH-DFI')
    cy.getByTestID('a_amount').should('exist')
    cy.getByTestID('b_amount').should('exist')
    cy.getByTestID('text_fee').should('exist')
    cy.getByTestID('button_confirm_remove').click().wait(2000)
    // Check for authorization page description
    cy.getByTestID('txn_authorization_description')
      .contains(`Removing ${new BigNumber(newAmount).toFixed(8)} dETH-DFI`)
    cy.closeOceanInterface()
  })
})
