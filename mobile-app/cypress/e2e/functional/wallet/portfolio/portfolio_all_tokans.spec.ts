import { DexPricesResult } from "@defichain/whale-api-client/dist/api/poolpairs";
import { checkValueWithinRange } from "../../../../support/utils";

export interface BalanceTokenDetail {
  symbol: string;
  displaySymbol: string;
  name: string;
  amount: string | number;
  usdAmount?: string;
}

const getChangingPoolPairReserve = ({
  pair1ReserveA, // BTC (BTC-DFI)
  pair1ReserveB, // DFI (BTC-DFI)
  pair2ReserveA, // USDT (USDT-DFI)
  pair2ReserveB, // DFI (USDT-DFI)
}: {
  pair1ReserveA: string;
  pair1ReserveB: string;
  pair2ReserveA: string;
  pair2ReserveB: string;
}): any => [
  {
    id: "15",
    symbol: "BTC-DFI",
    displaySymbol: "dBTC-DFI",
    name: "Playground BTC-Default Defi token",
    status: true,
    tokenA: {
      symbol: "BTC",
      displaySymbol: "dBTC",
      id: "1",
      reserve: pair1ReserveA,
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      reserve: pair1ReserveB,
      blockCommission: "0",
    },
    priceRatio: {
      ab: "1",
      ba: "1",
    },
    commission: "0",
    totalLiquidity: {
      token: "2500",
      usd: "20000000",
    },
    tradeEnabled: true,
    ownerAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
    rewardPct: "0.1",
    creation: {
      tx: "79b5f7853f55f762c7550dd7c734dff0a473898bfb5639658875833accc6d461",
      height: 132,
    },
    apr: {
      reward: 66.8826,
      total: 66.8826,
    },
  },
  {
    id: "16",
    symbol: "ETH-DFI",
    displaySymbol: "dETH-DFI",
    name: "Playground ETH-Default Defi token",
    status: true,
    tokenA: {
      symbol: "ETH",
      displaySymbol: "dETH",
      id: "2",
      reserve: "100000",
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      reserve: "1000",
      blockCommission: "0",
    },
    priceRatio: {
      ab: "100",
      ba: "0.01",
    },
    commission: "0",
    totalLiquidity: {
      token: "10000",
      usd: "20000000",
    },
    tradeEnabled: true,
    ownerAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
    rewardPct: "0.1",
    creation: {
      tx: "351c80a14f441af1c237f4abc138df242e67c8ef47cfbc1af3437798ce14bd1b",
      height: 135,
    },
    apr: {
      reward: 66.8826,
      total: 66.8826,
    },
  },
  {
    id: "17",
    symbol: "USDT-DFI",
    displaySymbol: "csUSDT-DFI",
    name: "Decentralized USD-Default Defi token",
    status: true,
    tokenA: {
      symbol: "USDT",
      displaySymbol: "csUSDT",
      id: "14",
      reserve: pair2ReserveA,
      blockCommission: "0",
    },
    tokenB: {
      symbol: "DFI",
      displaySymbol: "DFI",
      id: "0",
      reserve: pair2ReserveB,
      blockCommission: "0",
    },
    priceRatio: {
      ab: "10",
      ba: "0.1",
    },
    commission: "0.02",
    totalLiquidity: {
      token: "2500",
      usd: "16660",
    },
    tradeEnabled: true,
    ownerAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
    rewardPct: "0.1",
    creation: {
      tx: "4b8d5ec122052cdb8e8ffad63865444a10edc396d44e52957758ef7a39b228fa",
      height: 147,
    },
    apr: {
      reward: 80291.23649459783,
      total: 80291.23649459783,
    },
  },
];

const getDexPrice = (price: {
  [token: string]: string;
}): { data: DexPricesResult } => ({
  data: {
    denomination: {
      id: "3",
      symbol: "USDT",
      displaySymbol: "csUSDT",
      name: "Playground USDT",
    },
    dexPrices: {
      DUSD: {
        token: {
          id: "12",
          symbol: "DUSD",
          displaySymbol: "DUSD",
          name: "Decentralized USD",
        },
        denominationPrice: price.dusd,
      },
      USDC: {
        token: {
          id: "5",
          symbol: "USDC",
          displaySymbol: "dUSDC",
          name: "Playground USDC",
        },
        denominationPrice: price.usdc,
      },
      ETH: {
        token: {
          id: "2",
          symbol: "ETH",
          displaySymbol: "dETH",
          name: "Playground ETH",
        },
        denominationPrice: price.eth,
      },
      BTC: {
        token: {
          id: "1",
          symbol: "BTC",
          displaySymbol: "dBTC",
          name: "Playground BTC",
        },
        denominationPrice: price.btc,
      },
      DFI: {
        token: {
          id: "0",
          symbol: "DFI",
          displaySymbol: "DFI",
          name: "Default Defi token",
        },
        denominationPrice: price.dfi,
      },
    },
  },
});

const addLPTokens = [
  {
    amount: "5.00000000",
    displaySymbol: "dBTC-DFI",
    id: "17",
    isDAT: true,
    isLPS: true,
    isLoanToken: false,
    name: "Playground BTC-Default Defi token",
    symbol: "BTC-DFI",
    symbolKey: "BTC-DFI",
  },
  {
    amount: "15.00000000",
    displaySymbol: "dETH-DFI",
    id: "18",
    isDAT: true,
    isLPS: true,
    isLoanToken: false,
    name: "Playground ETH-Default Defi token",
    symbol: "ETH-DFI",
    symbolKey: "ETH-DFI",
  },
  {
    amount: "25.00000000",
    displaySymbol: "csUSDT-DFI",
    id: "19",
    isDAT: true,
    isLPS: true,
    isLoanToken: false,
    name: "Playground USDT-Default Defi token",
    symbol: "USDT-DFI",
    symbolKey: "USDT-DFI",
  },
];

const addCrypto = [
  {
    amount: "5.00000000",
    displaySymbol: "dBTC",
    id: "1",
    isDAT: true,
    isLPS: false,
    isLoanToken: false,
    name: "Playground BTC",
    symbol: "BTC",
    symbolKey: "BTC",
  },
  {
    amount: "20.00000000",
    displaySymbol: "dETH",
    id: "3",
    isDAT: true,
    isLPS: false,
    isLoanToken: false,
    name: "Playground ETH",
    symbol: "ETH",
    symbolKey: "ETH",
  },
  {
    amount: "22.00000000",
    displaySymbol: "dLTC",
    id: "4",
    isDAT: true,
    isLPS: false,
    isLoanToken: false,
    name: "Playground LTC",
    symbol: "LTC",
    symbolKey: "LTC",
  },
];

const addDTokens = [
  {
    amount: "2.00000000",
    displaySymbol: "DUSD",
    id: "12",
    isDAT: true,
    isLPS: false,
    isLoanToken: true,
    name: "Decentralized DUSD",
    symbol: "DUSD",
    symbolKey: "DUSD",
  },
  {
    amount: "21.00000000",
    displaySymbol: "dTU10",
    id: "13",
    isDAT: true,
    isLPS: false,
    isLoanToken: true,
    name: "Decentralized TU10",
    symbol: "TU10",
    symbolKey: "TU10",
  },
  {
    amount: "22.00000000",
    displaySymbol: "dTD10",
    id: "14",
    isDAT: true,
    isLPS: false,
    isLoanToken: true,
    name: "Playground TD10",
    symbol: "TD10",
    symbolKey: "TD10",
  },
];

function togglePortfolioDenomination(denomination: string): void {
  cy.getByTestID("portfolio_active_currency")
    .invoke("text")
    .then((text) => {
      if (text === denomination) {
        return;
      }

      cy.getByTestID("portfolio_currency_switcher").click();
      togglePortfolioDenomination(denomination);
    });
}

function checkAssetsSortingOrder(
  sortedType: string,
  firstToken: string,
  lastToken: string,
): void {
  const containerTestID = '[data-testid="card_balance_row_container"]';
  const arrowTestID = "your_assets_dropdown_arrow";
  cy.getByTestID(arrowTestID).click();
  cy.getByTestID(`select_asset_${sortedType}`).click();
  cy.wait(3000);
  cy.getByTestID(arrowTestID).contains(sortedType);
  cy.get(containerTestID).children().first().contains(firstToken);
  cy.get(containerTestID).children().last().contains(lastToken);
}

context(
  "Wallet - Portfolio - Your Assets - All tokens tab",
  { testIsolation: false },
  () => {
    before(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.createEmptyWallet(true);
      cy.getByTestID("header_settings").click();
      cy.getByTestID("bottom_tab_portfolio").click();
    });
    it("should display empty balances if there are no other tokens", () => {
      cy.intercept("**/address/**/tokens?size=*", {
        body: {
          data: [],
        },
      });
      cy.getByTestID("empty_portfolio").should("not.exist");
      cy.getByTestID("toggle_sorting_assets").should("exist");
    });
    it("should sort asset based on Highest value (USDT) (default) but display `Sort by` on first load", () => {
      cy.sendDFItoWallet().wait(3000);
      cy.sendTokenToWallet(["ETH", "LTC", "DUSD"]).wait(7000); // token transfer taking time sometime to avoid failure increasing wait time here
      cy.getByTestID("your_assets_dropdown_arrow")
        .contains("Sort by")
        .wait(3000);
      checkAssetsSortingOrder("Highest value (USDT)", "DUSD", "dLTC");
    });
    it("should sort assets based on Lowest value (USDT)", () => {
      checkAssetsSortingOrder("Lowest value (USDT)", "dETH", "DUSD");
    });
    it("should sort assets based on Highest token amount", () => {
      cy.sendTokenToWallet(["DUSD"]);
      cy.wait(6000);
      checkAssetsSortingOrder("Highest token amount", "DUSD", "dLTC");
    });
    it("should sort assets based on Lowest token amount", () => {
      checkAssetsSortingOrder("Lowest token amount", "dETH", "DUSD");
    });
    it("should sort assets based on A to Z", () => {
      checkAssetsSortingOrder("A to Z", "DUSD", "LTC");
    });
    it("should sort assets based on Z to A", () => {
      checkAssetsSortingOrder("Z to A", "LTC", "DUSD");
    });
  },
);

context(
  "Wallet - Portfolio - Your Assets - DFI currency - Sorting function  - All tokens tab",
  { testIsolation: false },
  () => {
    before(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.createEmptyWallet(true);
      cy.getByTestID("header_settings").click();
      cy.getByTestID("bottom_tab_portfolio").click();
    });
    it("should sort assets based on Highest value (DFI)", () => {
      cy.sendDFItoWallet().wait(3000);
      cy.sendTokenToWallet(["BTC", "BTC", "LTC", "DUSD"]).wait(7000); // token transfer taking time sometime to avoid failure increasing wait time here
      togglePortfolioDenomination("DFI");
      checkAssetsSortingOrder("Highest value (DFI)", "dBTC", "dLTC");
    });
    it("should sort assets based on Lowest value (DFI)", () => {
      checkAssetsSortingOrder("Lowest value (DFI)", "dLTC", "dBTC");
    });
  },
);

function interceptTokensForSorting(data: {}): void {
  cy.intercept("**/address/**/tokens?size=*", {
    body: {
      data,
    },
  });
}

context(
  "Wallet - Portfolio - Your Assets - DFI currency - Sorting function  - LP tokens tab",
  { testIsolation: false },
  () => {
    before(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.createEmptyWallet(true);
    });

    it("should sort assets based on Highest value (DFI)", () => {
      interceptTokensForSorting(addLPTokens);
      togglePortfolioDenomination("DFI");
      cy.getByTestID("portfolio_button_group_LP_TOKENS").click();
      checkAssetsSortingOrder("Highest value (DFI)", "dBTC-DFI", "csUSDT-DFI");
    });

    it("should sort assets based on Lowest value (DFI)", () => {
      interceptTokensForSorting(addLPTokens);
      checkAssetsSortingOrder("Lowest value (DFI)", "csUSDT-DFI", "dBTC-DFI");
    });
  },
);

context(
  "Wallet - Portfolio - Your Assets - DFI currency - Sorting function - Crypto tab",
  { testIsolation: false },
  () => {
    before(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.createEmptyWallet(true);
    });

    it("should sort assets based on Highest value (DFI)", () => {
      interceptTokensForSorting(addCrypto);
      togglePortfolioDenomination("DFI");
      cy.getByTestID("portfolio_button_group_CRYPTO").click();
      checkAssetsSortingOrder("Highest value (DFI)", "dBTC", "dETH");
    });

    it("should sort assets based on Lowest value (DFI)", () => {
      interceptTokensForSorting(addCrypto);
      checkAssetsSortingOrder("Lowest value (DFI)", "dETH", "dBTC");
    });
  },
);

context(
  "Wallet - Portfolio - Your Assets - DFI currency - Sorting function - dTokens tab",
  { testIsolation: false },
  () => {
    before(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.createEmptyWallet(true);
    });

    it("should sort assets based on Highest value (DFI)", () => {
      interceptTokensForSorting(addDTokens);
      togglePortfolioDenomination("DFI");
      cy.getByTestID("portfolio_button_group_d_TOKENS").click();
      checkAssetsSortingOrder("Highest value (DFI)", "dTD10", "DUSD");
    });

    it("should sort assets based on Lowest value (DFI)", () => {
      interceptTokensForSorting(addDTokens);
      checkAssetsSortingOrder("Lowest value (DFI)", "DUSD", "dTD10");
    });
  },
);

context(
  "Wallet - Portfolio - Your Assets - BTC currency - Sorting function  - All tokens tab ",
  { testIsolation: false },
  () => {
    before(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.createEmptyWallet(true);
    });

    it("should sort assets based on Highest value (BTC)", () => {
      cy.sendDFItoWallet().wait(3000);
      cy.sendTokenToWallet(["BTC", "LTC", "LTC", "DUSD"]).wait(7000); // token transfer taking time sometime to avoid failure increasing wait time here
      togglePortfolioDenomination("BTC");
      checkAssetsSortingOrder("Highest value (BTC)", "dBTC", "DUSD");
    });

    it("should sort assets based on Lowest value (BTC)", () => {
      checkAssetsSortingOrder("Lowest value (BTC)", "DUSD", "dBTC");
    });
  },
);

context("Wallet - Portfolio - portfolio", { testIsolation: false }, () => {
  beforeEach(() => {
    cy.intercept("**/poolpairs/dexprices?denomination=*", {
      body: getDexPrice({
        dusd: "1.00000000",
        usdc: "1.00000000",
        eth: "10.00000000",
        btc: "10.00000000",
        dfi: "10.00000000",
      }),
    }).as("getDexPrices");
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.createEmptyWallet(true);
    cy.intercept("**/poolpairs?size=*", {
      body: {
        data: getChangingPoolPairReserve({
          pair1ReserveA: "1001",
          pair1ReserveB: "1001",
          pair2ReserveA: "8330",
          pair2ReserveB: "830",
        }),
      },
    });
    cy.sendDFItoWallet().wait(5000);
    cy.intercept("**/vaults?size=200", {
      statusCode: 200,
      body: {
        data: [
          {
            vaultId: "vaultidhere",
            loanScheme: {
              id: "MIN150",
              minColRatio: "150",
              interestRate: "5",
            },
            ownerAddress: "bcrt1qjk6p9kc28wdj84c500lh2h5zlzf5ce3r8r0y92",
            state: "ACTIVE",
            informativeRatio: "-1",
            collateralRatio: "100", // must be positive
            collateralValue: "0",
            loanValue: 10,
            interestValue: "0",
            collateralAmounts: [
              {
                id: "0",
                amount: "1.00000000",
                symbol: "DFI",
                symbolKey: "DFI",
                name: "Default Defi token",
                displaySymbol: "DFI",
                activePrice: {
                  id: "DFI-USD-906",
                  key: "DFI-USD",
                  isLive: true,
                  block: {
                    hash: "9353d4b75886d68f0c9d788aee236c7c7e2722f0147dea98cde3a84719095e78",
                    height: 906,
                    medianTime: 1646660089,
                    time: 1646660095,
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
                  sort: "0000038a",
                },
              },
            ],
            loanAmounts: [
              {
                id: "12",
                amount: "10.00001903",
                symbol: "DUSD",
                symbolKey: "DUSD",
                name: "Decentralized USD",
                displaySymbol: "DUSD",
              },
            ],
            interestAmounts: [
              {
                id: "12",
                amount: "0.00001903",
                symbol: "DUSD",
                symbolKey: "DUSD",
                name: "Decentralized USD",
                displaySymbol: "DUSD",
              },
            ],
          },
        ],
      },
    }).as("getVaults");
  });

  it("should show portfolio breakdown", () => {
    cy.wait(["@getDexPrices", "@getVaults"]).then(() => {
      cy.getByTestID("toggle_portfolio").click();
      // subtract loan amount
      cy.getByTestID("total_usd_amount")
        .invoke("text")
        .then((text) => {
          checkValueWithinRange(text, "100", 1);
        });
      cy.getByTestID("total_available_usd_amount")
        .invoke("text")
        .then((text) => {
          checkValueWithinRange(text, "100", 1);
        });
      cy.getByTestID("total_locked_usd_amount")
        .invoke("text")
        .then((text) => {
          checkValueWithinRange(text, "10", 1);
        });
      cy.getByTestID("outstanding_loans_amount")
        .invoke("text")
        .then((text) => {
          checkValueWithinRange(text, "10", 1);
        });
    });
  });

  it("should hide portfolio breakdown on hide balance toggle", () => {
    cy.wait("@getVaults").then(() => {
      cy.getByTestID("toggle_balance").click();
      cy.getByTestID("toggle_portfolio").click();
      cy.getByTestID("total_usd_amount").should("have.text", "*****");
      cy.getByTestID("total_available_usd_amount").should("have.text", "*****");
      cy.getByTestID("total_locked_usd_amount").should("have.text", "*****");
      cy.getByTestID("outstanding_loans_amount").should("have.text", "*****");
    });
  });
});

context(
  "Transfer domain - Wallet - Portfolio - Portfolio group tab - DFI currency",
  { testIsolation: false },
  () => {
    before(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.createEmptyWallet(true);
      cy.getByTestID("header_settings").click();
      cy.getByTestID("bottom_tab_portfolio").click();

      cy.intercept("**/address/**/tokens?size=*", {
        body: {
          data: [
            {
              amount: "5.00000000",
              displaySymbol: "dBTC",
              id: "1",
              isDAT: true,
              isLPS: false,
              isLoanToken: false,
              name: "Playground BTC",
              symbol: "BTC",
              symbolKey: "BTC",
            },
            {
              id: "24",
              amount: "10.00000000",
              symbol: "TU10-DUSD",
              symbolKey: "TU10-DUSD",
              name: "Decentralized TU10-Decentralized USD",
              isDAT: true,
              isLPS: true,
              isLoanToken: false,
              displaySymbol: "dTU10-DUSD",
            },
          ],
        },
      });
    });

    it("should display all tokens in dvm domain", () => {
      cy.getByTestID("portfolio_row_1").should("exist");
      cy.getByTestID("portfolio_row_24").should("exist");
    });

    it("should only display non EVM tokens in evm domain", () => {
      cy.getByTestID("domain_switch").click();
      cy.getByTestID("portfolio_row_1").should("not.exist");
      cy.getByTestID("portfolio_row_24").should("not.exist");
    });
  },
);
