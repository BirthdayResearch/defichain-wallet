context('Wallet - Token Detail', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(['BTC'])
      .wait(10000)
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('portfolio_list').should('exist')
    cy.getByTestID('portfolio_row_1').should('exist')
    cy.getByTestID('portfolio_row_1_amount').contains(10)
    cy.getByTestID('portfolio_row_1').click()
  })

  it('should be able to click token BTC', function () {
    cy.getByTestID('token_detail_amount').contains(10)
    cy.getByTestID('send_button').should('exist')
    cy.getByTestID('receive_button').should('exist')
    cy.getByTestID('convert_button').should('not.exist')
    cy.getByTestID('remove_liquidity_button').should('not.exist')
  })

  it('should be able to redirect to Add Liquidity screen', function () {
    cy.getByTestID('add_liquidity_button').click()
    cy.getByTestID('token_input_primary').clear().type('5')
    cy.getByTestID('button_confirm_continue_add_liq').click()

    /* Redirect back from Confirm Add Liquidity screen */
    cy.go('back')
    /* Redirect back from Add Liquidity screen */
    cy.go('back')
    cy.url().should('include', 'app/TokenDetail')
  })

  it('should be able to redirect to Pool Swap screen', function () {
    cy.getByTestID('swap_button').should('exist')
    cy.getByTestID('swap_button').click()
    cy.url().should('include', 'app/CompositeSwap')
    cy.getByTestID('token_select_button_FROM').should('have.attr', 'aria-disabled')
    cy.getByTestID('token_select_button_TO').should('not.have.attr', 'aria-disabled')
    cy.getByTestID('token_select_button_FROM').should('contain', 'dBTC')
    cy.getByTestID('token_select_button_TO').should('contain', 'Select token')
  })
})

context('Wallet - Token Detail - LP', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(['ETH-DFI', 'ETH'])
      .wait(10000)
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('portfolio_list').should('exist')
    cy.getByTestID('portfolio_row_18').should('exist')
    cy.getByTestID('portfolio_row_18_amount').contains(10)
    cy.getByTestID('portfolio_row_18').click()
  })

  it('should be able to click token ETH-DFI', function () {
    cy.getByTestID('token_detail_amount').contains(10)
    cy.getByTestID('send_button').should('exist')
    cy.getByTestID('receive_button').should('exist')
    cy.getByTestID('convert_button').should('not.exist')
    cy.getByTestID('swap_button').should('not.exist')
  })

  it('should be able to redirect to Add Liquidity screen', function () {
    cy.getByTestID('add_liquidity_button').should('exist')
    cy.getByTestID('add_liquidity_button').click()
    cy.getByTestID('token_input_primary').clear().type('5')
    cy.getByTestID('button_confirm_continue_add_liq').click()

    /* Redirect back from Confirm Add Liquidity screen */
    cy.go('back')
    /* Redirect back from Add Liquidity screen */
    cy.go('back')
    cy.url().should('include', 'app/TokenDetail')
  })

  it('should be able to redirect to Remove Liquidity screen', function () {
    cy.getByTestID('remove_liquidity_button').should('exist')
    cy.getByTestID('remove_liquidity_button').click()
    cy.getByTestID('text_input_percentage').clear().type('10')
    cy.getByTestID('button_continue_remove_liq').click()

    /* Redirect back from ConfirmRemove Liquidity screen */
    cy.go('back')
    /* Redirect back from Remove Liquidity screen */
    cy.go('back')
    cy.url().should('include', 'app/TokenDetail')
  })
})

context('Wallet - Token Detail Defiscan redirection', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
  })

  it('should able to redirect to defiscan for BTC', function () {
    cy.sendTokenToWallet(['BTC']).wait(10000)
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('portfolio_list').should('exist')
    cy.getByTestID('portfolio_row_1').should('exist')
    cy.getByTestID('portfolio_row_1_amount').contains(10)
    cy.getByTestID('portfolio_row_1').click().wait(3000)
    cy.getByTestID('token_detail_explorer_url').should('exist')
  })
})

context('Wallet - Token Detail - DFI', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('header_settings').click()
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .wait(10000)
    cy.getByTestID('bottom_tab_portfolio').click()
    cy.getByTestID('portfolio_list').should('exist')
    cy.getByTestID('dfi_balance_card_touchable').should('exist')
    cy.getByTestID('dfi_balance_card_touchable').click()
  })

  it('should be able to click token DFI', function () {
    cy.getByTestID('token_detail_amount').contains(20)
    cy.getByTestID('send_button').should('exist')
    cy.getByTestID('receive_button').should('exist')
    cy.getByTestID('convert_button').should('exist')
    cy.getByTestID('swap_button_dfi').should('exist')
    cy.getByTestID('swap_button').should('not.exist')
    cy.getByTestID('add_liquidity_button').should('not.exist')
    cy.getByTestID('remove_liquidity_button').should('not.exist')
  })

  it('should be able to redirect with Swap', function () {
    cy.getByTestID('swap_button_dfi').should('exist')
    cy.getByTestID('swap_button_dfi').click()
    cy.url().should('include', 'app/CompositeSwap')
    cy.getByTestID('token_select_button_FROM').should('have.attr', 'aria-disabled')
    cy.getByTestID('token_select_button_TO').should('not.have.attr', 'aria-disabled')
    cy.getByTestID('token_select_button_FROM').should('contain', 'DFI')
    cy.getByTestID('token_select_button_TO').should('contain', 'Select token')
  })
})
