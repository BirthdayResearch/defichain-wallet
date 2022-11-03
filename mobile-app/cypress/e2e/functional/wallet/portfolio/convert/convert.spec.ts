import BigNumber from "bignumber.js";
import { checkValueWithinRange } from "../../../../../support/walletCommands";

BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

function createDFIWallet(): void {
  cy.createEmptyWallet(true);
  cy.sendDFItoWallet().sendDFItoWallet().sendDFITokentoWallet().wait(10000);

  cy.getByTestID("bottom_tab_portfolio").click();
  cy.getByTestID("portfolio_list").should("exist");
  cy.getByTestID("dfi_total_balance_amount").contains("30.00000000");
  cy.getByTestID("dfi_balance_card").should("exist").click();
  cy.getByTestID("dfi_token_amount").contains("10.00000000");
  cy.getByTestID("dfi_utxo_amount").contains("20.00000000");
  cy.getByTestID("convert_button").click();
  cy.getByTestID("button_convert_mode_toggle").click();
}

function validateConvertResult(
  targetUnit: string,
  availableAmount: number,
  resultingAmount: number
): void {
  cy.getByTestID("convert_result_card").should("exist");
  cy.getByTestID("convert_available_label").contains(targetUnit);
  cy.getByTestID("convert_resulting_label").contains(targetUnit);
  cy.getByTestID("convert_available_amount").contains(availableAmount);
  cy.getByTestID("convert_result_amount").contains(resultingAmount);
}

context("Wallet - Convert DFI", () => {
  before(() => {
    createDFIWallet();
  });

  it("should have form validation", () => {
    cy.getByTestID("button_continue_convert").should(
      "have.attr",
      "aria-disabled"
    );
    cy.getByTestID("source_balance").contains(19.9);
    cy.getByTestID("convert_source").contains("UTXO");
    cy.getByTestID("convert_target").contains("Token");
    cy.getByTestID("convert_input").type("1");
    cy.getByTestID("convert_input_clear_button").click();
    cy.getByTestID("button_continue_convert").should(
      "have.attr",
      "aria-disabled"
    );
    cy.getByTestID("convert_input").type("1");
    cy.getByTestID("source_balance").contains(19.9);
    validateConvertResult("tokens", 1.0, 11);
    cy.getByTestID("button_continue_convert").should(
      "not.have.attr",
      "disabled"
    );
  });

  it("should swap conversion", () => {
    cy.getByTestID("button_convert_mode_toggle").click().wait(4000);
    cy.getByTestID("source_balance").contains(10);
    cy.getByTestID("convert_source").contains("Token");
    cy.getByTestID("convert_target").contains("UTXO");
    cy.getByTestID("button_continue_convert").should(
      "not.have.attr",
      "disabled"
    );
  });

  it("should test amount buttons when UTXO to account conversion", () => {
    cy.getByTestID("button_convert_mode_toggle").click().wait(4000);
    cy.getByTestID("25%_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "4.97500000");
    validateConvertResult("tokens", 10.0, 14.975);
    cy.getByTestID("50%_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "9.95000000");
    validateConvertResult("tokens", 10.0, 19.95);
    cy.getByTestID("75%_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "14.92500000");
    validateConvertResult("tokens", 10.0, 24.925);
    cy.getByTestID("MAX_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "19.90000000");
    validateConvertResult("tokens", 10.0, 29.9);
  });

  it("should display info on reserved UTXO when UTXO to account conversion", () => {
    cy.getByTestID("source_balance_label").contains(
      "A small amount of UTXO is reserved for fees"
    );
  });

  it("should test amount buttons when account to UTXO conversion", () => {
    cy.getByTestID("button_convert_mode_toggle").click().wait(4000);
    cy.getByTestID("25%_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "2.50000000");
    validateConvertResult("UTXO", 20.0, 22.5);
    cy.getByTestID("50%_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "5.00000000");
    validateConvertResult("UTXO", 20.0, 25);
    cy.getByTestID("75%_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "7.50000000");
    validateConvertResult("UTXO", 20.0, 27.5);
    cy.getByTestID("MAX_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "10.00000000");
    validateConvertResult("UTXO", 20.0, 30);
  });

  it("should test account to UTXO conversion", () => {
    cy.getByTestID("convert_input").clear().type("1").blur();
    cy.getByTestID("button_continue_convert").click();
    cy.getByTestID("button_confirm_convert").should(
      "not.have.attr",
      "disabled"
    );
    cy.getByTestID("button_cancel_convert").click();
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("convert_button").click();
    cy.getByTestID("convert_input").clear().type("1");
    cy.getByTestID("convert_input").should("exist");

    cy.getByTestID("button_continue_convert").click();

    cy.getByTestID("confirm_title").contains("You are converting to UTXO");
    cy.getByTestID("text_convert_amount").contains("1.00000000");
    cy.getByTestID("resulting_tokens_value").contains("9.00000000");
    cy.getByTestID("resulting_tokens_sub_value").contains("30.00%");
    cy.getByTestID("resulting_utxo_value")
      .invoke("text")
      .then((text: string) => {
        checkValueWithinRange(text.replace(" DFI", ""), "20.99999", 0.1);
      });
    cy.getByTestID("resulting_utxo_sub_value").contains("70.00%");
    cy.getByTestID("transaction_fee_value").should("exist");
    cy.getByTestID("button_cancel_convert").click();
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("convert_button").click();
  });

  it("should test UTXO to account conversion", () => {
    cy.getByTestID("button_convert_mode_toggle").click().wait(4000);
    cy.getByTestID("convert_input").clear().type("1");
    cy.getByTestID("button_continue_convert").click();
    cy.getByTestID("button_confirm_convert").should(
      "not.have.attr",
      "disabled"
    );
    cy.getByTestID("button_cancel_convert").click();
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("convert_button").click();
    cy.getByTestID("button_convert_mode_toggle").click().wait(4000);
    cy.getByTestID("convert_input").clear().type("1");

    cy.getByTestID("button_continue_convert").click();

    cy.getByTestID("confirm_title").contains("You are converting to tokens");
    cy.getByTestID("text_convert_amount").contains("1.00000000");
    cy.getByTestID("resulting_tokens_value").contains("11.00000000");
    cy.getByTestID("resulting_tokens_sub_value").contains("36.79%");
    cy.getByTestID("resulting_utxo_value")
      .invoke("text")
      .then((text: string) => {
        checkValueWithinRange(text.replace(" DFI", ""), "18.89999", 0.1);
      });
    cy.getByTestID("resulting_utxo_sub_value").contains("63.21%");
    cy.getByTestID("transaction_fee_value").should("exist");
  });
});

context("Wallet - Convert UTXO to Account", () => {
  it("should test conversion of UTXO to account", () => {
    createDFIWallet();
    cy.getByTestID("convert_input").clear().type("1");
    cy.getByTestID("button_continue_convert").click();
    cy.getByTestID("button_confirm_convert").click().wait(4000);
    cy.closeOceanInterface().wait(5000);
    cy.getByTestID("dfi_total_balance_amount").contains("29.999");
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("dfi_utxo_amount").contains("18.999"); // 20 - 1 - fee
    cy.getByTestID("dfi_token_amount").contains("11");
  });

  it("should be able to convert correct amount when user cancel a tx and updated some inputs for UTXO to Account conversion", () => {
    const oldAmount = "1";
    const newAmount = "2";
    createDFIWallet();
    cy.getByTestID("convert_input").clear().type(oldAmount);
    cy.getByTestID("button_continue_convert").click();
    cy.getByTestID("button_confirm_convert").click().wait(2000);
    // Check for authorization page description
    cy.getByTestID("txn_authorization_title").contains(
      `Convert ${new BigNumber(oldAmount).toFixed(8)} DFI to tokens`
    );

    // Cancel send on authorisation page
    cy.getByTestID("cancel_authorization").click();
    cy.getByTestID("button_cancel_convert").click();
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("convert_button").click();
    // Update the input amount
    cy.getByTestID("button_convert_mode_toggle").click().wait(4000);
    cy.getByTestID("convert_input").clear().type(newAmount);
    cy.getByTestID("button_continue_convert").click();
    // Confirm convert
    cy.getByTestID("button_confirm_convert").should(
      "not.have.attr",
      "disabled"
    );
    cy.getByTestID("button_confirm_convert").click();
    // Check for authorization page description
    cy.getByTestID("txn_authorization_title").contains(
      `Convert ${new BigNumber(newAmount).toFixed(8)} DFI to tokens`
    );
    cy.closeOceanInterface().wait(5000);

    cy.getByTestID("dfi_total_balance_amount").contains("29.999");
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("dfi_utxo_amount").contains("17.999"); // 20 - 2 - fee
    cy.getByTestID("dfi_token_amount").contains("12");
  });
});

context("Wallet - Convert Account to UTXO", () => {
  it("should test conversion of account to UTXO", () => {
    createDFIWallet();
    cy.getByTestID("button_convert_mode_toggle").click().wait(4000);
    cy.getByTestID("convert_input").clear().type("1");
    cy.getByTestID("button_continue_convert").click();
    cy.getByTestID("button_confirm_convert").click().wait(4000);
    cy.closeOceanInterface().wait(5000);

    cy.getByTestID("dfi_total_balance_amount").contains("29.999");
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("dfi_utxo_amount").contains("20.999");
    cy.getByTestID("dfi_token_amount").contains("9");
  });

  it("should be able to convert correct amount when user cancel a tx and updated some inputs for Account to UTXO conversion", () => {
    const oldAmount = "1";
    const newAmount = "2";
    createDFIWallet();
    cy.getByTestID("button_convert_mode_toggle").click().wait(4000);
    cy.getByTestID("convert_input").clear().type(oldAmount);
    cy.getByTestID("button_continue_convert").click();
    cy.getByTestID("button_confirm_convert").should(
      "not.have.attr",
      "disabled"
    );
    cy.getByTestID("button_cancel_convert").click();
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("convert_button").click();
    cy.getByTestID("convert_input").clear().type(oldAmount);

    cy.getByTestID("button_continue_convert").click();

    cy.getByTestID("button_confirm_convert").click().wait(2000);
    // Check for authorization page description
    cy.getByTestID("txn_authorization_title").contains(
      `Convert ${new BigNumber(oldAmount).toFixed(8)} DFI to UTXO`
    );
    // Cancel send on authorisation page
    cy.getByTestID("cancel_authorization").click();
    cy.getByTestID("button_cancel_convert").click();
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("convert_button").click();
    // Update the input amount
    cy.getByTestID("convert_input").clear().type(newAmount);
    cy.getByTestID("button_continue_convert").click();
    // Confirm convert
    cy.getByTestID("button_confirm_convert").should(
      "not.have.attr",
      "disabled"
    );
    cy.getByTestID("button_confirm_convert").click();
    // Check for authorization page description
    cy.getByTestID("txn_authorization_title").contains(
      `Convert ${new BigNumber(newAmount).toFixed(8)} DFI to UTXO`
    );
    cy.closeOceanInterface().wait(5000);

    cy.getByTestID("dfi_total_balance_amount").contains("29.999");
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("dfi_utxo_amount").contains("21.999"); // 20 + 2 - fee
    cy.getByTestID("dfi_token_amount").contains("8");
  });
});
