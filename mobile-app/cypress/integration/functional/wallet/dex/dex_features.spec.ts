context('Wallet - DEX - Features', () => {
  beforeEach(function () {
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_dex').click()
    cy.url().should('include', 'app/DEX/DexScreen')
    cy.getByTestID('dex_guidelines_screen').should('exist')
    cy.getByTestID('close_dex_guidelines').click()
  })

  it('should be able to select favorite pairs', function () {
    cy.getByTestID('pool_pair_row_0_dUSDC-DFI').should('exist')
    cy.getByTestID('favorite_dETH-DFI').click()
    cy.getByTestID('pool_pair_row_0_dUSDC-DFI').should('not.exist')
    cy.getByTestID('pool_pair_row_0_dETH-DFI').should('exist')
    cy.reload()
    cy.wait(3000)
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('pool_pair_row_0_dETH-DFI').should('exist')
    cy.getByTestID('favorite_dETH-DFI').click()
    cy.getByTestID('pool_pair_row_0_dETH-DFI').should('not.exist')
    cy.getByTestID('pool_pair_row_0_dUSDC-DFI').should('exist')
    cy.reload()
    cy.wait(3000)
    cy.getByTestID('bottom_tab_dex').click()
    cy.getByTestID('pool_pair_row_0_dUSDC-DFI').should('exist')
  })

  it('should be able to search for a DEX pair', function () {
    cy.getByTestID('dex_search_icon').click()
    cy.getByTestID('dex_search_input').type('dETH').blur()
    cy.getByTestID('pool_pair_row_0_dUSDC-DFI').should('not.exist')
    cy.getByTestID('pool_pair_row_0_dETH-DFI').should('exist')
  })
})
