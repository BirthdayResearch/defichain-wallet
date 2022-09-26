import BigNumber from "bignumber.js";

function setCustomSlippage(customSlippage: string): void {
  cy.getByTestID("slippage_custom_amount").click();
  cy.getByTestID("slippage_input").clear().click().type(customSlippage);
  cy.getByTestID("set_slippage_button").click().wait(3000);
}

context("Wallet - DEX - Instant Swap (non-DFI)", () => {
  before(() => {
    cy.createEmptyWallet(true);
    cy.getByTestID("header_settings").click();
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(["LTC", "TU10"])
      .wait(3000);
    cy.fetchWalletBalance();
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("bottom_tab_dex").click();
  });

  it("should be able to choose tokens to swap", () => {
    cy.getByTestID("composite_swap").click();
    cy.wait(5000);
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_DFI_value").should("have.text", "20.00000000");
    cy.getByTestID("select_DFI").click().wait(1000);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_dLTC").should("exist");
    cy.getByTestID("select_DFI").should("not.exist");
    cy.getByTestID("swap_token_selection_screen").within(() => {
      cy.get('[data-testid^="select_"]').each((item) => {
        cy.wrap(item).should("not.contain.text", "/v1");
      });
    });
    cy.getByTestID("select_dLTC").click();
  });

  it("should be able to validate form", () => {
    // Valid form
    cy.getByTestID("text_input_tokenA").type("1");
    cy.getByTestID("tokenB_value").contains("1");

    cy.getByTestID("button_confirm_submit").should("not.have.attr", "disabled");

    // Invalid tokenA - NaN, more than Max, zero
    cy.getByTestID("text_input_tokenA").clear().type("a").blur().wait(100);
    cy.getByTestID("text_input_tokenA").should("have.value", "0");
    cy.getByTestID("tokenB_value").contains(new BigNumber(0).toFixed(8));
    cy.getByTestID("tokenB_displaySymbol").contains("dLTC");
    cy.getByTestID("button_confirm_submit").should(
      "have.attr",
      "aria-disabled"
    );
    cy.getByTestID("text_input_tokenA").clear().type("15").blur().wait(500);
    cy.getByTestID("transaction_details_hint_text").should(
      "have.text",
      "By continuing, the required amount of DFI will be converted"
    );
    cy.getByTestID("button_confirm_submit").should("not.have.attr", "disabled");
    cy.getByTestID("text_input_tokenA").clear().type("0").blur().wait(100);
    cy.getByTestID("button_confirm_submit").should(
      "have.attr",
      "aria-disabled"
    );
  });

  it("should be able to see USD amount", () => {
    cy.getByTestID("tokenA_value_in_usd").should("exist");
    cy.getByTestID("tokenB_value_in_usd").should("exist");
  });

  it("should be able to use/validate custom slippage tolerance", () => {
    cy.getByTestID("text_input_tokenA").type("10");
    cy.getByTestID("slippage_1%").should("exist");

    // Slippage warning
    setCustomSlippage("22");
    cy.getByTestID("slippage_warning").should(
      "have.text",
      "Set high tolerance at your own risk"
    );
    cy.getByTestID("slippage_custom").click();
    cy.getByTestID("slippage_input").clear().click().type("5");

    // Slippage validation
    cy.getByTestID("slippage_input").should("have.value", "5");
    cy.getByTestID("slippage_input")
      .clear()
      .click()
      .type("101")
      .blur()
      .wait(100);
    cy.getByTestID("slippage_input_error").should(
      "have.text",
      "Slippage rate must range from 0-100%"
    );
    cy.getByTestID("slippage_input").clear();
    cy.getByTestID("slippage_input")
      .clear()
      .click()
      .type("-1")
      .blur()
      .wait(100);
    cy.getByTestID("slippage_input_error").should(
      "have.text",
      "Slippage rate must range from 0-100%"
    );
    cy.getByTestID("slippage_input")
      .clear()
      .click()
      .type("a1")
      .blur()
      .wait(100);
    cy.getByTestID("slippage_input_error").should(
      "have.text",
      "Slippage rate must range from 0-100%"
    );
    cy.getByTestID("button_confirm_submit").should(
      "have.attr",
      "aria-disabled"
    );
  });

  it("should revert to previous state if (x) is pressed", () => {
    // clear slippage tolerance (0%)
    cy.getByTestID("slippage_input_clear_button").click();
    cy.getByTestID("set_slippage_button").click();
    cy.getByTestID("slippage_custom_amount").should("have.text", "22.00%");

    cy.getByTestID("slippage_custom").click();
    cy.getByTestID("slippage_input")
      .clear()
      .click()
      .type("17.5")
      .blur()
      .wait(100);
    cy.getByTestID("slippage_input_clear_button").click();
    cy.getByTestID("set_slippage_button").click();

    cy.getByTestID("slippage_custom_amount").should("have.text", "22.00%");
  });

  it("should not store custom slippage if set button is not pressed", () => {
    cy.getByTestID("slippage_3%").click();
    // type custom slippage, don't press set button
    cy.getByTestID("slippage_custom").click();
    cy.getByTestID("slippage_input")
      .clear()
      .click()
      .type("17")
      .blur()
      .wait(100);

    // reset swap form
    cy.getByTestID("bottom_tab_dex").click();
    cy.getByTestID("composite_swap").click();
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_DFI").click().wait(1000);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_dLTC").click();
  });

  it("should display 2dp in custom slippage tolerance button", () => {
    setCustomSlippage("1.123456789");
    cy.getByTestID("slippage_custom_amount").should("have.text", "1.12%");
  });

  it("should display 2dp in custom slippage tolerance input", () => {
    cy.getByTestID("slippage_custom").click();
    cy.getByTestID("slippage_input").should("have.value", "1.12");
  });

  it("should be able to store selected slippage value in storage", () => {
    cy.url().should("include", "app/DEX/CompositeSwap", () => {
      expect(localStorage.getItem("WALLET.SLIPPAGE_TOLERANCE")).to.eq("1.12");
    });
  });

  it("previously saved slippage tolerance value should be 1.12%", () => {
    cy.getByTestID("text_input_tokenA").type("10");
    cy.getByTestID("text_input_tokenA").type("20");
    cy.getByTestID("slippage_input").should("have.value", "1.12");
  });
});
