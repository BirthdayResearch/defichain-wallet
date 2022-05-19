
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

  it('should hide future swap option if DUSD -> Non Loan token selected', function () {
    cy.getByTestID('token_select_button_FROM').click()
    cy.getByTestID('select_DUSD').click().wait(1000)
    cy.getByTestID('token_select_button_TO').click()
    cy.getByTestID('select_dBTC').click()
    cy.getByTestID('swap_button_group').should('not.exist')
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

  it('should hide future swap option if Non Loan token -> DUSD selected', function () {
    cy.getByTestID('token_select_button_FROM').click()
    cy.getByTestID('select_dBTC').click().wait(1000)
    cy.getByTestID('token_select_button_TO').click()
    cy.getByTestID('select_DUSD').click()
    cy.getByTestID('swap_button_group').should('not.exist')
  })

  it('should display future swap option if Loan token -> DUSD selected', function () {
    cy.getByTestID('token_select_button_FROM').click()
    cy.getByTestID('select_dTU10').click().wait(1000)
    cy.getByTestID('token_select_button_TO').click()
    cy.getByTestID('select_DUSD').click()
    cy.getByTestID('swap_button_group').should('exist')
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

context('Wallet - Balances -> Pending Future Swap Display', () => {
  beforeEach(() => {
    cy.intercept({
      pathname: '**/rpc'
    }, (req) => {
      if (JSON.stringify(req.body).includes('getpendingfutureswap')) {
        req.alias = 'getpendingfutureswap'
        req.continue((res) => {
          res.send({
            body: {
              result: {
                values: [
                  {
                    source: '1.123@DUSD',
                    destination: 'TU10'
                  },
                  {
                    source: '1.234@DUSD',
                    destination: 'TU10'
                  },
                  {
                    source: '321.987654@TU10',
                    destination: 'DUSD'
                  },
                  {
                    source: '1.345@DUSD',
                    destination: 'TS25'
                  }
                ]
              }
            }
          })
        })
      }
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_balances').click()
  })

  it('should display the pending future swaps', () => {
    cy.getByTestID('pending_future_swaps').should('exist')
  })

  it('should navigate to and back to pending future swaps', () => {
    cy.getByTestID('pending_future_swaps').click()
    cy.go('back')
    cy.getByTestID('pending_future_swaps').click()
  })

  it('should display swap amount and symbol', () => {
    cy.getByTestID('pending_future_swaps').click()

    cy.getByTestID('dTU10-DUSD_amount').should('have.text', '321.98765400 dTU10')
    cy.getByTestID('dTU10-DUSD_destination_symbol').should('have.text', 'DUSD')

    cy.getByTestID('DUSD-dTS25_amount').should('have.text', '1.34500000 DUSD')
    cy.getByTestID('DUSD-dTS25_destination_symbol').should('have.text', 'dTS25')
  })

  it('should sum out amount of same source and destination swaps', () => {
    cy.getByTestID('pending_future_swaps').click()
    cy.getByTestID('DUSD-dTU10_amount').should('have.text', '2.35700000 DUSD')
    cy.getByTestID('DUSD-dTU10_destination_symbol').should('have.text', 'dTU10')
  })

  it('should display +5% if DUSD -> loan token', () => {
    cy.getByTestID('pending_future_swaps').click()
    cy.getByTestID('DUSD-dTU10_oracle_price').should('have.text', '+5% on oracle price')
  })

  it('should display -5% if loan token -> DUSD', () => {
    cy.getByTestID('pending_future_swaps').click()
    cy.getByTestID('dTU10-DUSD_oracle_price').should('have.text', '-5% on oracle price')
  })
})
