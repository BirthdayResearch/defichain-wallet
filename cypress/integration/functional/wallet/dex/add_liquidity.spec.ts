context('Wallet - DEX - Add Liquidity', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_dex').click()
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(['BTC']).wait(10000)

    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('pool_pair_add_DFI-BTC').click()
    cy.wait(100)
    cy.getByTestID('token_balance_primary').contains('10')
    cy.getByTestID('token_balance_secondary').contains('10')
  })

  it('should update both token and build summary when click on max amount button', function () {
    cy.getByTestID('MAX_amount_button').first().click()
    cy.getByTestID('token_input_primary').should('have.value', '10.00000000')
    cy.getByTestID('token_input_secondary').should('have.value', '10.00000000')
    cy.getByTestID('a_per_b_price').contains('1')
    cy.getByTestID('a_per_b_unit').contains('BTC per DFI')
    cy.getByTestID('b_per_a_price').contains('1')
    cy.getByTestID('b_per_a_unit').contains('DFI per BTC')
    cy.getByTestID('share_of_pool').contains('1')
  })

  it('should update both token and build summary when click on half amount button', function () {
    cy.getByTestID('token_input_primary').clear()
    cy.getByTestID('50%_amount_button').first().click()
    cy.getByTestID('token_input_primary').should('have.value', '5.00000000')
    cy.getByTestID('token_input_secondary').should('have.value', '5.00000000')
    cy.getByTestID('a_per_b_price').contains('1')
    cy.getByTestID('a_per_b_unit').contains('BTC per DFI')
    cy.getByTestID('b_per_a_price').contains('1')
    cy.getByTestID('b_per_a_unit').contains('DFI per BTC')
    cy.getByTestID('share_of_pool').contains('0.5')
  })

  it('should update both token and build summary base on primary token input', function () {
    cy.getByTestID('token_input_primary').clear().invoke('val').should(text => expect(text).to.contain(''))
    cy.getByTestID('token_input_secondary').invoke('val').should(text => expect(text).to.contain('0'))

    cy.getByTestID('token_input_primary').invoke('attr', 'type', 'text').type('1.23').trigger('change')

    cy.getByTestID('token_input_primary').invoke('val').should(text => expect(text).to.contain('1.23'))
    cy.getByTestID('token_input_secondary').invoke('val').should(text => expect(text).to.contain('1.23'))

    cy.getByTestID('a_per_b_price').contains('1')
    cy.getByTestID('a_per_b_unit').contains('BTC per DFI')
    cy.getByTestID('b_per_a_price').contains('1')
    cy.getByTestID('b_per_a_unit').contains('DFI per BTC')
    cy.getByTestID('share_of_pool').contains('0.12') // 0.12xxx depend on total pool and precision
  })

  it('should update both token and build summary base on secondary token input', function () {
    cy.getByTestID('token_input_secondary').clear().invoke('attr', 'type', 'text').type('7.8').trigger('change')

    cy.getByTestID('token_input_primary').invoke('val').should(text => expect(text).to.contain('7.8'))
    cy.getByTestID('token_input_secondary').invoke('val').should(text => expect(text).to.contain('7.8'))

    cy.getByTestID('a_per_b_price').contains('1')
    cy.getByTestID('a_per_b_unit').contains('BTC per DFI')
    cy.getByTestID('b_per_a_price').contains('1')
    cy.getByTestID('b_per_a_unit').contains('DFI per BTC')
    cy.getByTestID('share_of_pool').contains('0.7') // 0.7xxxx depend on total pool and precision
  })
})
