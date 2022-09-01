const samplePoolpairs = [
  {
    id: "16",
    symbol: "BTC-DFI",
    displaySymbol: "dBTC-DFI",
    name: "Playground BTC-Default Defi token",
    status: true,
    tokenA: {
      symbol: "BTC",
      displaySymbol: "dBTC",
      id: "1",
      reserve: "1005",
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      reserve: "995.02487563",
      blockCommission: "0",
    },
    priceRatio: {
      ab: "1.01002499",
      ba: "0.9900745",
    },
    commission: "0",
    totalLiquidity: {
      token: "1000",
      usd: "19900497.5126",
    },
    tradeEnabled: true,
    ownerAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
    rewardPct: "0.0909091",
    creation: {
      tx: "06c257bc049712f5a1e5eec4820a0a6dd070d7fb0af708c2b3e25e024de8825c",
      height: 134,
    },
    apr: {
      reward: 61.10638156468498,
      total: 61.10638156468498,
    },
  },
  {
    id: "21",
    symbol: "DUSD-DFI",
    displaySymbol: "DUSD-DFI",
    name: "Decentralized USD-Default Defi token",
    status: true,
    tokenA: {
      symbol: "DUSD",
      displaySymbol: "DUSD",
      id: "15",
      reserve: "730",
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      reserve: "73",
      blockCommission: "0",
    },
    priceRatio: {
      ab: "10",
      ba: "0.1",
    },
    commission: "0.02",
    totalLiquidity: {
      token: "230.84626918",
      usd: "1460",
    },
    tradeEnabled: true,
    ownerAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
    rewardPct: "0.09090909",
    creation: {
      tx: "0b5971172f316ba595429a2dde131c816a060f91af8e4e6905c5ef8a21a045b8",
      height: 150,
    },
    apr: {
      reward: 832909.08258,
      total: 832909.08258,
    },
  },
  {
    id: "22",
    symbol: "TU10-DUSD",
    displaySymbol: "dTU10-DUSD",
    name: "Decentralized TU10-Decentralized USD",
    status: true,
    tokenA: {
      symbol: "TU10",
      displaySymbol: "dTU10",
      id: "11",
      reserve: "0.73",
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DUSD",
      displaySymbol: "DUSD",
      id: "15",
      reserve: "146",
      blockCommission: "0",
    },
    priceRatio: {
      ab: "0.005",
      ba: "200",
    },
    commission: "0.02",
    totalLiquidity: {
      token: "10.32375855",
      usd: "292",
    },
    tradeEnabled: true,
    ownerAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
    rewardPct: "0.09090909",
    creation: {
      tx: "d891d354e8d2f11757e7270368f6686262effbfa6d36b202f95c3a5e90f3eb79",
      height: 151,
    },
    apr: {
      reward: 4164545.4129,
      total: 4164545.4129,
    },
  },
];

function interceptPoolpairWithSampleData(): void {
  cy.intercept("**/poolpairs?size=*", {
    body: {
      data: samplePoolpairs,
    },
  });
}

context("Wallet - DEX - Features", () => {
  beforeEach(() => {
    cy.createEmptyWallet(true);
    cy.getByTestID("bottom_tab_dex").click();
    cy.url().should("include", "app/DEX/DexScreen");
  });

  it("should be able to select favorite pairs", () => {
    cy.getByTestID("pool_pair_row_0_dUSDC-DFI").should("exist");
    cy.getByTestID("dex_search_icon").click();
    cy.getByTestID("dex_search_input").type("eth");
    cy.getByTestID("favorite_pair_18").click();
    cy.getByTestID("pool_pair_row_0_dUSDC-DFI").should("not.exist");
    cy.getByTestID("pool_pair_row_0_dETH-DFI").should("exist");
    cy.reload();
    cy.wait(3000);
    cy.getByTestID("bottom_tab_dex").click();
    cy.getByTestID("pool_pair_row_0_dETH-DFI").should("exist");
    cy.getByTestID("favorite_pair_18").click();
    cy.getByTestID("pool_pair_row_0_dETH-DFI").should("not.exist");
    cy.getByTestID("pool_pair_row_0_dUSDC-DFI").should("exist");
    cy.reload();
    cy.wait(3000);
    cy.getByTestID("bottom_tab_dex").click();
    cy.getByTestID("pool_pair_row_0_dUSDC-DFI").should("exist");
  });

  it("should be able to search for a DEX pair", () => {
    cy.getByTestID("dex_search_icon").click();
    cy.getByTestID("dex_search_input").type("dETH").blur();
    cy.getByTestID("pool_pair_row_0_dUSDC-DFI").should("not.exist");
    cy.getByTestID("pool_pair_row_0_dETH-DFI").should("exist");
  });
});

context("Wallet - DEX - Button filtering", () => {
  function validateAvailablePoolpairAction(
    poolpairDisplaySymbol: string
  ): void {
    cy.getByTestID(`pair_symbol_${poolpairDisplaySymbol}`).click();
    cy.getByTestID("poolpair_token_details_add_liquidity").click();
    cy.url().should("include", "DEX/AddLiquidity");
    cy.go("back");
    cy.getByTestID("poolpair_token_details_composite_swap").click();
    cy.url().should("include", "DEX/CompositeSwap");
    cy.getByTestID("token_select_button_FROM").should(
      "have.attr",
      "aria-disabled"
    );
    cy.getByTestID("token_select_button_TO").should(
      "have.attr",
      "aria-disabled"
    );
    cy.go("back");
    cy.go("back");
  }

  function validateEmptyPairsInSearch(filter: string): void {
    cy.getByTestID(`dex_button_group_${filter}_PAIRS`).click();
    cy.getByTestID("dex_search_icon").click();
    cy.getByTestID("pool_pair_row").should("not.exist");
    cy.getByTestID("dex_search_input_close").click();
  }

  describe("Tab - Available pool pairs", () => {
    before(() => {
      interceptPoolpairWithSampleData();
      cy.createEmptyWallet(true);
      cy.getByTestID("bottom_tab_dex").click();
      cy.url().should("include", "app/DEX/DexScreen");
    });

    it("should set filter as All pairs by default and display all pairs", () => {
      interceptPoolpairWithSampleData();
      cy.getByTestID("dex_button_group_ALL_PAIRS_active").should("exist");
      cy.getByTestID("pair_symbol_dBTC-DFI").should("exist");
      cy.getByTestID("pair_symbol_DUSD-DFI").should("exist");
      cy.getByTestID("pair_symbol_dTU10-DUSD").should("exist");
    });

    it("should set display all DFI pairs", () => {
      interceptPoolpairWithSampleData();
      cy.getByTestID("dex_button_group_DFI_PAIRS").click();
      cy.getByTestID("dex_button_group_DFI_PAIRS_active").should("exist");
      cy.getByTestID("pair_symbol_dBTC-DFI").should("exist");
      cy.getByTestID("pair_symbol_DUSD-DFI").should("exist");
      cy.getByTestID("pair_symbol_dTU10-DUSD").should("not.exist");
    });

    it("should set display all DUSD pairs", () => {
      interceptPoolpairWithSampleData();
      cy.getByTestID("dex_button_group_DUSD_PAIRS").click();
      cy.getByTestID("dex_button_group_DUSD_PAIRS_active").should("exist");
      cy.getByTestID("pair_symbol_dBTC-DFI").should("not.exist");
      cy.getByTestID("pair_symbol_DUSD-DFI").should("exist");
      cy.getByTestID("pair_symbol_dTU10-DUSD").should("exist");
    });

    it("should be able to navigate to add liquidity and swap page upon switching filters", () => {
      interceptPoolpairWithSampleData();
      // All pairs filter
      cy.getByTestID("dex_button_group_ALL_PAIRS").click();
      validateAvailablePoolpairAction("dBTC-DFI");
      // DFI pairs filter
      cy.getByTestID("dex_button_group_DFI_PAIRS").click();
      validateAvailablePoolpairAction("DUSD-DFI");
      // DUSD pairs filter
      cy.getByTestID("dex_button_group_DUSD_PAIRS").click();
      validateAvailablePoolpairAction("dTU10-DUSD");
    });

    it("should not display any poolpair when search input is active and empty regardless of filter", () => {
      interceptPoolpairWithSampleData();
      validateEmptyPairsInSearch("ALL");
      validateEmptyPairsInSearch("DFI");
      validateEmptyPairsInSearch("DUSD");
    });
  });

  describe("Tab - Your pool pairs", () => {
    function validateYourPoolpairs(filter: string): void {
      cy.getByTestID(`dex_button_group_${filter}_PAIRS`).click();
      cy.getByTestID("dex_tabs_YOUR_POOL_PAIRS").click();
      cy.getByTestID("pool_pair_row_0_dBTC-DFI").should("exist");
      cy.getByTestID("pool_pair_row_1_DUSD-DFI").should("exist");
      cy.getByTestID("pair_symbol_dBTC-DFI").should("exist");
      cy.getByTestID("pair_symbol_DUSD-DFI").should("exist");
    }

    before(() => {
      cy.sendTokenToWallet(["BTC-DFI"])
        .sendTokenToWallet(["DUSD-DFI"])
        .wait(3000);
      cy.getByTestID("bottom_tab_dex").click();
    });

    it("should not be affected by filters in Available pool pairs tab", () => {
      interceptPoolpairWithSampleData();
      validateYourPoolpairs("ALL");
      // DFI pairs
      cy.getByTestID("dex_tabs_AVAILABLE_POOL_PAIRS").click();
      validateYourPoolpairs("DFI");
      // // DUSD pairs
      cy.getByTestID("dex_tabs_AVAILABLE_POOL_PAIRS").click();
      validateYourPoolpairs("DUSD");
    });
  });
});
