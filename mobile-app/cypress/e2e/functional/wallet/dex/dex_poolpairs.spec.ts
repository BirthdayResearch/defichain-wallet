import { samplePoolPair } from "../../../../support/utils";

context("Wallet - DEX - Available Pool Pairs", { testIsolation: false }, () => {
  before(() => {
    cy.intercept("**/poolpairs?size=*", {
      body: {
        data: [],
      },
      delay: 3000,
    });
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.createEmptyWallet(true);
    cy.getByTestID("bottom_tab_dex").click();
  });

  beforeEach(() => {
    cy.intercept("**/poolpairs?size=*", {
      body: {
        data: samplePoolPair,
      },
    });
  });

  it("should display skeleton loader when API has yet to return", () => {
    cy.getByTestID("dex_skeleton_loader").should("exist");
    cy.sendDFItoWallet().sendTokenToWallet(["ETH"]).wait(4000);
  });

  it("should not display skeleton loader when API has return", () => {
    cy.intercept("**/poolpairs?size=*").as("getPoolpairs");
    cy.wait("@getPoolpairs").then(() => {
      cy.getByTestID("dex_skeleton_loader").should("not.exist");
    });
  });

  it("should display 6 available pool pair", () => {
    cy.intercept("**/poolpairs?size=*", {
      body: {
        data: samplePoolPair,
      },
      delay: 3000,
    });
    cy.getByTestID("available_liquidity_tab")
      .getByTestID("pool_pair_row")
      .should("have.length", 6);
  });

  it("should have DUSD-DFI PoolPair as 2th", () => {
    cy.getByTestID("pool_pair_row_1_DUSD-DFI").should("exist");
  });

  it("should place favourite on top of the list", () => {
    cy.getByTestID("favorite_pair_24").click();
    cy.wait(1000);
    cy.getByTestID("pool_pair_row_0_DUSD-DFI").should("exist");
  });

  it("should not display any pool pair at initial state of search", () => {
    cy.getByTestID("dex_search_icon").click();
    cy.getByTestID("pool_pair_row").should("not.exist");
  });

  it("should be able to search available poolpair by querying in search input", () => {
    cy.getByTestID("dex_search_input").type("btc-dfi");
    cy.getByTestID("pool_pair_row_0_dBTC-DFI").should("exist");
  });

  it("should not display any pool pair with non-exist query", () => {
    cy.getByTestID("dex_search_input").clear().type("foo");
    cy.getByTestID("available_liquidity_tab")
      .getByTestID("pool_pair_row")
      .should("not.exist");
    cy.getByTestID("dex_search_input").clear();
    cy.getByTestID("dex_search_input_close").click();
  });

  it("should display available pair values correctly", () => {
    cy.getByTestID("dex_tabs_AVAILABLE_POOL_PAIRS_active").click();
    cy.getByTestID("pool_pair_row_3_dETH-DFI").should("exist").click();

    cy.getByTestID("price_rate_tokenA_value").should(
      "have.text",
      "0.01000000 DFI",
    );
    cy.getByTestID("price_rate_tokenB_value").should(
      "have.text",
      "100.00000000 dETH",
    );
    cy.getByTestID("pooled_tokenA_value").should(
      "have.text",
      "100,000.00000000 dETH",
    );
    // (1000 / 100000) * (10000000 / 1000) * 100,000 ETH
    cy.getByTestID("pooled_tokenA_value_rhsUsdAmount").should(
      "have.text",
      "$10,000,000.00",
    );
    cy.getByTestID("pooled_tokenB_value").should(
      "have.text",
      "1,000.00000000 DFI",
    );
    // (10000000 / 1000) * 1,000 DFI
    cy.getByTestID("pooled_tokenB_value_rhsUsdAmount").should(
      "have.text",
      "$10,000,000.00",
    );

    cy.getByTestID("total_liquidity_value").should(
      "have.text",
      "10,000.00000000",
    );
    cy.getByTestID("total_liquidity_value_rhsUsdAmount").should(
      "have.text",
      "$20,000,000.00",
    );

    // 39.3427 * 100
    cy.getByTestID("apr_total_value").should("have.text", "3,934.27%");
  });

  it("should be able to prepare direct swap", () => {
    cy.getByTestID("poolpair_token_details_composite_swap").click().wait(5000);
    cy.getByTestID("MAX_amount_button").click().wait(3000);

    cy.getByTestID("button_confirm_submit").should("not.have.attr", "disabled");
    cy.getByTestID("bottom_tab_dex").click();
  });
});

context("Wallet - DEX - Your Pool Pairs", { testIsolation: false }, () => {
  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.createEmptyWallet(true);
    cy.sendTokenToWallet(["ETH-DFI"]).wait(3000);
    cy.getByTestID("bottom_tab_dex").click();
    cy.getByTestID("dex_tabs_YOUR_POOL_PAIRS").click().wait(1000);
  });

  it("should not display tab grouping", () => {
    cy.getByTestID("dex_button_group").should("not.exist");
  });

  it("should not display TVL", () => {
    cy.getByTestID("DEX_TVL").should("not.exist");
  });

  it("should display empty results", () => {
    cy.intercept("**/address/**/tokens?size=*", {
      body: {
        data: [],
      },
    }).as("getTokens");

    cy.wait("@getTokens").then(() => {
      cy.getByTestID("empty_active_poolpair").should("not.exist");
    });
  });

  it("should not display favourite button", () => {
    cy.getByTestID("favorite_pair_20").should("not.exist");
  });

  it("should display your pool pair values correctly", () => {
    cy.intercept("**/poolpairs?size=*", {
      body: {
        data: samplePoolPair,
      },
    }).as("getPoolPairs");

    cy.wait("@getPoolPairs").then(() => {
      cy.wait(1000);
      cy.getByTestID("pool_pair_row_0_dETH-DFI").click();
      cy.getByTestID("total_liquidity_value").should(
        "have.text",
        "10,000.00000000",
      );
      cy.getByTestID("total_liquidity_value_rhsUsdAmount").should(
        "have.text",
        "$20,000,000.00",
      );
      cy.getByTestID("pooled_tokenA_value").should(
        "have.text",
        "100,000.00000000 dETH",
      );
      // (1000 / 100000) * (10000000 / 1000) * 100,000 ETH
      cy.getByTestID("pooled_tokenA_value_rhsUsdAmount").should(
        "have.text",
        "$10,000,000.00",
      );
      cy.getByTestID("pooled_tokenB_value").should(
        "have.text",
        "1,000.00000000 DFI",
      );
      // (10000000 / 1000) * 1,000 DFI
      cy.getByTestID("pooled_tokenB_value_rhsUsdAmount").should(
        "have.text",
        "$10,000,000.00",
      );

      cy.getByTestID("price_rate_tokenA_value").should(
        "have.text",
        "0.01000000 DFI",
      );
      cy.getByTestID("price_rate_tokenB_value").should(
        "have.text",
        "100.00000000 dETH",
      );

      cy.getByTestID("your_lp_tokens_value").should("have.text", "10.00000000");
      cy.getByTestID("your_lp_tokenA_value_rhsUsdAmount").should(
        "have.text",
        "$10,000.00",
      );

      // 39.3427 * 100
      cy.getByTestID("apr_total_value").should("have.text", "3,934.27%");
    });
  });
});
