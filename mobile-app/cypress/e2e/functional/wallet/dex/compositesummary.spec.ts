import { checkValueWithinRange } from "../../../../support/walletCommands";

function setupWalletForConversion(): void {
  cy.createEmptyWallet(true);
  cy.sendDFItoWallet().sendDFITokentoWallet().wait(5000);

  cy.getByTestID("bottom_tab_dex").click().wait(3000);
  cy.getByTestID("composite_swap").click().wait(3000);
}

function setupFromAndToTokens(fromToken: string, toToken: string): void {
  cy.getByTestID("token_select_button_FROM").should("exist").click();
  cy.wait(3000);
  cy.getByTestID(`select_${fromToken}`).click().wait(1000);
  cy.getByTestID("token_select_button_TO").should("exist").click();
  cy.getByTestID(`select_${toToken}`).click().wait(1000);
}

// DFI -> dETH to show greater price rates difference
context("Wallet - DEX - Instant Swap (DFI) - Summary", () => {
  before(() => {
    setupWalletForConversion();
    setupFromAndToTokens("DFI", "dETH");
  });
  it("should be able to display price rates if tokenA and tokenB is selected", () => {
    cy.getByTestID("instant_swap_summary").should("exist");
    cy.getByTestID("instant_swap_prices_0_label")
      .should("exist")
      .should("have.text", "1 DFI =");
    cy.getByTestID("instant_swap_prices_0")
      .should("exist")
      .contains("100.00000000 dETH");
    cy.getByTestID("instant_swap_prices_0_rhsUsdAmount")
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "10,000.00");
      });
    cy.getByTestID("instant_swap_prices_1_label")
      .should("exist")
      .should("have.text", "1 dETH =");
    cy.getByTestID("instant_swap_prices_1")
      .should("exist")
      .contains("0.01000000 DFI");
    cy.getByTestID("instant_swap_prices_1_rhsUsdAmount")
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "100.00");
      });
    cy.getByTestID("swap_total_fees_label")
      .should("exist")
      .should("have.text", "Total fees");
    cy.getByTestID("swap_total_fee_amount")
      .should("exist")
      .should("have.text", "-");
  });
});
