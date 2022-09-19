function setCustomSlippage(customSlippage: string): void {
  cy.getByTestID("slippage_custom").click();
  cy.getByTestID("slippage_input").clear().type(customSlippage);
  cy.getByTestID("set_slippage_button").click().wait(3000);
}

context("Wallet - DEX - Instant Swap (non-DFI) - Confirm Txn", () => {
  before(() => {
    cy.createEmptyWallet(true);
    cy.getByTestID("header_settings").click();
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(["LTC", "USDC"])
      .wait(5000);
    cy.fetchWalletBalance();
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("bottom_tab_dex").click();
  });

  // Swap LTC through -> LTC-DFI -> DFI-USDC -> to get USDC
  it("should be able to swap tokens with 2 hops", () => {
    cy.getByTestID("composite_swap").click().wait(5000);
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_dLTC").click().wait(1000);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_dUSDC").click().wait(1000);
  });

  it("should be able to select direct pair", () => {
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("bottom_tab_dex").click();
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_dLTC").click().wait(100);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_DFI").click().wait(100);
  });

  it("should be able to switch tokens and reset values", () => {
    cy.getByTestID("switch_button").click();
    cy.getByTestID("text_input_tokenA").should("have.value", "");
    cy.getByTestID("tokenB_value").contains("0.00");
  });

  it("should be able to cancel authorization", () => {
    cy.getByTestID("text_input_tokenA").type("10");
    setCustomSlippage("10");
    cy.getByTestID("button_confirm_submit").click();

    cy.getByTestID("confirm_slippage_fee").should("have.text", "10%");
    cy.getByTestID("confirm_title").contains("You are swapping");
    cy.getByTestID("button_confirm_swap").click().wait(3000);
    // Cancel send on authorisation page
    cy.getByTestID("cancel_authorization").click();
  });

  it("should be able to swap", () => {
    cy.getByTestID("confirm_estimated_to_receive").then(() => {
      cy.getByTestID("button_confirm_swap").click().wait(3000);
      cy.closeOceanInterface();
      cy.fetchWalletBalance();
      cy.getByTestID("bottom_tab_portfolio").click();
      cy.getByTestID("portfolio_row_4").should("exist");

      /* Estimated return is not accurate yet due to tolerable slippage */
      // const tokenValue = $txt[0].textContent
      //   .replace(" dLTC", "")
      //   .replace(",", "");
      // cy.getByTestID("portfolio_row_4_amount").then(($txt: any) => {
      //   const balanceAmount = $txt[0].textContent
      //     .replace(" dLTC", "")
      //     .replace(",", "");
      //   expect(new BigNumber(balanceAmount).toNumber()).be.gte(
      //     new BigNumber(tokenValue).toNumber()
      //   );
      // });
    });
  });
});
