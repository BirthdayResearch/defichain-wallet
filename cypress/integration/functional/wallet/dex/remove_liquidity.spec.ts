context('Wallet - DEX - Remove Liquidity', () => {
  before(function () {
    cy.createEmptyWallet(true)

    cy.getByTestID('bottom_tab_settings').click()
    cy.sendDFItoWallet().sendTokenToWallet(['DFI-ETH']).wait(10000)

    cy.getByTestID('bottom_tab_dex').click().wait(1000)

    const list = cy.getByTestID('liquidity_screen_list').wait(2000)
    list.getByTestID('pool_pair_row_your').should('have.length', 1)

    const row = list.getByTestID('pool_pair_row_your').first()
    row.invoke('text').should(text => expect(text).to.contains('10.00000000 DFI-ETH'))

    cy.getByTestID('pool_pair_remove_DFI-ETH').click().wait(1000)

    cy.getByTestID('text_coin_amount_DFI').contains('0.00000000')
    cy.getByTestID('text_coin_amount_ETH').contains('0.00000000')
    cy.getByTestID('remove_liq_symbol_DFI').contains('DFI')
    cy.getByTestID('remove_liq_symbol_ETH').contains('ETH')
  })

  it('should display price based on pool tokenA:tokenB ratio regardless removal amount', function () {
    cy.wait(1000)
    cy.getByTestID('text_a_to_b_price').contains('100.00000000 ETH per DFI')
    cy.getByTestID('text_b_to_a_price').contains('0.01000000 DFI per ETH')
  })

  // // unable to trigger slider change event for react: https://github.com/cypress-io/cypress/issues/1570
  // it('Slider - should be draggable with 0.01% precision', function () {
  //   cy.getByTestID('slider_remove_liq_percentage').invoke('val', '11.1').trigger('change').wait(100)
  //   cy.getByTestID('text_slider_percentage').invoke('text').should(t => expect(t).equals('11.10 %'))

  //   cy.getByTestID('slider_remove_liq_percentage').invoke('val', '99.9949999').trigger('change').wait(100)
  //   cy.getByTestID('text_slider_percentage').invoke('text').should(t => expect(t).equals('99.99 %'))
  // })

  it('should disable continue button by default', () => {
    cy.getByTestID('button_continue_remove_liq').should('have.attr', 'disabled')
  })

  it('should disable continue button when input is invalid', () => {
    cy.getByTestID('text_input_percentage').clear().type('0')
    cy.getByTestID('button_continue_remove_liq').should('have.attr', 'disabled')
    cy.getByTestID('text_input_percentage').clear().type('123')
    cy.getByTestID('button_continue_remove_liq').should('have.attr', 'disabled')
    cy.getByTestID('text_input_percentage').clear().type('100.000000000001')
    cy.getByTestID('button_continue_remove_liq').should('have.attr', 'disabled')
    cy.getByTestID('text_input_percentage').clear().type('1.23.456.789')
    cy.getByTestID('button_continue_remove_liq').should('have.attr', 'disabled')
    cy.getByTestID('text_input_percentage').clear().type('cake')
    cy.getByTestID('button_continue_remove_liq').should('have.attr', 'disabled')
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
    cy.getByTestID('text_coin_amount_DFI').contains('0.00000000')
    cy.getByTestID('text_coin_amount_DFI').contains('0.00000000')

    cy.getByTestID('button_continue_remove_liq').should('have.attr', 'disabled')
  })

  it('Should be able to remove liquidity', function () {
    cy.getByTestID('button_slider_max').click().wait(1000)
    cy.getByTestID('button_continue_remove_liq').click()
    cy.getByTestID('button_cancel_remove').click()
    cy.getByTestID('button_slider_max').should('exist')
  })
})
