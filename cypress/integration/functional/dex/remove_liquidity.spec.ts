context('app/dex/removeLiquidity', () => {
  before(function () {
    cy.createEmptyWallet(true)

    cy.getByTestID('bottom_tab_settings').click()
    cy.sendDFItoWallet().sendTokenToWallet(['DFI-ETH']).wait(6000)
    cy.getByTestID('playground_wallet_fetch_balances').click()

    cy.getByTestID('bottom_tab_dex').click().wait(1000)

    const list = cy.getByTestID('liquidity_screen_list').wait(2000)
    list.getByTestID('pool_pair_row_your').should('have.length', 1)

    const row = list.getByTestID('pool_pair_row_your').first()
    row.invoke('text').should(text => expect(text).to.contains('10.00 DFI-ETH'))

    cy.getByTestID('pool_pair_remove_DFI-ETH').click().wait(1000)

    cy.getByTestID('text_coin_amount_DFI').contains('0')
    cy.getByTestID('text_coin_amount_ETH').contains('0')
    cy.getByTestID('remove_liq_symbol_DFI').contains('DFI')
    cy.getByTestID('remove_liq_symbol_ETH').contains('ETH')
  })

  it('should display price based on pool tokenA:tokenB ratio regardless removal amount', function () {
    cy.wait(1000)
    cy.getByTestID('text_a_to_b_price').contains('0.1 DFI')
    cy.getByTestID('text_b_to_a_price').contains('10 ETH')
  })

  // // unable to trigger slider change event for react: https://github.com/cypress-io/cypress/issues/1570
  // it('Slider - should be draggable with 0.01% precision', function () {
  //   cy.getByTestID('slider_remove_liq_percentage').invoke('val', '11.1').trigger('change').wait(100)
  //   cy.getByTestID('text_slider_percentage').invoke('text').should(t => expect(t).equals('11.10 %'))

  //   cy.getByTestID('slider_remove_liq_percentage').invoke('val', '99.9949999').trigger('change').wait(100)
  //   cy.getByTestID('text_slider_percentage').invoke('text').should(t => expect(t).equals('99.99 %'))
  // })

  it('Slider "None" / "All" button', function () {
    cy.getByTestID('button_slider_max').click().wait(1000)
    cy.getByTestID('text_slider_percentage').contains('100.00 %')
    cy.getByTestID('button_slider_min').click().wait(1000)
    cy.getByTestID('text_slider_percentage').contains('0.00 %')
    cy.getByTestID('text_coin_amount_DFI').contains('0')
    cy.getByTestID('text_coin_amount_DFI').contains('0')

    cy.getByTestID('button_continue_remove_liq').should('have.attr', 'disabled')
  })

  it('Should be able to remove liquidity', function () {
    cy.getByTestID('button_slider_max').click().wait(1000)
    cy.getByTestID('button_continue_remove_liq').click().wait(4000)
    cy.getByTestID('bottom_tab_dex').click().wait(1000)
    cy.wait(5000).getByTestID('oceanInterface_close').click().wait(5000)

    // redirected back to dex root page
    cy.getByTestID('liquidity_screen_list').should('exist')

    // refresh balance
    cy.getByTestID('bottom_tab_settings').click()
    cy.getByTestID('playground_wallet_fetch_balances').click()
    cy.getByTestID('bottom_tab_dex').click().wait(100)

    const list = cy.getByTestID('liquidity_screen_list')
    list.getByTestID('pool_pair_row_your').should('not.exist') // DFI-ETH balance row removed

    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('balances_row_0').should('exist')
    cy.getByTestID('balances_row_1').should('exist')
  })
})
