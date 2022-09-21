import BigNumber from "bignumber.js";

/*
  Future swap settles every 20 blocks. To ensure that there"s ample time (20 blocks) to:
    Future Swap -> Withdraw Future Swap -> Do checks
  the flow must start to a block divisible by 20 + 1
*/
function waitUntilFutureSwapSettles(): void {
  cy.getByTestID("current_block_count_value")
    .invoke("text")
    .then((text: string) => {
      const currentBlockCount = new BigNumber(text);
      if (!currentBlockCount.modulo(20).isEqualTo(1)) {
        cy.wait(2000);
        waitUntilFutureSwapSettles();
      }
    });
}

context("Wallet - Future Swap -> Display -> Withdraw flow", () => {
  before(() => {
    cy.createEmptyWallet(true);
    cy.sendDFITokentoWallet()
      .sendDFItoWallet()
      .sendTokenToWallet(["TU10", "DUSD", "BTC"])
      .wait(3000);
    cy.fetchWalletBalance();
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("bottom_tab_dex").click();
    cy.getByTestID("composite_swap").click();
    cy.wait(5000);
  });

  it("should future swap DUSD -> dTU10", () => {
    waitUntilFutureSwapSettles();
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_DUSD").click().wait(1000);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_dTU10").click();
    cy.getByTestID("swap_tabs_FUTURE_SWAP").click();

    cy.getByTestID("MAX_amount_button").click();
    cy.getByTestID("button_confirm_submit").click();
    cy.wait(3000);
    cy.getByTestID("button_confirm_swap").click().wait(3000);
    cy.closeOceanInterface();
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("future_swap_button").click();
  });

  it("should display correct withdraw transaction details", () => {
    cy.getByTestID("DUSD-dTU10").click();
    cy.getByTestID("text_input_percentage").clear().type("6");
    cy.getByTestID("text_fee").should("exist");
    cy.getByTestID("button_continue_withdraw").click();
  });

  it("should display correct confirmation withdraw transaction details", () => {
    cy.getByTestID("confirm_title").should("have.text", "You are withdrawing");
    cy.getByTestID("title_tx_detail").should("have.text", "6.00000000");
    cy.getByTestID("text_fee").should("exist");
    cy.getByTestID("receive_value").should("have.text", "6.00000000 DUSD");
    cy.getByTestID("button_confirm_withdraw_future_swap").click().wait(3000);
    cy.getByTestID("txn_authorization_title").should(
      "have.text",
      "Withdrawing 6.00000000 DUSD from DUSD-dTU10 swap"
    );
    cy.closeOceanInterface();
  });

  it("should display partial withdrawal amount", () => {
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("future_swap_button").click();
    cy.getByTestID("DUSD-dTU10_amount").should("have.text", "4.00000000 DUSD");
  });

  it("should settle the future swap on next settlement block", () => {
    waitUntilFutureSwapSettles();
    cy.getByTestID("DUSD-dTU10_amount").should("not.exist");
  });
});
