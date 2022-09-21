import dayjs from "dayjs";
import { checkValueWithinRange } from "../../../../../support/walletCommands";

function validateFutureSwapDisabled(
  fromToken: string | undefined,
  toToken: string
): void {
  if (fromToken !== undefined) {
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID(`select_${fromToken}`).click().wait(1000);
  }
  cy.getByTestID("token_select_button_TO").click();
  cy.getByTestID(`select_${toToken}`).click();
  cy.getByTestID("50%_amount_button").click().wait(500);
  cy.getByTestID("swap_tabs_FUTURE_SWAP").should("have.attr", "aria-disabled");
  cy.getByTestID("button_confirm_submit").click();
  cy.getByTestID("settlement_block_label").should("not.exist");
  cy.go("back");
}

function validatePriceSection(testID: string, isHidden: boolean): void {
  if (isHidden) {
    cy.getByTestID(`${testID}_0`).should("not.exist");
    cy.getByTestID(`${testID}_0_label`).should("not.exist");
    cy.getByTestID(`${testID}_1`).should("not.exist");
    cy.getByTestID(`${testID}_1_label`).should("not.exist");
  } else {
    cy.getByTestID(`${testID}_0`)
      .invoke("text")
      .then((text) => {
        const value = text.split(" ")[0];
        checkValueWithinRange(value, "1", 0.2);
      });
    cy.getByTestID(`${testID}_0_label`).contains("1 DUSD");
    cy.getByTestID(`${testID}_0`).contains("dTU10");

    cy.getByTestID(`${testID}_1`)
      .invoke("text")
      .then((text) => {
        const value = text.split(" ")[0];
        checkValueWithinRange(value, "1", 0.2);
      });
    cy.getByTestID(`${testID}_1_label`).contains("1 dTU10");
    cy.getByTestID(`${testID}_1`).contains("DUSD");
  }
}

context("Wallet - DEX - Future Swap", () => {
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
  });

  it("should have no swap option on crypto -> loan combination", () => {
    // crypto to loan token
    validateFutureSwapDisabled("dBTC", "dTU10");
  });

  it("should  have no swap option on crypto -> crpyto combination", () => {
    // crypto to crypto
    validateFutureSwapDisabled(undefined, "dETH");
  });

  it("should have both swap options on loan -> loan combination", () => {
    // loan (DUSD) to loan token
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_DUSD").click().wait(1000);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_dTU10").click();
    cy.getByTestID("50%_amount_button").click().wait(500);
    cy.getByTestID("swap_tabs_FUTURE_SWAP").should(
      "not.have.attr",
      "aria-disabled"
    );
    cy.getByTestID("button_confirm_submit").click().wait(1500);
    cy.getByTestID("settlement_block_label").should("not.exist");
    cy.go("back");
    cy.getByTestID("swap_tabs_FUTURE_SWAP").click();
    cy.getByTestID("button_confirm_submit").click().wait(1500);
    cy.getByTestID("settlement_block_label").should("exist");
    cy.go("back");
  });

  it("should have no swap option on loan -> crypto combination", () => {
    // loan to crypto token
    cy.getByTestID("swap_tabs_INSTANT_SWAP").click();
    validateFutureSwapDisabled("dTU10", "dBTC");
  });

  it("should have no swap option on dfi -> crypto combination", () => {
    // dfi to crypto token
    validateFutureSwapDisabled("DFI", "dBTC");
  });

  it("should display future swap option if Loan token -> DUSD selected", () => {
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_dTU10").click().wait(1000);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_DUSD").click();
    cy.getByTestID("swap_tabs_FUTURE_SWAP").should(
      "not.have.attr",
      "aria-disabled"
    );
  });

  it("should display oracle price -5% if Loan token -> DUSD selected", () => {
    cy.getByTestID("swap_tabs_FUTURE_SWAP").click();
    cy.getByTestID("MAX_amount_button").click();
    cy.getByTestID("settlement_value_percentage").should(
      "have.text",
      "Settlement Value -5%"
    );
    cy.getByTestID("oracle_announcements_banner").contains(
      "You are selling your"
    );
    cy.getByTestID("oracle_announcements_banner").contains("dTU10 at 5% less");
    cy.getByTestID("oracle_announcements_banner").contains(
      "than the oracle price at settlement block"
    );
  });

  it("should display future swap option if DUSD -> Loan token selected", () => {
    cy.wait(4000);
    cy.getByTestID("swap_tabs_INSTANT_SWAP").click();
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_DUSD").click().wait(1000);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_dTU10").click();
    cy.getByTestID("swap_tabs_FUTURE_SWAP").should(
      "not.have.attr",
      "aria-disabled"
    );
    cy.getByTestID("MAX_amount_button").click();
  });

  it("should display price rates on instant swap", () => {
    validatePriceSection("instant_swap_prices", false);
    cy.getByTestID("button_confirm_submit").click();
    validatePriceSection("instant_swap_summary", false);
    cy.go("back");
  });

  it("should not display price rates on future swap", () => {
    cy.getByTestID("swap_tabs_FUTURE_SWAP").click();
    validatePriceSection("instant_swap_prices", true);
    cy.getByTestID("button_confirm_submit").click();
    validatePriceSection("instant_swap_summary", true);
    cy.go("back");
  });

  it("should display oracle price +5% if DUSD to Loan token", () => {
    cy.getByTestID("settlement_value_percentage").should(
      "have.text",
      "Settlement Value +5%"
    );
    cy.getByTestID("oracle_announcements_banner").contains("You are buying");
    cy.getByTestID("oracle_announcements_banner").contains("dTU10 at 5% more");
    cy.getByTestID("oracle_announcements_banner").contains(
      "than the oracle price at settlement block"
    );
  });

  it("should disable continue button if amount is >available/zero/NaN/", () => {
    cy.getByTestID("text_input_tokenA").clear().type("a");
    cy.getByTestID("button_confirm_submit").should(
      "have.attr",
      "aria-disabled"
    );

    cy.getByTestID("text_input_tokenA").clear().type("0");
    cy.getByTestID("button_confirm_submit").should(
      "have.attr",
      "aria-disabled"
    );

    cy.getByTestID("text_input_tokenA").clear().type("1000");
    cy.getByTestID("button_confirm_submit").should(
      "have.attr",
      "aria-disabled"
    );
  });

  it("should display correct transaction details", () => {
    cy.getByTestID("swap_total_fee_amount").should("exist");
    cy.getByTestID("execution_block").should("exist");
    cy.getByTestID("execution_block_date").should("exist");
  });

  it("should display correct confirmation details", () => {
    cy.getByTestID("MAX_amount_button").click();
    cy.getByTestID("button_confirm_submit").click();
    cy.getByTestID("text_swap_amount_from").should("have.text", "10.00000000");
    cy.getByTestID("text_swap_amount_to_unit").should("have.text", "dTU10");
    cy.getByTestID("confirm_text_fee").should("exist");
    cy.getByTestID("confirm_text_settlement_block").should("exist");
    cy.getByTestID("confirm_text_transaction_date").should(
      "have.text",
      dayjs().add(30, "second").format("MMM D, YYYY")
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
