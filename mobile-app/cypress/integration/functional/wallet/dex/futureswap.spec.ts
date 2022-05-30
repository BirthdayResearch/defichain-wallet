import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'

/*
  Future swap settles every 20 blocks. To ensure that there's ample time (20 blocks) to:
    Future Swap -> Withdraw Future Swap -> Do checks
  the flow must start to a block divisible by 20 + 1
*/
function waitUntilFutureSwapSettles (): void {
  cy.getByTestID('current_block_count').invoke('text').then((text: string) => {
    const currentBlockCount = new BigNumber(text)
    if (!(currentBlockCount.modulo(20)).isEqualTo(1)) {
      cy.wait(2000)
      waitUntilFutureSwapSettles()
    }
  })
}

context('Wallet - DEX - Future Swap', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFITokentoWallet().sendDFItoWallet().sendTokenToWallet(['DUSD', 'TU10', 'BTC', 'ETH']).wait(4000)
    cy.fetchWalletBalance()
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('close_dex_guidelines').click()
    cy.getByTestID('composite_swap').click()
    cy.wait(5000)
  })

  it('should toggle instant vs future swap on each token combination', function () {
    // crypto to loan token
    cy.getByTestID('token_select_button_FROM').click()
    cy.getByTestID('select_dBTC').click().wait(1000)
    cy.getByTestID('token_select_button_TO').click()
    cy.getByTestID('select_dTU10').click()
    cy.getByTestID('50%_amount_button').click().wait(500)
    cy.getByTestID('swap_button_group').should('not.exist')
    cy.getByTestID('button_confirm_submit').click()
    cy.getByTestID('confirm_text_transaction_type').should('have.text', 'Swap')
    cy.go('back')

    // crypto to crypto
    cy.getByTestID('token_select_button_TO').click()
    cy.getByTestID('select_dETH').click()
    cy.getByTestID('50%_amount_button').click().wait(500)
    cy.getByTestID('swap_button_group').should('not.exist')
    cy.getByTestID('button_confirm_submit').click()
    cy.getByTestID('confirm_text_transaction_type').should('have.text', 'Swap')
    cy.go('back')

    // loan (DUSD) to loan token
    cy.getByTestID('token_select_button_FROM').click()
    cy.getByTestID('select_DUSD').click().wait(1000)
    cy.getByTestID('token_select_button_TO').click()
    cy.getByTestID('select_dTU10').click()
    cy.getByTestID('50%_amount_button').click().wait(500)
    cy.getByTestID('swap_button_group').should('exist')
    cy.getByTestID('button_confirm_submit').click()
    cy.getByTestID('confirm_text_transaction_type').should('have.text', 'Swap')
    cy.go('back')
    cy.getByTestID('swap_button_group_FUTURE_SWAP').click()
    cy.getByTestID('button_confirm_submit').click()
    cy.getByTestID('confirm_text_transaction_type').should('have.text', 'Future swap')
    cy.go('back')

    // loan to crypto token
    cy.getByTestID('token_select_button_FROM').click()
    cy.getByTestID('select_dTU10').click().wait(1000)
    cy.getByTestID('token_select_button_TO').click()
    cy.getByTestID('select_dBTC').click()
    cy.getByTestID('50%_amount_button').click().wait(500)
    cy.getByTestID('swap_button_group').should('not.exist')
    cy.getByTestID('button_confirm_submit').click()
    cy.getByTestID('confirm_text_transaction_type').should('have.text', 'Swap')
    cy.go('back')

    // dfi to crypto token
    cy.getByTestID('token_select_button_FROM').click()
    cy.getByTestID('select_DFI').click().wait(1000)
    cy.getByTestID('token_select_button_TO').click()
    cy.getByTestID('select_dBTC').click()
    cy.getByTestID('50%_amount_button').click().wait(500)
    cy.getByTestID('swap_button_group').should('not.exist')
    cy.getByTestID('button_confirm_submit').click()
    cy.getByTestID('confirm_text_transaction_type').should('have.text', 'Swap')
    cy.go('back')
  })

  it('should display future swap option if DUSD -> Loan token selected', function () {
    cy.getByTestID('token_select_button_FROM').click()
    cy.getByTestID('select_DUSD').click().wait(1000)
    cy.getByTestID('token_select_button_TO').click()
    cy.getByTestID('select_dTU10').click()
    cy.getByTestID('swap_button_group').should('exist')
  })

  it('should display oracle price +5% if DUSD -> Loan token', function () {
    cy.getByTestID('swap_button_group_FUTURE_SWAP').click()
    cy.getByTestID('oracle_price_percentage').should('have.text', 'Oracle price +5%')
    cy.getByTestID('future_swap_warning_text').contains('By using future swap, you are')
    cy.getByTestID('future_swap_warning_text').contains('buying dTU10 at 5% more')
    cy.getByTestID('future_swap_warning_text').contains('than the oracle price at Settlement block')
  })

  it('should disable continue button if amount is >available/zero/NaN', function () {
    cy.getByTestID('text_input_tokenA').clear().type('a')
    cy.getByTestID('button_confirm_submit').should('have.attr', 'aria-disabled')

    cy.getByTestID('text_input_tokenA').clear().type('0')
    cy.getByTestID('button_confirm_submit').should('have.attr', 'aria-disabled')

    cy.getByTestID('text_input_tokenA').clear().type('1000')
    cy.getByTestID('button_confirm_submit').should('have.attr', 'aria-disabled')
  })

  it('should display correct transaction details', function () {
    cy.getByTestID('estimated_to_receive').should('have.text', 'Oracle price +5%')
    cy.getByTestID('text_fee').should('exist')
    cy.getByTestID('execution_block').should('exist')
    cy.getByTestID('time_remaining').should('exist')
  })

  it('should display correct confirmation details', function () {
    cy.getByTestID('MAX_amount_button').click()
    cy.getByTestID('button_confirm_submit').click()
    cy.getByTestID('confirm_text_transaction_type').should('have.text', 'Future swap')
    cy.getByTestID('confirm_text_transaction_date').should('have.text', dayjs().add(30, 'second').format('MMM D, YYYY')) // blocksSeconds = 30
    cy.getByTestID('confirm_estimated_to_receive').should('have.text', 'Oracle price +5%')
    cy.getByTestID('confirm_text_fee').should('exist')
    cy.getByTestID('resulting_DUSD').should('have.text', '0.00000000')
    cy.getByTestID('resulting_DUSD_suffix').should('have.text', 'DUSD')
    cy.getByTestID('resulting_dTU10').should('have.text', 'Oracle price +5%')
    cy.wait(3000)
    cy.getByTestID('button_confirm_swap').click().wait(3000)
    cy.getByTestID('txn_authorization_description').should('have.text', 'Swap on future block 10.00000000 DUSD to dTU10 on oracle price +5%')
    cy.closeOceanInterface()
  })

  it('should display future swap option if Loan token -> DUSD selected', function () {
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('composite_swap').click()
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
    cy.getByTestID('future_swap_warning_text').contains('than the oracle price at Settlement block')
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

context('Wallet - Future Swap -> Display -> Withdraw flow', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFITokentoWallet().sendDFItoWallet().sendTokenToWallet(['TU10', 'DUSD', 'BTC']).wait(3000)
    cy.fetchWalletBalance()
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('close_dex_guidelines').click()
    cy.getByTestID('composite_swap').click()
    cy.wait(5000)
  })

  it('should disable continue button if amount is >available/zero/NaN', function () {
    cy.getByTestID('token_select_button_FROM').click()
    cy.getByTestID('select_DUSD').click().wait(1000)
    cy.getByTestID('token_select_button_TO').click()
    cy.getByTestID('select_dTU10').click()
    cy.getByTestID('swap_button_group_FUTURE_SWAP').click()
    cy.getByTestID('text_input_tokenA').clear().type('a')
    cy.getByTestID('button_confirm_submit').should('have.attr', 'aria-disabled')

    cy.getByTestID('text_input_tokenA').clear().type('0')
    cy.getByTestID('button_confirm_submit').should('have.attr', 'aria-disabled')

    cy.getByTestID('text_input_tokenA').clear().type('1000')
    cy.getByTestID('button_confirm_submit').should('have.attr', 'aria-disabled')
  })

  it('should future swap DUSD -> dTU10', function () {
    waitUntilFutureSwapSettles()
    cy.getByTestID('MAX_amount_button').click()
    cy.getByTestID('button_confirm_submit').click()
    cy.wait(3000)
    cy.getByTestID('button_confirm_swap').click().wait(3000)
    cy.closeOceanInterface()
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('pending_future_swaps').click()
  })

  it('should display correct withdraw transaction details', function () {
    cy.getByTestID('DUSD-dTU10').click()
    cy.getByTestID('text_input_percentage').clear().type('6')
    cy.getByTestID('text_amount_to_withdraw').should('have.text', '6.00000000')
    cy.getByTestID('displayed_withdraw_amount').should('have.text', '6.00000000')
    cy.getByTestID('text_remaining_amount').should('have.text', '4.00000000')
    cy.getByTestID('text_fee').should('exist')
    cy.getByTestID('button_confirm_submit').click()
  })

  it('should display correct confirmation withdraw transaction details', function () {
    cy.getByTestID('confirm_text_transaction_type').should('have.text', 'Withdraw future swap')
    cy.getByTestID('confirm_text_remaining_amount').should('have.text', '4.00000000')
    cy.getByTestID('confirm_text_fee').should('exist')
    cy.getByTestID('button_confirm_withdraw_future_swap').click().wait(3000)
    cy.getByTestID('txn_authorization_description').should('have.text', 'Withdraw locked amount 6.00000000 DUSD from future swap')
    cy.closeOceanInterface()
  })

  it('should display partial withdrawal amount', function () {
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('pending_future_swaps').click()
    cy.getByTestID('DUSD-dTU10_amount').should('have.text', '4.00000000 DUSD')
  })

  it('should settle the future swap on next settlement block', function () {
    waitUntilFutureSwapSettles()
    cy.getByTestID('DUSD-dTU10_amount').should('not.exist')
  })
})
