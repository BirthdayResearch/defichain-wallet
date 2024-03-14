import BigNumber from "bignumber.js";

BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

context("Wallet - Send - Switch token", { testIsolation: false }, () => {
  before(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(["BTC", "ETH"])
      .wait(6000);
    cy.getByTestID("bottom_tab_portfolio").click();
  });

  it("should be able to select token", () => {
    cy.getByTestID("send_balance_button").click();
    cy.getByTestID("select_DFI_value").should("have.text", "19.90000000");
    cy.getByTestID("select_dBTC_value").should("have.text", "10.00000000");
    cy.getByTestID("select_dETH_value").should("have.text", "10.00000000");
    cy.wait(3000); // timeout to allow max. one block-cycle of re-render
    cy.getByTestID("select_DFI").click();
    cy.getByTestID("button_confirm_send_continue").should(
      "have.attr",
      "aria-disabled",
    );
    cy.getByTestID("max_value").should("have.text", "19.90000000");
    cy.getByTestID("max_value_display_symbol").contains("DFI");
  });

  it("should be able to switch token", () => {
    cy.getByTestID("select_token_input").click();
    cy.wait(3000); // timeout to allow max. one block-cycle of re-render
    cy.getByTestID("select_dBTC").click();
    cy.getByTestID("max_value").should("have.text", "10.00000000");
    cy.getByTestID("max_value_display_symbol").contains("dBTC");
    cy.getByTestID("button_confirm_send_continue").should(
      "have.attr",
      "aria-disabled",
    );
  });

  it("should be able to pre-select token", () => {
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("portfolio_list").should("exist");
    cy.getByTestID("portfolio_row_2").should("exist");
    cy.getByTestID("portfolio_row_2_amount").contains(10).click();
    cy.getByTestID("send_button").click();
    cy.getByTestID("max_value").should("have.text", "10.00000000");
    cy.getByTestID("max_value_display_symbol").contains("dETH");
  });

  it("should be able to enable/disable token selection", () => {
    cy.createEmptyWallet(true);
    cy.wait(3000);
    // No token
    cy.getByTestID("bottom_tab_portfolio").should("exist");
    cy.getByTestID("action_button_group").should("exist");
    cy.getByTestID("send_balance_button").click().wait(3000);
    cy.getByTestID("no_asset_text").should("exist");
    cy.getByTestID("no_asset_sub_text").should("exist");

    // With DFI
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.sendDFITokentoWallet().wait(3000);
    cy.getByTestID("action_button_group").should("exist");
    cy.getByTestID("send_balance_button").click().wait(3000);
    cy.getByTestID("select_DFI").click().wait(3000);
    cy.getByTestID("max_value").should("have.text", "9.90000000");
    cy.getByTestID("max_value_display_symbol").contains("DFI");
  });
});
