import { AddressToken } from '@defichain/whale-api-client/dist/api/address'

const tokens: AddressToken[] = [
  {
    id: '0',
    symbol: 'DFI',
    amount: '50',
    name: 'Defi',
    isDAT: true,
    isLPS: false,
    symbolKey: 'DFI'
  },
  {
    id: '1',
    symbol: 'tBTC',
    amount: '100',
    name: 'Playground BTC',
    isDAT: true,
    isLPS: false,
    symbolKey: 'tBTC'
  }
]

context('wallet/balances', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    const baseURL = '/v1/playground/rpc'
    cy.intercept(`${baseURL}/sendtoaddress`).as('sendToAddress')
    cy.intercept(`${baseURL}/sendtokenstoaddress`).as('sendTokensToAddress')
    cy.getByTestID('bottom_tab_settings').click()
    cy.getByTestID('playground_wallet_top_up').click()
    cy.getByTestID('playground_token_tBTC').click()
    cy.wait(['@sendToAddress', '@sendTokensToAddress'])
    cy.wait(10000)
    cy.getByTestID('playground_wallet_fetch_balances').click()
    cy.getByTestID('bottom_tab_balances').click()
  })

  it('should display tokens', function () {
    const flatList = cy.getByTestID('balances_list')
    tokens.forEach((item) => {
      const baseTestID = `balances_row_${item.id}`
      flatList.getByTestID('balances_title').should('exist').contains('Portfolio')
      flatList.getByTestID(baseTestID).should('exist')
      flatList.getByTestID(`${baseTestID}_icon`).should('exist')
      flatList.getByTestID(`${baseTestID}_symbol`).should('exist').contains(item.symbol)
      flatList.getByTestID(`${baseTestID}_name`).should('exist').contains(item.name)
      flatList.getByTestID(`${baseTestID}_amount`).should('exist').contains(item.amount)
    })
  })
})
