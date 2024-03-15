import { WhaleApiClient } from "@defichain/whale-api-client";
import { PriceTicker } from "@defichain/whale-api-client/dist/api/prices";
import BigNumber from "bignumber.js";

context("Wallet - Portfolio - Empty Balance", { testIsolation: false }, () => {
  before(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.createEmptyWallet(true);
  });

  it("should not display any value when API failed", () => {
    cy.intercept("**/regtest/address/**", {
      statusCode: 404,
      body: "404 Not Found!",
      headers: {
        "x-not-found": "true",
      },
    });
    // cy.getByTestID('dfi_total_balance_amount').should('exist')
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("total_portfolio_skeleton_loader").should("exist");
    cy.getByTestID("dfi_balance_skeleton_loader").should("exist");
    cy.getByTestID("dfi_USD_balance_skeleton_loader").should("exist");
    cy.getByTestID("portfolio_skeleton_loader").should("exist");
  });

  it("should display correct address", () => {
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("receive_balance_button").click();
    cy.getByTestID("address_text")
      .should("exist")
      .then(($txt: any) => {
        const address = $txt[0].textContent;
        cy.go("back");
        cy.getByTestID("switch_account_button").click();
        cy.getByTestID("active_address").should("contain", address);
      });
    cy.getByTestID("close_bottom_sheet_button").click();
    cy.wait(1000);
  });

  it("should have disabled send button", () => {
    cy.getByTestID("send_balance_button").should(
      "not.have.attr",
      "aria-disabled",
    );
  });

  it("should display empty portfolio to replace token list", () => {
    cy.getByTestID("empty_portfolio").should("exist");
  });

  it("should not show get DFI action button when there is no existing DFI", () => {
    cy.getByTestID("get_DFI_action_btn").should("not.exist");
  });

  it("should show get DFI now tag", () => {
    cy.getByTestID("get_DFI_btn").should("exist").click();
    cy.url().should("include", "app/GetDFIScreen");
  });

  it("should open to marketplace screen", () => {
    cy.getByTestID("get_exchanges").should("exist").click();
    cy.url().should("include", "app/MarketplaceScreen");
    cy.getByTestID("exchange_0").should("exist");
    cy.getByTestID("exchange_1").should("exist");
    cy.getByTestID("exchange_2").should("exist");
    cy.getByTestID("exchange_3").should("exist");
    cy.getByTestID("market_places_header_back").click();
  });

  it("should get DFI oracle price on get DFI screen", () => {
    const network = localStorage.getItem("Development.NETWORK");
    const whale: WhaleApiClient = new WhaleApiClient({
      url:
        network === "Playground"
          ? "https://playground.jellyfishsdk.com"
          : "http://localhost:19553",
      network: "regtest",
      version: "v0",
    });
    cy.wrap(whale.prices.get("DFI", "USD")).then((response: PriceTicker) => {
      cy.getByTestID("dfi_oracle_price")
        .invoke("text")
        .then((price: string) => {
          expect(price).to.equal(
            `$${new BigNumber(response.price.aggregated.amount).toFixed(2)}`,
          );
        });
    });
  });
});
