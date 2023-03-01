import { EnvironmentNetwork } from "@waveshq/walletkit-core";

context("Wallet - Auctions search and sort", () => {
  beforeEach(() => {
    cy.intercept("**/loans/auctions?size=*", {
      body: {
        data: [
          {
            vaultId:
              "e7ebc2a55aaeb263c37e75d8d4b437bb1856767bae85cdc34aa5a573dabaaac4",
            loanScheme: {
              id: "MIN150",
              minColRatio: "150",
              interestRate: "5",
            },
            ownerAddress: "bcrt1qgnmfwckutkvekgulky92r3csyct0z064yvjax5",
            state: "IN_LIQUIDATION",
            batchCount: 1,
            liquidationHeight: 1784,
            liquidationPenalty: 5,
            batches: [
              {
                index: 0,
                collaterals: [
                  {
                    id: "12",
                    amount: "70.00000000",
                    symbol: "DUSD",
                    symbolKey: "DUSD",
                    name: "Decentralized USD",
                    displaySymbol: "DUSD",
                  },
                ],
                loan: {
                  id: "13",
                  amount: "0.00000007",
                  symbol: "TU10",
                  symbolKey: "TU10",
                  name: "Decentralized TU10",
                  displaySymbol: "dTU10",
                  activePrice: {
                    id: "TU10-USD-1752",
                    key: "TU10-USD",
                    isLive: true,
                    block: {
                      hash: "a44b8ac93c7346764704e05c921bb2d05442250b6b4bedb370a26893a5b3cda2",
                      height: 1752,
                      medianTime: 1664451279,
                      time: 1664451285,
                    },
                    active: {
                      amount: "923143427.18159265",
                      weightage: 3,
                      oracles: {
                        active: 3,
                        total: 3,
                      },
                    },
                    next: {
                      amount: "922928043.45957784",
                      weightage: 3,
                      oracles: {
                        active: 3,
                        total: 3,
                      },
                    },
                    sort: "000006d8",
                  },
                },
                froms: [],
              },
            ],
          },
          {
            vaultId:
              "f925180550fe1d7f2fdf6b56ff79377ba24c8ddd3f1310002c3fe341d167bc74",
            loanScheme: {
              id: "MIN150",
              minColRatio: "150",
              interestRate: "5",
            },
            ownerAddress: "bcrt1qgnmfwckutkvekgulky92r3csyct0z064yvjax5",
            state: "IN_LIQUIDATION",
            batchCount: 1,
            liquidationHeight: 1789,
            liquidationPenalty: 5,
            batches: [
              {
                index: 0,
                collaterals: [
                  {
                    id: "0",
                    amount: "10.00000000",
                    symbol: "DFI",
                    symbolKey: "DFI",
                    name: "Default Defi token",
                    displaySymbol: "DFI",
                    activePrice: {
                      id: "DFI-USD-1752",
                      key: "DFI-USD",
                      isLive: true,
                      block: {
                        hash: "a44b8ac93c7346764704e05c921bb2d05442250b6b4bedb370a26893a5b3cda2",
                        height: 1752,
                        medianTime: 1664451279,
                        time: 1664451285,
                      },
                      active: {
                        amount: "100.00000000",
                        weightage: 3,
                        oracles: {
                          active: 3,
                          total: 3,
                        },
                      },
                      next: {
                        amount: "100.00000000",
                        weightage: 3,
                        oracles: {
                          active: 3,
                          total: 3,
                        },
                      },
                      sort: "000006d8",
                    },
                  },
                  {
                    id: "2",
                    amount: "5.00000000",
                    symbol: "ETH",
                    symbolKey: "ETH",
                    name: "Playground ETH",
                    displaySymbol: "dETH",
                    activePrice: {
                      id: "ETH-USD-1752",
                      key: "ETH-USD",
                      isLive: true,
                      block: {
                        hash: "a44b8ac93c7346764704e05c921bb2d05442250b6b4bedb370a26893a5b3cda2",
                        height: 1752,
                        medianTime: 1664451279,
                        time: 1664451285,
                      },
                      active: {
                        amount: "10.00000000",
                        weightage: 3,
                        oracles: {
                          active: 3,
                          total: 3,
                        },
                      },
                      next: {
                        amount: "10.00000000",
                        weightage: 3,
                        oracles: {
                          active: 3,
                          total: 3,
                        },
                      },
                      sort: "000006d8",
                    },
                  },
                ],
                loan: {
                  id: "14",
                  amount: "0.00000076",
                  symbol: "TD10",
                  symbolKey: "TD10",
                  name: "Decentralized TD10",
                  displaySymbol: "dTD10",
                  activePrice: {
                    id: "TD10-USD-1752",
                    key: "TD10-USD",
                    isLive: true,
                    block: {
                      hash: "a44b8ac93c7346764704e05c921bb2d05442250b6b4bedb370a26893a5b3cda2",
                      height: 1752,
                      medianTime: 1664451279,
                      time: 1664451285,
                    },
                    active: {
                      amount: "923143427.18159265",
                      weightage: 3,
                      oracles: {
                        active: 3,
                        total: 3,
                      },
                    },
                    next: {
                      amount: "922928043.45957784",
                      weightage: 3,
                      oracles: {
                        active: 3,
                        total: 3,
                      },
                    },
                    sort: "000006d8",
                  },
                },
                froms: [],
              },
            ],
          },
        ],
      },
    });
    cy.setFeatureFlags(["auction"]);
    cy.createEmptyWallet(true);
  });

  it("should not able to search auction", () => {
    cy.getByTestID("bottom_tab_auctions").click();
    cy.getByTestID("auction_search_icon").click();
    cy.getByTestID("search_title").contains(
      "Search for auctions using collateral token names i.e. DFI DUSD dBTC."
    );
    cy.getByTestID("auction_lists").should("not.exist");
    cy.getByTestID("batch_card_0_dTu10").should("not.exist");
    cy.getByTestID("batch_card_1_dTD10").should("not.exist");

    // Check for search word ETH
    cy.getByTestID("auctions_search_input").type("ETH");
    cy.getByTestID("search_title").contains("Search results for “ETH”");
    cy.getByTestID("batch_card_0_dTU10").should("not.exist");
    cy.getByTestID("batch_card_0_dTD10").should("exist");
    cy.getByTestID("batch_card_1_dTD10").should("not.exist");

    // Check for search word DFI ETH
    cy.getByTestID("auctions_search_input").clear().type("DFI ETH");
    cy.getByTestID("search_title").contains("Search results for “DFI ETH”");
    cy.getByTestID("batch_card_0_dTU10").should("not.exist");
    cy.getByTestID("batch_card_0_dTD10").should("exist");
    cy.getByTestID("batch_card_1_dTD10").should("not.exist");

    // Check for reverse order search with word ETH DFI
    cy.getByTestID("auctions_search_input").clear().type("ETH DFI");
    cy.getByTestID("search_title").contains("Search results for “ETH DFI”");
    cy.getByTestID("batch_card_0_dTU10").should("not.exist");
    cy.getByTestID("batch_card_0_dTD10").should("exist");
    cy.getByTestID("batch_card_1_dTD10").should("not.exist");

    // Check for search word DUSD
    cy.getByTestID("auctions_search_input").clear().type("DUSD");
    cy.getByTestID("search_title").contains("Search results for “DUSD”");
    cy.getByTestID("batch_card_0_dTU10").should("exist");
    cy.getByTestID("batch_card_1_dTD10").should("not.exist");

    // Check for search word BTC
    cy.getByTestID("auctions_search_input").clear().type("BTC");
    cy.getByTestID("search_title").contains("Search results for “BTC”");
    cy.getByTestID("batch_card_0_dTU10").should("not.exist");
    cy.getByTestID("batch_card_1_dTD10").should("not.exist");

    // Check for result after clearing search
    cy.getByTestID("auctions_search_input_clear_btn").click();
    cy.getByTestID("search_title").contains(
      "Search for auctions using collateral token names i.e. DFI DUSD dBTC."
    );
    cy.getByTestID("auctions_search_input_close").click();
    cy.getByTestID("batch_card_0_dTU10").should("exist");
    cy.getByTestID("batch_card_1_dTD10").should("exist");
  });

  it("should not able to filter auction", () => {
    cy.getByTestID("bottom_tab_auctions").click();
    // Check for least time left by default selection
    cy.getByTestID("batch_card_0_dTU10").should("exist");
    cy.getByTestID("batch_card_1_dTD10").should("exist");
    cy.getByTestID("auctions_sorting_dropdown_arrow").click();
    cy.getByTestID("select_sort_least_time_left_check").should("exist");
    cy.getByTestID("select_sort_most_time_left_check").should("not.exist");

    // Check for most time left
    cy.getByTestID("select_sort_most_time_left").click();
    cy.getByTestID("batch_card_0_dTD10").should("exist");
    cy.getByTestID("batch_card_1_dTU10").should("exist");
    cy.getByTestID("auctions_sorting_dropdown_arrow").click();
    cy.getByTestID("select_sort_least_time_left_check").should("not.exist");
    cy.getByTestID("select_sort_most_time_left_check").should("exist");
  });
});

context("Wallet - Auctions Feature Gated", () => {
  it("should not have auctions tab if auction feature is blocked", () => {
    cy.intercept("**/settings/flags", {
      body: [],
    });
    cy.createEmptyWallet(true);
    cy.getByTestID("bottom_tab_auctions").should("not.exist");
  });

  it("should not have auctions tab if feature flag api does not contains auction", () => {
    cy.intercept("**/settings/flags", {
      body: [
        {
          id: "foo",
          name: "bar",
          stage: "alpha",
          version: ">=0.0.0",
          description: "foo",
          networks: [
            EnvironmentNetwork.RemotePlayground,
            EnvironmentNetwork.LocalPlayground,
          ],
          platforms: ["ios", "android", "web"],
        },
      ],
    });
    cy.createEmptyWallet(true);
    cy.getByTestID("bottom_tab_auctions").should("not.exist");
  });

  it("should not have auctions tab if auction feature is beta and not activated by user", () => {
    cy.intercept("**/settings/flags", {
      body: [
        {
          id: "auction",
          name: "Auction",
          stage: "beta",
          version: ">=0.0.0",
          description: "Auction",
          networks: [
            EnvironmentNetwork.RemotePlayground,
            EnvironmentNetwork.LocalPlayground,
          ],
          platforms: ["ios", "android", "web"],
        },
      ],
    });
    cy.createEmptyWallet(true);
    cy.getByTestID("bottom_tab_auctions").should("not.exist");
  });

  it("should have auctions tab if auction feature is beta is activated", () => {
    cy.intercept("**/settings/flags", {
      body: [
        {
          id: "auction",
          name: "Auction",
          stage: "beta",
          version: ">=0.0.0",
          description: "Auctions",
          networks: [
            EnvironmentNetwork.RemotePlayground,
            EnvironmentNetwork.LocalPlayground,
          ],
          platforms: ["ios", "android", "web"],
        },
      ],
    });
    localStorage.setItem("WALLET.ENABLED_FEATURES", '["auction"]');
    cy.createEmptyWallet(true);
    cy.getByTestID("bottom_tab_auctions").should("exist");
  });

  it("should have auctions tab if auction feature is public", () => {
    cy.intercept("**/settings/flags", {
      body: [
        {
          id: "auction",
          name: "Auction",
          stage: "public",
          version: ">=0.0.0",
          description: "Auctions",
          networks: [
            EnvironmentNetwork.RemotePlayground,
            EnvironmentNetwork.LocalPlayground,
          ],
          platforms: ["ios", "android", "web"],
        },
      ],
    });
    cy.createEmptyWallet(true);
    cy.getByTestID("bottom_tab_auctions").should("exist");
  });
});
