import BigNumber from "bignumber.js";
import { WhaleApiClient } from "@defichain/whale-api-client";
import { LoanVaultLiquidated } from "@defichain/whale-api-client/dist/api/loan";
import { VaultStatus } from "../../../../../app/screens/AppNavigator/screens/Loans/VaultStatusTypes";
import { EnvironmentNetwork } from "../../../../../../shared/environment";
import { checkValueWithinRange } from "../../../../support/walletCommands";

function generateBlockUntilLiquidate(): void {
  cy.getByTestID("playground_generate_blocks").click();
  cy.wait(3000);
  cy.getByTestID("vault_card_0_status")
    .invoke("text")
    .then((status: string) => {
      if (status !== "IN LIQUIDATION") {
        generateBlockUntilLiquidate();
      }
    });
}

context("Wallet - Auctions", () => {
  let whale: WhaleApiClient;
  let retries = 0;
  const walletTheme = { isDark: false };
  const network = localStorage.getItem("Development.NETWORK");
  before(() => {
    whale = new WhaleApiClient({
      url:
        network === "Playground"
          ? "https://playground.jellyfishsdk.com"
          : "http://localhost:19553",
      network: "regtest",
      version: "v0",
    });
  });

  function runIfAuctionsIsAvailable(callback: any): void {
    cy.wrap<LoanVaultLiquidated[]>(whale.loan.listAuction(200), {
      timeout: 20000,
    }).then(async (response) => {
      const stats = await whale.stats.get();
      const blockCount = stats.count.blocks;
      const hasSufficientBlocksRemaining =
        response.length > 0
          ? BigNumber.max(
              response[0].liquidationHeight - blockCount,
              0
            ).toNumber() >= 15
          : false;
      if (hasSufficientBlocksRemaining || retries > 8) {
        retries = 0;
        callback();
        return;
      }

      retries += 1;
      cy.wait(5000);
      runIfAuctionsIsAvailable(callback);
    });
  }

  beforeEach(() => {
    cy.setFeatureFlags(["auction"]);
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet()
      .sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(["CD10"])
      .wait(6000);
    cy.getByTestID("dfi_balance_card").click();
    cy.getByTestID("dfi_token_amount").contains("10.00000000");
    cy.getByTestID("dfi_utxo_amount").contains("20.00000000");
    cy.getByTestID("dfi_total_balance_amount").contains("30.00000000");
    cy.setWalletTheme(walletTheme);
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("empty_vault").should("exist");
    cy.createVault(0);
    cy.getByTestID("vault_card_0_manage_loans_button").should("not.exist");
    cy.getByTestID("vault_card_0_edit_collaterals_button").click();
    cy.addCollateral("0.20000000", "DFI");
    cy.addCollateral("0.00000001", "dCD10");
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.getByTestID("vault_card_0_manage_loans_button").click();
    cy.getByTestID("button_browse_loans").click();
    cy.getByTestID("loan_card_dTU10").click();
    cy.getByTestID("max_loan_amount_text")
      .invoke("text")
      .then((text: string) => {
        const maxLoanAmount = new BigNumber(text).toFixed(2, 1); // use 2dp and round down
        cy.getByTestID("form_input_borrow").clear().type(maxLoanAmount).blur();
      });
    cy.getByTestID("borrow_loan_submit_button").click();
    cy.getByTestID("button_confirm_borrow_loan").click();
    cy.closeOceanInterface();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    generateBlockUntilLiquidate();
    cy.checkVaultTag(
      "IN LIQUIDATION",
      VaultStatus.Liquidated,
      "vault_card_0_status",
      walletTheme.isDark
    );
  });

  it("should be able to quick bid", () => {
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.sendTokenToWallet(["TU10"]).wait(6000);
    cy.getByTestID("portfolio_row_13_amount")
      .invoke("text")
      .then((balance) => {
        cy.getByTestID("bottom_tab_auctions").click();
        runIfAuctionsIsAvailable(() => {
          cy.getByTestID("batch_card_0_dTU10").should("exist");
          cy.getByTestID("batch_card_0_no_bid_text").should("exist");
          cy.getByTestID("batch_card_0_auction_value")
            .invoke("text")
            .then((text) => {
              checkValueWithinRange("2000.00", text.replace("$", ""));
            });
          cy.getByTestID("batch_card_0_min_next_bid")
            .invoke("text")
            .then((nextBid) => {
              cy.getByTestID("batch_card_0_quick_bid_button").click();
              cy.getByTestID("quick_bid_min_next_bid_amount").contains(nextBid);

              cy.getByTestID("available_token_balance").contains(
                `Available ${balance} dTU10`
              );
              cy.wrap<number | undefined>(whale.fee.estimate(), {
                timeout: 20000,
              }).then(async (fee) => {
                cy.getByTestID("text_fee").contains(
                  `${new BigNumber(+fee).toFixed(8)} DFI`
                );
                cy.getByTestID("quick_bid_submit_button").click().wait(1000);
                cy.closeOceanInterface();
                cy.getByTestID("batch_card_0_leading_text").contains(
                  "Leading bid"
                );
              });
            });
        });
      });
  });

  it("should be able to quick and place bid", () => {
    cy.getByTestID("bottom_tab_auctions").click();
    cy.sendTokenToWallet(["TU10"]).wait(6000);
    runIfAuctionsIsAvailable(() => {
      cy.getByTestID("batch_card_0").click();
      cy.getByTestID("auction_detail_bid_history_btn").should("not.exist");
      cy.getByTestID("auction_detail_loan_collaterals_0").contains(
        "0.20000000 DFI"
      );
      cy.getByTestID("auction_detail_loan_collaterals_0_rhsUsdAmount").contains(
        "$2,000.00"
      );
      cy.getByTestID("auction_detail_loan_collaterals_1").contains(
        "0.00000001 dCD10"
      );
      cy.getByTestID("auction_detail_loan_collaterals_1_rhsUsdAmount").contains(
        "$0.00"
      );
      cy.getByTestID("auction_detail_total_value").contains("$2,000.00");
      cy.go("back");

      // quick bid
      cy.getByTestID("batch_card_0_min_next_bid")
        .invoke("text")
        .then((nextBid) => {
          cy.getByTestID("batch_card_0_quick_bid_button").click();
          cy.getByTestID("quick_bid_min_next_bid_amount").contains(nextBid);
          cy.wrap<number | undefined>(whale.fee.estimate(), {
            timeout: 20000,
          }).then(async (fee) => {
            cy.getByTestID("text_fee").contains(
              `${new BigNumber(+fee).toFixed(8)} DFI`
            );
            cy.getByTestID("quick_bid_submit_button").click().wait(1000);
            cy.closeOceanInterface();
            cy.getByTestID("batch_card_0_leading_text").contains("Leading bid");

            cy.getByTestID("batch_card_0").click();
            cy.getByTestID("auction_detail_bid_history_btn").contains(
              "Bid History (1)"
            );
            cy.getByTestID("auction_detail_place_bid_btn").click();
            cy.getByTestID("105%_amount_button").click();
            cy.getByTestID("bid_button_submit").click();
            cy.getByTestID("total_auction_value").contains("$2,000.00");
            cy.getByTestID("button_confirm_bid").click();
            cy.closeOceanInterface();
            cy.getByTestID("bottom_tab_auctions").click();
            cy.getByTestID("batch_card_0_leading_text").should("exist");
            cy.getByTestID("batch_card_0").click();
            cy.getByTestID("auction_detail_bid_history_btn").contains(
              "Bid History (2)"
            );
            cy.getByTestID("auction_detail_bid_history_btn").click();
            cy.getByTestID("bid_1").should("exist");
            cy.getByTestID("bid_2").should("exist");
          });
        });
    });
  });
});

// TODO add test case for auction bid which involve multiple wallets
// TODO add test case for auction search functionality

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
