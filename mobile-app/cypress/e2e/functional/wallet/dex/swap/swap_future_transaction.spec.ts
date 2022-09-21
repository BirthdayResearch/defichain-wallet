import dayjs from "dayjs";

context.skip("Wallet - DEX - Future Swap -> Transaction", () => {
  before(() => {
    cy.createEmptyWallet(true);
    cy.sendDFITokentoWallet()
      .sendDFItoWallet()
      .sendTokenToWallet(["DUSD", "TU10", "BTC", "ETH"])
      .wait(4000);
    cy.fetchWalletBalance();
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("bottom_tab_dex").click();
    cy.getByTestID("composite_swap").click();
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_DUSD").click().wait(1000);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_dTU10").click();
  });

  it("should display correct transaction details", () => {
    cy.getByTestID("swap_tabs_FUTURE_SWAP").click();
    cy.getByTestID("swap_total_fee_amount").should("exist");
    cy.getByTestID("execution_block").should("exist");
    cy.getByTestID("execution_time_remaining").should("exist");
  });

  it("should display correct confirmation details", () => {
    cy.getByTestID("MAX_amount_button").click().wait(500);
    cy.getByTestID("button_confirm_submit").click().wait(3000);
    cy.getByTestID("text_swap_amount_from").should("have.text", "10.00000000");
    cy.getByTestID("text_swap_amount_to_unit").should("have.text", "dTU10");
    cy.getByTestID("confirm_text_fee").should("exist");
    cy.getByTestID("confirm_text_settlement_block").should("exist");
    cy.getByTestID("confirm_text_transaction_date").should(
      "have.text",
      dayjs().add(30, "second").format("MMM D, YYYY, h:mm a")
    ); // blocksSeconds = 30
    cy.getByTestID("confirm_text_receive_unit").should("have.text", "dTU10");
    cy.getByTestID("confirm_settlement_value").should(
      "have.text",
      "Settlement value +5%"
    );
    cy.wait(3000);
    cy.getByTestID("button_confirm_swap").click().wait(3500);
    cy.getByTestID("txn_authorization_title").contains(
      "Swapping 10.00000000 DUSD to dTU10 on settlement block"
    );
    cy.closeOceanInterface().wait(5000);
  });
});
