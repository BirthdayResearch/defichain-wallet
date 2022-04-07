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

context('Wallet - DEX - Button filtering', () => {
  function validateAvailablePoolpairAction (poolpairDisplaySymbol: string): void {
    cy.getByTestID(`pool_pair_add_${poolpairDisplaySymbol}`).click()
    cy.url().should('include', 'DEX/AddLiquidity')
    cy.go('back')
    cy.getByTestID(`pool_pair_swap-horiz_${poolpairDisplaySymbol}`).click()
    cy.url().should('include', 'DEX/CompositeSwap')
    cy.getByTestID('token_select_button_FROM').should('have.attr', 'aria-disabled')
    cy.getByTestID('token_select_button_TO').should('have.attr', 'aria-disabled')
    cy.go('back')
  }

  function validateEmptyPairsInSearch (filter: string): void {
    cy.getByTestID(`dex_button_group_${filter}_PAIRS`).click()
    cy.getByTestID('dex_search_icon').click()
    cy.getByTestID('pool_pair_row').should('not.exist')
    cy.getByTestID('dex_search_input_close').click()
  }

  const samplePoolpairs = [
    {
      id: '16',
      symbol: 'BTC-DFI',
      displaySymbol: 'dBTC-DFI',
      name: 'Playground BTC-Default Defi token',
      status: true,
      tokenA: {
        symbol: 'BTC',
        displaySymbol: 'dBTC',
        id: '1',
        reserve: '1005',
        blockCommission: '0'
      },
      tokenB: {
        symbol: 'DFI',
        displaySymbol: 'DFI',
        id: '0',
        reserve: '995.02487563',
        blockCommission: '0'
      },
      priceRatio: {
        ab: '1.01002499',
        ba: '0.9900745'
      },
      commission: '0',
      totalLiquidity: {
        token: '1000',
        usd: '19900497.5126'
      },
      tradeEnabled: true,
      ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
      rewardPct: '0.0909091',
      creation: {
        tx: '06c257bc049712f5a1e5eec4820a0a6dd070d7fb0af708c2b3e25e024de8825c',
        height: 134
      },
      apr: {
        reward: 61.10638156468498,
        total: 61.10638156468498
      }
    },
    {
      id: '21',
      symbol: 'DUSD-DFI',
      displaySymbol: 'DUSD-DFI',
      name: 'Decentralized USD-Default Defi token',
      status: true,
      tokenA: {
        symbol: 'DUSD',
        displaySymbol: 'DUSD',
        id: '15',
        reserve: '730',
        blockCommission: '0'
      },
      tokenB: {
        symbol: 'DFI',
        displaySymbol: 'DFI',
        id: '0',
        reserve: '73',
        blockCommission: '0'
      },
      priceRatio: {
        ab: '10',
        ba: '0.1'
      },
      commission: '0.02',
      totalLiquidity: {
        token: '230.84626918',
        usd: '1460'
      },
      tradeEnabled: true,
      ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
      rewardPct: '0.09090909',
      creation: {
        tx: '0b5971172f316ba595429a2dde131c816a060f91af8e4e6905c5ef8a21a045b8',
        height: 150
      },
      apr: {
        reward: 832909.08258,
        total: 832909.08258
      }
    },
    {
      id: '22',
      symbol: 'TU10-DUSD',
      displaySymbol: 'dTU10-DUSD',
      name: 'Decentralized TU10-Decentralized USD',
      status: true,
      tokenA: {
        symbol: 'TU10',
        displaySymbol: 'dTU10',
        id: '11',
        reserve: '0.73',
        blockCommission: '0'
      },
      tokenB: {
        symbol: 'DUSD',
        displaySymbol: 'DUSD',
        id: '15',
        reserve: '146',
        blockCommission: '0'
      },
      priceRatio: {
        ab: '0.005',
        ba: '200'
      },
      commission: '0.02',
      totalLiquidity: {
        token: '10.32375855',
        usd: '292'
      },
      tradeEnabled: true,
      ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
      rewardPct: '0.09090909',
      creation: {
        tx: 'd891d354e8d2f11757e7270368f6686262effbfa6d36b202f95c3a5e90f3eb79',
        height: 151
      },
      apr: {
        reward: 4164545.4129,
        total: 4164545.4129
      }
    }
  ]

  function interceptPoolpairWithSampleData (): void {
    cy.intercept('**/poolpairs?size=*', {
      body: {
        data: samplePoolpairs
      }
    })
  }
  describe('Tab - Available pool pairs', function () {
    before(function () {
      interceptPoolpairWithSampleData()
      cy.createEmptyWallet(true)
      cy.getByTestID('bottom_tab_dex').click()
      cy.url().should('include', 'app/DEX/DexScreen')
      cy.getByTestID('dex_guidelines_screen').should('exist')
      cy.getByTestID('close_dex_guidelines').click()
    })

    it('should set filter as All pairs by default and display all pairs', function () {
      interceptPoolpairWithSampleData()
      cy.getByTestID('dex_button_group_ALL_PAIRS_active').should('exist')
      cy.getByTestID('your_symbol_dBTC-DFI').should('exist')
      cy.getByTestID('your_symbol_DUSD-DFI').should('exist')
      cy.getByTestID('your_symbol_dTU10-DUSD').should('exist')
    })

    it('should set display all DFI pairs', function () {
      interceptPoolpairWithSampleData()
      cy.getByTestID('dex_button_group_DFI_PAIRS').click()
      cy.getByTestID('dex_button_group_DFI_PAIRS_active').should('exist')
      cy.getByTestID('your_symbol_dBTC-DFI').should('exist')
      cy.getByTestID('your_symbol_DUSD-DFI').should('exist')
      cy.getByTestID('your_symbol_dTU10-DUSD').should('not.exist')
    })

    it('should set display all DUSD pairs', function () {
      interceptPoolpairWithSampleData()
      cy.getByTestID('dex_button_group_DUSD_PAIRS').click()
      cy.getByTestID('dex_button_group_DUSD_PAIRS_active').should('exist')
      cy.getByTestID('your_symbol_dBTC-DFI').should('not.exist')
      cy.getByTestID('your_symbol_DUSD-DFI').should('exist')
      cy.getByTestID('your_symbol_dTU10-DUSD').should('exist')
    })

    it('should be able to display poolpair information upon switching filters', function () {
      interceptPoolpairWithSampleData()
      // DUSD pairs filter
      cy.getByTestID('details_dTU10-DUSD').click()
      cy.getByTestID('available_info_section_dTU10-DUSD').should('exist')
      // DFI pairs filter
      cy.getByTestID('dex_button_group_DFI_PAIRS').click()
      cy.getByTestID('details_DUSD-DFI').click()
      cy.getByTestID('available_info_section_DUSD-DFI').should('exist')
      // All pairs filter
      cy.getByTestID('dex_button_group_ALL_PAIRS').click()
      cy.getByTestID('details_dTU10-DUSD').click()
      cy.getByTestID('available_info_section_dTU10-DUSD').should('exist')
      cy.getByTestID('details_DUSD-DFI').click()
      cy.getByTestID('available_info_section_DUSD-DFI').should('exist')
    })

    it('should be able to navigate to add liquidity and swap page upon switching filters', function () {
      interceptPoolpairWithSampleData()
      // All pairs filter
      validateAvailablePoolpairAction('dBTC-DFI')
      // DFI pairs filter
      cy.getByTestID('dex_button_group_DFI_PAIRS').click()
      validateAvailablePoolpairAction('DUSD-DFI')
      // DUSD pairs filter
      cy.getByTestID('dex_button_group_DUSD_PAIRS').click()
      validateAvailablePoolpairAction('dTU10-DUSD')
    })

    it('should not display any poolpair when search input is active and empty regardless of filter', function () {
      interceptPoolpairWithSampleData()
      validateEmptyPairsInSearch('ALL')
      validateEmptyPairsInSearch('DFI')
      validateEmptyPairsInSearch('DUSD')
    })
  })

  describe('Tab - Your pool pairs', function () {
    function validateYourPoolpairs (filter: string): void {
      cy.getByTestID(`dex_button_group_${filter}_PAIRS`).click()
      cy.getByTestID('dex_tabs_YOUR_POOL_PAIRS').click()
      cy.getByTestID('pool_pair_row_0_dBTC-DFI').should('exist')
      cy.getByTestID('pool_pair_row_1_DUSD-DFI').should('exist')
      cy.getByTestID('details_dBTC-DFI').click()
      cy.getByTestID('your_info_section_dBTC-DFI').should('exist')
      cy.getByTestID('details_DUSD-DFI').click()
      cy.getByTestID('your_info_section_DUSD-DFI').should('exist')
    }

    function validateEmptyPoolpairsInSearch (filter: string): void {
      cy.getByTestID('dex_tabs_AVAILABLE_POOL_PAIRS').click()
      cy.getByTestID(`dex_button_group_${filter}_PAIRS`).click()
      cy.getByTestID('dex_tabs_YOUR_POOL_PAIRS').click()
      cy.getByTestID('dex_search_icon').click()
      cy.getByTestID('pool_pair_row_your').should('not.exist')
      cy.getByTestID('dex_search_input_close').click()
    }

    function validateMatchingPairsInSearch (filter: string): void {
      cy.getByTestID('dex_tabs_AVAILABLE_POOL_PAIRS').click()
      cy.getByTestID(`dex_button_group_${filter}_PAIRS`).click()
      cy.getByTestID('dex_tabs_YOUR_POOL_PAIRS').click()
      cy.getByTestID('dex_search_icon').click()
      cy.getByTestID('dex_search_input').type('btc')
      cy.getByTestID('pool_pair_row_0_dBTC-DFI').should('exist')
      cy.getByTestID('details_dBTC-DFI').click()
      cy.getByTestID('your_info_section_dBTC-DFI').should('exist')
      cy.getByTestID('dex_search_input').clear().type('dusd')
      cy.getByTestID('pool_pair_row_0_DUSD-DFI').should('exist')
      cy.getByTestID('details_DUSD-DFI').click()
      cy.getByTestID('your_info_section_DUSD-DFI').should('exist')
      cy.getByTestID('dex_search_input').clear()
      cy.getByTestID('pool_pair_row_your').should('not.exist')
      cy.getByTestID('dex_search_input_close').click()
    }

    before(function () {
      cy.sendTokenToWallet(['BTC-DFI']).sendTokenToWallet(['DUSD-DFI']).wait(3000)
      cy.getByTestID('bottom_tab_dex').click()
    })

    it('should not be affected by filters in Available pool pairs tab', function () {
      validateYourPoolpairs('ALL')
      // DFI pairs
      cy.getByTestID('dex_tabs_AVAILABLE_POOL_PAIRS').click()
      validateYourPoolpairs('DFI')
      // DUSD pairs
      cy.getByTestID('dex_tabs_AVAILABLE_POOL_PAIRS').click()
      validateYourPoolpairs('DUSD')
    })

    it('should not display any poolpair when search input is active and empty regardless of filter', function () {
      validateEmptyPoolpairsInSearch('ALL')
      validateEmptyPoolpairsInSearch('DFI')
      validateEmptyPoolpairsInSearch('DUSD')
    })

    it('should display matching poolpair when search input is not empty regardless of filter', function () {
      validateMatchingPairsInSearch('ALL')
      validateMatchingPairsInSearch('DFI')
      validateMatchingPairsInSearch('DUSD')
    })
  })
})
