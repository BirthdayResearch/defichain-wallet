/**
 * This file will be used for mainnet testing or smoke testing
 * It will only test core features that doesn't require balances (e.g, Create, Restore wallet etc.)
 * Tests included here are not that extensive compared to functional testing (e.g, Color, disable test or styling tests won't be added here)
 * The goal is to have run smoke testing in Mainnet
 * */

import { WhaleApiClient } from "@defichain/whale-api-client";
import { PoolPairData } from "@defichain/whale-api-client/dist/api/poolpairs";
import BigNumber from "bignumber.js";
import { checkValueWithinRange } from "../../support/walletCommands";

interface DexItem {
  type: "your" | "available";
  data: PoolPairData;
}

context("Mainnet - Wallet", () => {
  const recoveryWords: string[] = [];
  const settingsRecoveryWords: string[] = [];
  const localAddress = {
    address: "",
  };
  const mainnetAddress = {
    address: "",
  };

  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  it("should store values of local wallet", () => {
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(["BTC", "ETH-DFI"])
      .wait(3000);
    cy.verifyWalletAddress("regtest", localAddress);
  });

  it("should have MainNet", () => {
    cy.isNetworkConnected("Local");
    cy.switchNetwork("MainNet");
  });

  it("should start creation of mnemonic wallet", () => {
    cy.startCreateMnemonicWallet(recoveryWords);
  });

  it("should be able to select correct words", () => {
    cy.selectMnemonicWords(recoveryWords);
  });

  it("should be able to verify and set pincode", () => {
    cy.setupPinCode();
    cy.getByTestID("wallet_create_success").should("exist");
    cy.getByTestID("continue_button").should("exist").click();
  });

  it("should have displayed default tokens", () => {
    cy.getByTestID("dfi_total_balance_amount").contains("0.00000000");
    cy.getByTestID("dfi_total_balance_usd_amount").contains("$0.00");
    cy.getByTestID("dfi_balance_card").should("exist");
  });

  context("Settings - Mnemonic Verification", () => {
    it("should be able to verify mnemonic from settings page", () => {
      cy.verifyMnemonicOnSettingsPage(settingsRecoveryWords, recoveryWords);
    });
  });

  context("Settings - Change Passcode", () => {
    it("should be able to change passcode and verify", () => {
      cy.changePasscode();
      cy.getByTestID("header_settings").click();
      cy.getByTestID("view_recovery_words").click().wait(3000);
      cy.getByTestID("pin_authorize").type("696969").wait(3000);
    });
  });

  context("Restore - Mnemonic Verification", () => {
    it("should be able to restore mnemonic words", () => {
      cy.getByTestID("bottom_tab_portfolio").click();
      cy.getByTestID("header_settings").click();
      cy.getByTestID("setting_exit_wallet").click();
      cy.wait(3000);
      cy.restoreMnemonicWords(settingsRecoveryWords);
    });
  });

  context("Wallet - Verify Wallet Address", () => {
    it("should be have selected valid network", () => {
      cy.getByTestID("bottom_tab_portfolio").click();
      cy.getByTestID("header_settings").click();
      cy.getByTestID("header_network_name").contains("MainNet").should("exist");
    });

    it("should be have valid network address", () => {
      cy.verifyWalletAddress("mainnet", mainnetAddress);
      cy.getByTestID("bottom_tab_portfolio").click();
    });
  });

  context("Wallet - On Refresh", () => {
    it("should load selected network", () => {
      cy.reload();
      cy.isNetworkConnected("MainNet");
      cy.getByTestID("bottom_tab_portfolio").click();
      cy.getByTestID("receive_balance_button").click();
      cy.getByTestID("address_text").then(($txt: any) => {
        const address = $txt[0].textContent;
        expect(address).eq(mainnetAddress.address);
      });
    });
  });

  // In this test, there are Local and MainNet wallets existing
  context("Wallet - Network Switch", () => {
    it("should change network to Local", () => {
      cy.switchNetwork("Local");
    });

    it("should have correct balances", () => {
      cy.fetchWalletBalance();
      cy.getByTestID("bottom_tab_portfolio").click();
      cy.getByTestID("portfolio_list").should("exist");
      cy.getByTestID("dfi_total_balance_amount")
        .invoke("text")
        .then((text) => {
          checkValueWithinRange(text, "20", 0.1);
        });
      cy.getByTestID("dfi_balance_card").should("exist").click();
      cy.getByTestID("dfi_utxo_amount").contains("10.00000000");
      cy.getByTestID("dfi_token_amount").contains("10");
      cy.getByTestID("dfi_total_balance_amount").contains("20");
      cy.checkBalanceRow("18", {
        name: "Playground ETH-DeFiChain",
        amount: "10.00000000",
        displaySymbol: "dETH-DFI",
        symbol: "dETH-DFI",
      });
    });

    it("should have correct poolpairs", () => {
      cy.getByTestID("bottom_tab_dex").click();
      cy.getByTestID("dex_tabs_YOUR_POOL_PAIRS").click();
      cy.getByTestID("pool_pair_row_0_dETH-DFI").contains("10.00000000");
      cy.getByTestID("bottom_tab_portfolio").click();
    });

    it("should have correct address", () => {
      cy.getByTestID("bottom_tab_portfolio").click();
      cy.getByTestID("receive_balance_button").click();
      cy.getByTestID("address_text").then(($txt: any) => {
        const address = $txt[0].textContent;
        expect(address).eq(localAddress.address);
      });
    });
  });
});

context("Mainnet - Wallet - Pool Pair Values", () => {
  const whale: WhaleApiClient = new WhaleApiClient({
    url: "https://ocean.defichain.com",
    network: "mainnet",
    version: "v0",
  });
  it("should verify poolpair values", () => {
    cy.wrap<DexItem[]>(whale.poolpairs.list(5), { timeout: 20000 }).then(
      (pairs) => {
        const available: Array<{ type: "available"; data: PoolPairData }> =
          pairs.map((data) => ({ type: "available", data }));
        cy.intercept("**/poolpairs?size=*", {
          statusCode: 200,
          body: {
            data: pairs,
          },
        });
        cy.createEmptyWallet(true);
        cy.switchNetwork("MainNet");
        cy.createEmptyWallet(true);
        cy.getByTestID("bottom_tab_dex").click();
        cy.getByTestID("dex_tabs_AVAILABLE_POOL_PAIRS_active").click();
        cy.getByTestID("available_liquidity_tab").scrollTo("bottom");
        available.forEach((pair) => {
          const data: PoolPairData = pair?.data;
          const symbol = `${data.tokenA.displaySymbol}-${data.tokenB.displaySymbol}`;
          cy.getByTestID("dex_search_icon").click();
          cy.getByTestID("dex_search_input").clear().type(symbol).blur();
          cy.getByTestID(`pair_symbol_${symbol}`).contains(symbol);
          cy.getByTestID(`apr_${symbol}`).contains(
            `${new BigNumber(data?.apr?.total ?? 0).times(100).toFixed(2)}%`
          );
          cy.getByTestID("dex_search_input_close").click();
        });
      }
    );
  });
});
