import { createAuction } from '../../../../support/auctionCommands'

context('Wallet - Auctions Detail', () => {
  before(function () {
    createAuction()
  })

  it('should display loan display symbol and batch index', function () {
    cy.getByTestID('batch_card_0').click()
    cy.getByTestID('auction_detail_loan_displaysymbol').invoke('text').then((loan: string) => {
      expect(loan).to.eq('dTU10')
    })
    cy.getByTestID('auction_detail_batch_index').invoke('text').then((batch: string) => {
      expect(batch).to.eq('Batch #1')
    })
  })

  it('should display collateral for auction', function () {
    cy.getByTestID('collateral_token_count').invoke('text').then((count: string) => {
      expect(count).to.eq('1 COLLATERAL TOKENS')
    })
    cy.getByTestID('collateral_row_0_symbol').invoke('text').then((count: string) => {
      expect(count).to.eq('DFI')
    })
    cy.getByTestID('collateral_row_0_amount').invoke('text').then((amount: string) => {
      expect(amount).to.eq('1.00000000 DFI')
    })
    cy.getByTestID('collateral_row_0_USD_amount').invoke('text').then((amount: string) => {
      expect(amount).to.eq('≈ 100.00 USD')
    })
    cy.getByTestID('total_auction_value').invoke('text').then((amount: string) => {
      expect(amount).to.eq(' $100.00')
    })
  })
})
