context('Wallet - Token Detail', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(['BTC'])
      .wait(10000)
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('balances_row_1').should('exist')
    cy.getByTestID('balances_row_1_amount').contains(10)
    cy.getByTestID('balances_row_1').click()
  })

  it('should be able to click token BTC', function () {
    cy.getByTestID('token_detail_amount').contains(10)
    cy.getByTestID('send_button').should('exist')
    cy.getByTestID('receive_button').should('exist')
    cy.getByTestID('convert_button').should('not.exist')
    cy.getByTestID('remove_liquidity_button').should('not.exist')
  })

  it('should be able to redirect with Add Liquidity', function () {
    cy.getByTestID('add_liquidity_button').should('exist')
    cy.getByTestID('add_liquidity_button').click()
    cy.url().should('include', 'DEX/AddLiquidity')
  })

  it('should be able to redirect with Pool Swap', function () {
    cy.getByTestID('swap_button').should('exist')
    cy.getByTestID('swap_button').click()
    cy.url().should('include', 'DEX/CompositeSwap')
  })
})

context('Wallet - Token Detail - LP', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(['ETH-DFI'])
      .wait(10000)
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('balances_row_17').should('exist')
    cy.getByTestID('balances_row_17_amount').contains(10)
    cy.getByTestID('balances_row_17').click()
  })

  it('should be able to click token ETH-DFI', function () {
    cy.getByTestID('token_detail_amount').contains(10)
    cy.getByTestID('send_button').should('exist')
    cy.getByTestID('receive_button').should('exist')
    cy.getByTestID('convert_button').should('not.exist')
    cy.getByTestID('swap_button').should('not.exist')
  })

  it('should be able to redirect with Add Liquidity', function () {
    cy.getByTestID('add_liquidity_button').should('exist')
    cy.getByTestID('add_liquidity_button').click()
    cy.url().should('include', 'DEX/AddLiquidity')
  })

  it('should be able to redirect with Remove Liquidity', function () {
    cy.getByTestID('remove_liquidity_button').should('exist')
    cy.getByTestID('remove_liquidity_button').click()
    cy.url().should('include', 'DEX/RemoveLiquidity')
  })
})

context('Wallet - Token Detail Defiscan redirection', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
  })

  it('should able to redirect to defiscan for BTC', function () {
    cy.sendTokenToWallet(['BTC']).wait(10000)
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('balances_list').should('exist')
    cy.getByTestID('balances_row_1').should('exist')
    cy.getByTestID('balances_row_1_amount').contains(10)
    cy.getByTestID('balances_row_1').click().wait(3000)
    cy.getByTestID('token_detail_explorer_url').should('exist')
  })
})
