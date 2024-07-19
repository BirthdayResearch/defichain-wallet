import { DexPricesResult } from "@defichain/whale-api-client/dist/api/poolpairs";

export interface BalanceTokenDetail {
  symbol: string;
  displaySymbol: string;
  name: string;
  amount: string | number;
  usdAmount?: string;
}

function assertPortfolioDenomination(denomination: string): void {
  cy.getByTestID("portfolio_active_currency")
    .invoke("text")
    .then((text) => {
      expect(text).to.be.equal(denomination);
    });
}

function checkPortfolioPageDenominationValues(
  totalUsdAmt: string,
  totalAvailableUsdAmt: string,
  totalLockedUsdAmt: string,
  DfiTotalBalUsdAmt: string,
  DfiAvailableAmt: string,
  BtcUsdAmt: string,
  EthUsdAmt: string,
): void {
  // TotalPortfolio
  cy.getByTestID("total_usd_amount").contains(totalUsdAmt);
  cy.getByTestID("total_available_usd_amount").contains(totalAvailableUsdAmt);
  cy.getByTestID("total_locked_usd_amount").contains(totalLockedUsdAmt);

  // DFIBalanceCard
  cy.getByTestID("dfi_total_balance_usd_amount").contains(DfiTotalBalUsdAmt);
  cy.getByTestID("dfi_balance_card").should("exist").click();
  cy.getByTestID("token_detail_usd_amount").contains(DfiAvailableAmt);
  cy.go("back");

  // PortfolioCard
  cy.checkBalanceRow("1", {
    name: "Playground BTC",
    amount: "10.00000000",
    displaySymbol: "dBTC",
    symbol: "BTC",
    usdAmount: BtcUsdAmt,
  });
  cy.checkBalanceRow("2", {
    name: "Playground ETH",
    amount: "10.00000000",
    displaySymbol: "dETH",
    symbol: "ETH",
    usdAmount: EthUsdAmt,
  });
}

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

const getDexPrice = (price: {
  [token: string]: string;
}): { data: DexPricesResult } => ({
  data: {
    denomination: {
      id: "3",
      symbol: "USDT",
      displaySymbol: "depUSDT",
      name: "Playground csUSDT",
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

const addTokensWithFourCategories = [
  {
    amount: "5.00000000",
    displaySymbol: "dBTC-DFI",
    id: "16",
    isDAT: true,
    isLPS: true,
    isLoanToken: false,
    name: "Playground BTC-Default Defi token",
    symbol: "BTC-DFI",
    symbolKey: "BTC-DFI",
  },
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
    amount: "10.00000000",
    displaySymbol: "dETH",
    id: "2",
    isDAT: true,
    isLPS: false,
    isLoanToken: false,
    name: "Playground ETH",
    symbol: "ETH",
    symbolKey: "ETH",
  },
  {
    amount: "11.00000000",
    displaySymbol: "DUSD",
    id: "14",
    isDAT: true,
    isLPS: false,
    isLoanToken: true,
    name: "Decentralized USD",
    symbol: "DUSD",
    symbolKey: "DUSD",
  },
];

function interceptTokenWithSampleData(): void {
  cy.intercept("**/address/**/tokens?size=*", {
    body: {
      data: addTokensWithFourCategories,
    },
  });
}

context("Wallet - Portfolio", { testIsolation: false }, () => {
  beforeEach(() => {
    cy.intercept("**/poolpairs/dexprices?denomination=*", {
      body: getDexPrice({
        dusd: "1",
        usdc: "1.00000000",
        eth: "100.00000000",
        btc: "10000.00000000",
        dfi: "10.00000000",
      }),
    }).as("getDexPrices");
  });

  before(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet().wait(6000);
    cy.getByTestID("header_settings").click();
    cy.getByTestID("bottom_tab_portfolio").click();
  });

  it("should display dfi utxo and dfi token with correct amount", () => {
    cy.sendDFITokentoWallet().sendTokenToWallet(["BTC", "ETH"]).wait(6000);
    cy.wait("@getDexPrices").then(() => {
      cy.wait(2000);
      cy.getByTestID("dfi_total_balance_amount").contains("20.00000000");
      cy.getByTestID("dfi_balance_card").should("exist").click();
      cy.getByTestID("dfi_utxo_amount").contains("10.00000000");
      cy.getByTestID("dfi_utxo_label").contains("UTXO");
      cy.getByTestID("dfi_token_amount").contains("10.00000000");
      cy.getByTestID("dfi_token_label").contains("Token");
      cy.getByTestID("dfi_total_balance_amount").contains("20.00000000");
      cy.getByTestID("total_dfi_label_symbol").contains("DFI");
      cy.getByTestID("total_dfi_label_name").contains("DeFiChain");
      cy.go("back");
      cy.checkBalanceRow("1", {
        name: "Playground BTC",
        amount: "10.00000000",
        displaySymbol: "dBTC",
        symbol: "BTC",
        usdAmount: "$100,000.00",
      });
      cy.checkBalanceRow("2", {
        name: "Playground ETH",
        amount: "10.00000000",
        displaySymbol: "dETH",
        symbol: "ETH",
        usdAmount: "$1,000.00",
      });
      cy.getByTestID("total_usd_amount").contains("$101,200.00");
    });
  });

  it("should display BTC and ETH with correct amounts", () => {
    cy.getByTestID("portfolio_list").should("exist");
    cy.wait("@getDexPrices").then(() => {
      cy.wait(2000);
      cy.checkBalanceRow("1", {
        name: "Playground BTC",
        amount: "10.00000000",
        displaySymbol: "dBTC",
        symbol: "BTC",
        usdAmount: "$100,000.00",
      });
      cy.checkBalanceRow("2", {
        name: "Playground ETH",
        amount: "10.00000000",
        displaySymbol: "dETH",
        symbol: "ETH",
        usdAmount: "$1,000.00",
      });
    });
  });

  it("should hide all DFI, BTC and ETH amounts on toggle", () => {
    cy.getByTestID("toggle_balance").click();
    cy.getByTestID("dfi_total_balance_amount").should("have.text", "*****");
    cy.getByTestID("dfi_total_balance_usd_amount").should("have.text", "*****");
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("dfi_utxo_amount").should("contain", "10.00000000");
    cy.getByTestID("dfi_token_amount").should("contain", "10.00000000");
    cy.getByTestID("token_detail_amount").should("contain", "20.00000000");
    cy.go("back");
    cy.checkBalanceRow("1", {
      name: "Playground BTC",
      amount: "*****",
      displaySymbol: "dBTC",
      symbol: "BTC",
    });
    cy.checkBalanceRow("2", {
      name: "Playground ETH",
      amount: "*****",
      displaySymbol: "dETH",
      symbol: "ETH",
    });
  });

  it("should redirect to get DFI page", () => {
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("get_DFI_action_btn").click();
    cy.url().should("include", "app/GetDFIScreen");
  });

  it("should redirect to send page", () => {
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("send_balance_button").click();
    cy.getByTestID("select_DFI").click();
    cy.getByTestID("send_screen").should("exist");
  });

  it("should redirect to receive page", () => {
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("receive_balance_button").click();
    cy.getByTestID("address_text").should("exist");
  });

  it("should be able to navigate to convert dfi page", () => {
    cy.go("back");
    cy.getByTestID("dfi_balance_card").click();
    cy.getByTestID("convert_button").click();
    cy.getByTestID("convert_screen").should("exist");
  });
});

context(
  "Wallet - Portfolio - Assets filter tab",
  { testIsolation: false },
  () => {
    before(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.createEmptyWallet(true);
    });

    it("should display All tokens that are available in asset", () => {
      interceptTokenWithSampleData();
      cy.getByTestID("portfolio_button_group_ALL_TOKENS_active").should(
        "exist",
      );
      cy.getByTestID("portfolio_row_1").should("exist"); // dBTC = row 1
      cy.getByTestID("portfolio_row_2").should("exist"); // dETH = row 2
      cy.getByTestID("portfolio_row_14").should("exist"); // DUSD = row 14
      cy.getByTestID("portfolio_row_16").should("exist"); // dBTC-DFI = row 16
    });

    it("should display only LP tokens that are available in asset", () => {
      interceptTokenWithSampleData();
      cy.getByTestID("portfolio_button_group_LP_TOKENS").click();
      cy.getByTestID("portfolio_button_group_LP_TOKENS_active").should("exist");
      cy.getByTestID("portfolio_row_1").should("not.exist");
      cy.getByTestID("portfolio_row_2").should("not.exist");
      cy.getByTestID("portfolio_row_14").should("not.exist");
      cy.getByTestID("portfolio_row_16").should("exist");
    });

    it("should display only Crypto that are available in asset", () => {
      interceptTokenWithSampleData();
      cy.getByTestID("portfolio_button_group_CRYPTO").click();
      cy.getByTestID("portfolio_button_group_CRYPTO_active").should("exist");
      cy.getByTestID("portfolio_row_14").should("not.exist");
      cy.getByTestID("portfolio_row_16").should("not.exist");
      cy.getByTestID("portfolio_row_1").should("exist");
      cy.getByTestID("portfolio_row_2").should("exist");
    });

    it("should display only dTokens that are available in asset", () => {
      interceptTokenWithSampleData();
      cy.getByTestID("portfolio_button_group_d_TOKENS").click();
      cy.getByTestID("portfolio_button_group_d_TOKENS_active").should("exist");
      cy.getByTestID("portfolio_row_1").should("not.exist");
      cy.getByTestID("portfolio_row_2").should("not.exist");
      cy.getByTestID("portfolio_row_16").should("not.exist");
      cy.getByTestID("portfolio_row_14").should("exist");
    });
  },
);

context(
  "Wallet - Portfolio - Assets filter tab - filter respective tokens in selected tab",
  { testIsolation: false },
  () => {
    before(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.createEmptyWallet(true);
    });

    it("should exist in All tokens and Crypto tabs, should not exist in LP tokens and dTokens tabs", () => {
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
          ],
        },
      });
      cy.getByTestID("toggle_sorting_assets").should("exist");
      cy.getByTestID("portfolio_button_group_ALL_TOKENS_active").should(
        "exist",
      );
      cy.getByTestID("portfolio_row_1").should("exist"); // dBTC = row 1
      cy.getByTestID("portfolio_button_group_CRYPTO").click();
      cy.getByTestID("portfolio_button_group_CRYPTO_active").should("exist");
      cy.getByTestID("portfolio_row_1").should("exist"); // dBTC = row 1
      cy.getByTestID("portfolio_button_group_LP_TOKENS").click();
      cy.getByTestID("portfolio_button_group_LP_TOKENS_active").should("exist");
      cy.getByTestID("empty_tokens_title").should(
        "have.text",
        "No LP tokens found",
      );
      cy.getByTestID("empty_tokens_subtitle").should(
        "have.text",
        "Add liquidity to get started",
      );
      cy.getByTestID("portfolio_button_group_d_TOKENS").click();
      cy.getByTestID("portfolio_button_group_d_TOKENS_active").should("exist");
      cy.getByTestID("empty_tokens_title").should(
        "have.text",
        "No dTokens found",
      );
      cy.getByTestID("empty_tokens_subtitle").should(
        "have.text",
        "Mint dTokens to get started",
      );
    });
    it("should exist in All tokens and dTokens tabs, should not exist in LP tokens and Crypto tabs", () => {
      cy.intercept("**/address/**/tokens?size=*", {
        body: {
          data: [
            {
              amount: "11.00000000",
              displaySymbol: "DUSD",
              id: "14",
              isDAT: true,
              isLPS: false,
              isLoanToken: true,
              name: "Decentralized USD",
              symbol: "DUSD",
              symbolKey: "DUSD",
            },
          ],
        },
      });
      cy.getByTestID("toggle_sorting_assets").should("exist");
      cy.getByTestID("portfolio_button_group_ALL_TOKENS").click();
      cy.getByTestID("portfolio_button_group_ALL_TOKENS_active").should(
        "exist",
      );
      cy.getByTestID("portfolio_row_14").should("exist"); // DUSD = row 14
      cy.getByTestID("portfolio_button_group_LP_TOKENS").click();
      cy.getByTestID("portfolio_button_group_LP_TOKENS_active").should("exist");
      cy.getByTestID("empty_tokens_title").should(
        "have.text",
        "No LP tokens found",
      );
      cy.getByTestID("empty_tokens_subtitle").should(
        "have.text",
        "Add liquidity to get started",
      );
      cy.getByTestID("portfolio_button_group_CRYPTO").click();
      cy.getByTestID("portfolio_button_group_CRYPTO_active").should("exist");
      cy.getByTestID("empty_tokens_title").should(
        "have.text",
        "No crypto found",
      );
      cy.getByTestID("empty_tokens_subtitle").should(
        "have.text",
        "Add crypto to get started",
      );
      cy.getByTestID("portfolio_button_group_d_TOKENS").click();
      cy.getByTestID("portfolio_button_group_d_TOKENS_active").should("exist");
      cy.getByTestID("portfolio_row_14").should("exist"); // DUSD = row 14
    });
  },
);

context(
  "Wallet - Portfolio - Portfolio group tab",
  { testIsolation: false },
  () => {
    before(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.createEmptyWallet(true);
      cy.sendDFITokentoWallet().sendTokenToWallet(["BTC", "ETH"]).wait(6000);
      cy.getByTestID("toggle_portfolio").click();
      cy.getByTestID("dfi_total_balance_amount").contains("10.00000000");
    });

    it("should display portfolio values in USDT currency", () => {
      assertPortfolioDenomination("USDT");
      checkPortfolioPageDenominationValues(
        "$201,000.00",
        "$201,000.00",
        "$0.00",
        "$100,000.00",
        "$100,000.00",
        "$100,000.00",
        "$1,000.00",
      );
    });

    it("should display portfolio values in DFI currency", () => {
      togglePortfolioDenomination("DFI");
      assertPortfolioDenomination("DFI");
      checkPortfolioPageDenominationValues(
        "20.10",
        "20.10 DFI",
        "0.00000000 DFI",
        "10.00 DFI",
        "10.00 DFI",
        "10.00 DFI",
        "0.10000000 DFI",
      );
    });

    it("should display portfolio values in BTC currency", () => {
      togglePortfolioDenomination("BTC");
      assertPortfolioDenomination("BTC");
      checkPortfolioPageDenominationValues(
        "20.10",
        "20.10 BTC",
        "0.00000000 BTC",
        "10.00 BTC",
        "10.00 BTC",
        "10.00 BTC",
        "0.10000000 BTC",
      );
    });
  },
);
