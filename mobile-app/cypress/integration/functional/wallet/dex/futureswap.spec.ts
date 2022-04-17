
context('Wallet - DEX - Future Swap', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFITokentoWallet().sendTokenToWallet(['TU10', 'DUSD', 'BTC']).wait(3000)
    cy.fetchWalletBalance()
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('close_dex_guidelines').click()
    cy.getByTestID('composite_swap').click()
    cy.wait(5000)
  })

  it('should display future swap option if DUSD -> Loan token selected', function () {
    cy.getByTestID('token_select_button_FROM').click()
    cy.getByTestID('select_DUSD').click().wait(1000)
    cy.getByTestID('token_select_button_TO').click()
    cy.getByTestID('select_dTU10').click()
    cy.getByTestID('swap_button_group').should('exist')
  })

  it('should display oracle price +5% if DUSD to Loan token', function () {
    cy.getByTestID('swap_button_group_FUTURE_SWAP').click()
    cy.getByTestID('MAX_amount_button').click()
    cy.getByTestID('oracle_price_percentage').should('have.text', 'Oracle price +5%')
    cy.getByTestID('future_swap_warning_text').contains('By using future swap, you are')
    cy.getByTestID('future_swap_warning_text').contains('buying dTU10 at 5% more')
    cy.getByTestID('future_swap_warning_text').contains('than the oracle price')
  })

  it('should display future swap option if Loan token -> DUSD selected', function () {
    cy.getByTestID('token_select_button_FROM').click()
    cy.getByTestID('select_dTU10').click().wait(1000)
    cy.getByTestID('token_select_button_TO').click()
    cy.getByTestID('select_DUSD').click()
  })

  it('should display oracle price -5% if Loan token to DUSD', function () {
    cy.getByTestID('swap_button_group_FUTURE_SWAP').click()
    cy.getByTestID('MAX_amount_button').click()
    cy.getByTestID('oracle_price_percentage').should('have.text', 'Oracle price -5%')
    cy.getByTestID('future_swap_warning_text').contains('By using future swap, you are')
    cy.getByTestID('future_swap_warning_text').contains('selling dTU10 at 5% lower')
    cy.getByTestID('future_swap_warning_text').contains('than the oracle price')
  })

  it('should hide future swap option if no DUSD and loan selected', function () {
    // crypto to loan
    cy.getByTestID('token_select_button_FROM').click()
    cy.getByTestID('select_dBTC').click().wait(1000)
    cy.getByTestID('token_select_button_TO').click()
    cy.getByTestID('select_dTU10').click()
    cy.getByTestID('swap_button_group').should('not.exist')

    // loan to crypto
    cy.getByTestID('token_select_button_FROM').click()
    cy.getByTestID('select_dTU10').click().wait(1000)
    cy.getByTestID('token_select_button_TO').click()
    cy.getByTestID('select_dBTC').click()
    cy.getByTestID('swap_button_group').should('not.exist')

    // dfi to crypto
    cy.getByTestID('token_select_button_FROM').click()
    cy.getByTestID('select_DFI').click().wait(1000)
    cy.getByTestID('token_select_button_TO').click()
    cy.getByTestID('select_dBTC').click()
    cy.getByTestID('swap_button_group').should('not.exist')
  })
})
