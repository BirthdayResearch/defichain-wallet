import BigNumber from "bignumber.js";
import { checkValueWithinRange } from "../../../../../support/walletCommands";

BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

function createDFIWallet(): void {
  createDFIWalletWithTokens();
  cy.getByTestID("bottom_tab_portfolio").click();
  cy.getByTestID("portfolio_list").should("exist");
  cy.getByTestID("dfi_total_balance_amount").contains("20.00000000");
  cy.getByTestID("dfi_balance_card").should("exist").click();
  cy.getByTestID("dfi_token_amount").contains("10.00000000");
  cy.getByTestID("dfi_utxo_amount").contains("10.00000000");
  cy.getByTestID("convert_button").filter(":visible").click();
  cy.getByTestID("button_convert_mode_toggle").click();
}

function createDFIWalletWithTokens(): void {
  cy.createEmptyWallet(true);
  cy.sendDFItoWallet().sendDFITokentoWallet().wait(10000);
}

function validateConvertResult(
  targetUnit: string,
  availableAmount: number,
  resultingAmount: number,
): void {
  cy.getByTestID("convert_result_card").should("exist");
  cy.getByTestID("convert_available_label").contains(targetUnit);
  cy.getByTestID("convert_resulting_label").contains(targetUnit);
  cy.getByTestID("convert_available_amount").contains(availableAmount);
  cy.getByTestID("convert_result_amount").contains(resultingAmount);
}

function convertDFIEVMToDVM(): void {
  cy.getByTestID("convert_action_button").click();
  cy.getByTestID("DFI (Token)_symbol").click();
  cy.getByTestID("token_select_button_TO").click();
  cy.getByTestID("DFI_name").contains("DeFiChain for EVM").click();
  cy.getByTestID("50%_amount_button").click();
  cy.getByTestID("button_continue_convert").click();
  cy.getByTestID("button_confirm_convert").click();
  cy.closeOceanInterface().wait(5000);
  cy.getByTestID("dfi_balance_card").should("exist");
}

// Verified
context("Wallet - Convert DFI", () => {
  before(() => {
    createDFIWallet();
  });

  it("should have form validation", () => {
    cy.getByTestID("button_continue_convert").should(
      "have.attr",
      "aria-disabled",
    );
    cy.getByTestID("source_balance").should(
      "have.text",
      "I HAVE 9.90000000 UTXO",
    );
    cy.getByTestID("token_select_button_FROM_display_symbol").should(
      "have.text",
      "UTXO",
    );
    cy.getByTestID("convert_token_button_TO_display_symbol").contains("DFI");
    cy.getByTestID("convert_input").type("1");
    cy.getByTestID("convert_input").clear();
    cy.getByTestID("button_continue_convert").should(
      "have.attr",
      "aria-disabled",
    );
    cy.getByTestID("convert_input").type("1");
    cy.getByTestID("source_balance").contains(9.9);
    validateConvertResult("DFI", 10.0, 11.0);
    cy.getByTestID("button_continue_convert").should(
      "not.have.attr",
      "disabled",
    );
  });

  it("should swap conversion", () => {
    cy.getByTestID("button_convert_mode_toggle").click().wait(4000);
    cy.getByTestID("source_balance").contains(10);
    cy.getByTestID("token_select_button_FROM_display_symbol").contains("DFI");
    cy.getByTestID("token_select_button_TO_display_symbol").contains("UTXO");
    cy.getByTestID("convert_input").type("1");
    cy.getByTestID("button_continue_convert").should(
      "not.have.attr",
      "disabled",
    );
  });

  it("should test amount buttons when account to UTXO conversion", () => {
    cy.getByTestID("25%_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "2.50000000");
    validateConvertResult("UTXO", 9.9, 12.4);
    cy.getByTestID("50%_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "5.00000000");
    validateConvertResult("UTXO", 9.9, 14.9);
    cy.getByTestID("75%_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "7.50000000");
    validateConvertResult("UTXO", 9.9, 17.4);
    cy.getByTestID("MAX_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "10.00000000");
    validateConvertResult("UTXO", 9.9, 19.9);
  });

  it("should test amount buttons when UTXO to account conversion", () => {
    cy.getByTestID("button_convert_mode_toggle").click().wait(4000);
    cy.getByTestID("25%_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "2.47500000");
    validateConvertResult("DFI", 10.0, 12.4);
    cy.getByTestID("50%_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "4.95000000");
    validateConvertResult("DFI", 10.0, 14.95);
    cy.getByTestID("75%_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "7.42500000");
    validateConvertResult("DFI", 10.0, 17.425);
    cy.getByTestID("MAX_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "9.90000000");
    validateConvertResult("DFI", 10.0, 19.9);
    cy.getByTestID("source_balance_label").contains(
      "A small amount of UTXO is reserved for fees",
    );
  });

  it("should test account to UTXO conversion", () => {
    cy.getByTestID("convert_input").clear().type("1").blur();
    cy.getByTestID("button_continue_convert").click();
    cy.getByTestID("button_confirm_convert").should(
      "not.have.attr",
      "disabled",
    );
    cy.getByTestID("button_cancel_convert").click();
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("convert_button").filter(":visible").click();
    cy.getByTestID("convert_input").should("exist");
    cy.getByTestID("convert_input").clear().type("1");
    cy.getByTestID("button_continue_convert").click();

    cy.getByTestID("confirm_title").contains("You are converting to UTXO");
    cy.getByTestID("text_convert_amount").contains("1.00000000");
    cy.getByTestID("resulting_tokens_value").contains("8.99");
    cy.getByTestID("resulting_tokens_sub_value").should("exist");
    cy.getByTestID("resulting_utxo_value")
      .invoke("text")
      .then((text: string) => {
        checkValueWithinRange(text.replace(" UTXO", ""), "10.89", 0.1);
      });
    cy.getByTestID("resulting_utxo_sub_value").should("exist");
    cy.getByTestID("transaction_fee_value").should("exist");
    cy.getByTestID("button_cancel_convert").click();
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("convert_button").filter(":visible").click();
  });

  it("should test UTXO to account conversion", () => {
    cy.getByTestID("button_convert_mode_toggle").click().wait(4000);
    cy.getByTestID("convert_input").clear().type("1");
    cy.getByTestID("button_continue_convert").click();
    cy.getByTestID("button_confirm_convert").should(
      "not.have.attr",
      "disabled",
    );
    cy.getByTestID("button_cancel_convert").click();
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("convert_button").filter(":visible").click();
    cy.getByTestID("button_convert_mode_toggle").click().wait(4000);
    cy.getByTestID("convert_input").clear().type("1");

    cy.getByTestID("button_continue_convert").click();

    cy.getByTestID("confirm_title").contains("You are converting to DFI");
    cy.getByTestID("text_convert_amount").contains("1.00000000");
    cy.getByTestID("resulting_tokens_value").contains("8.90");
    cy.getByTestID("resulting_tokens_sub_value")
      .invoke("text")
      .then((text) => {
        checkValueWithinRange("44.72%", text, 0.1);
      });
    cy.getByTestID("resulting_utxo_value")
      .invoke("text")
      .then((text: string) => {
        checkValueWithinRange(text.replace(" DFI", ""), "11.00", 0.1);
      });
    cy.getByTestID("resulting_utxo_sub_value").contains("55.27%");
    cy.getByTestID("transaction_fee_value").should("exist");
  });
});

// Verified
context("Wallet - Convert UTXO to Account", () => {
  it("should test conversion of UTXO to DFI account from balance screen", () => {
    createDFIWallet();
    cy.getByTestID("convert_input").clear().type("1");
    cy.getByTestID("button_continue_convert").click();
    cy.getByTestID("button_confirm_convert").click().wait(4000);
    cy.closeOceanInterface().wait(5000);
    cy.getByTestID("dfi_total_balance_amount").contains("19.999");
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("dfi_utxo_amount").contains("8.999");
    cy.getByTestID("dfi_token_amount").contains("11.00");
  });

  it("should be able to convert correct amount when user cancel a tx and updated some inputs for UTXO to DFI Account conversion", () => {
    const oldAmount = "1";
    const newAmount = "2";
    createDFIWallet();
    cy.getByTestID("convert_input").clear().type(oldAmount);
    cy.getByTestID("button_continue_convert").click();
    cy.getByTestID("button_confirm_convert").click().wait(2000);
    // Check for authorization page description
    cy.getByTestID("txn_authorization_title").contains(
      `Convert ${new BigNumber(oldAmount).toFixed(8)} UTXO to DFI tokens`,
    );

    // Cancel send on authorisation page
    cy.getByTestID("cancel_authorization").click();
    cy.getByTestID("button_cancel_convert").click();
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("convert_button").filter(":visible").click();

    // Update the input amount
    cy.getByTestID("button_convert_mode_toggle").click().wait(4000);
    cy.getByTestID("convert_input").clear().type(newAmount);
    cy.getByTestID("button_continue_convert").click();
    // Confirm convert
    cy.getByTestID("button_confirm_convert").should(
      "not.have.attr",
      "disabled",
    );
    cy.getByTestID("button_confirm_convert").click();
    // Check for authorization page description
    cy.getByTestID("txn_authorization_title").contains(
      `Convert ${new BigNumber(newAmount).toFixed(8)} UTXO to DFI tokens`,
    );
    cy.closeOceanInterface().wait(5000);
    cy.getByTestID("dfi_total_balance_amount").contains("19.999");
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("dfi_utxo_amount").contains("7.999"); // 20 - 2 - fee
    cy.getByTestID("dfi_token_amount").contains("12");
  });

  it("should test conversion of account UTXO to DFI From Quicklinks", () => {
    createDFIWalletWithTokens();
    cy.getByTestID("convert_action_button").should("exist").click();
    cy.getByTestID("select_DFI (UTXO)").click();
    cy.getByTestID("convert_token_button_TO_display_symbol").should(
      "have.text",
      "DFI",
    );
    cy.getByTestID("convert_input").clear().type("1");
    cy.getByTestID("convert_available_label").contains("Available DFI");
    cy.getByTestID("convert_resulting_label").contains("Resulting DFI");
    cy.getByTestID("convert_available_amount").contains("10.00000000");
    cy.getByTestID("convert_result_amount").contains("11.00000000");
    cy.getByTestID("button_continue_convert").click();
    cy.getByTestID("confirm_title").should(
      "have.text",
      "You are converting to DFI",
    );
    cy.getByTestID("text_convert_amount").contains("1.00000000");
    cy.getByTestID("wallet_address").should("exist");
    cy.getByTestID("transaction_fee_value").should("exist");
    cy.getByTestID("resulting_tokens_value").should(
      "have.text",
      "8.90000000 UTXO",
    ); // to uncomment after fix for bug DFC-324
    cy.getByTestID("resulting_utxo_value").should(
      "have.text",
      "11.00000000 DFI",
    );
    cy.getByTestID("button_confirm_convert").click().wait(4000);

    cy.getByTestID("txn_authorization_title").contains(
      `Convert ${new BigNumber(1).toFixed(8)} UTXO to DFI tokens`,
    );
    cy.closeOceanInterface().wait(5000);
    cy.getByTestID("dfi_total_balance_amount").contains("19.999");
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("dfi_utxo_amount").contains("8.999");
    cy.getByTestID("dfi_token_amount").should("have.text", "11.00000000 DFI");
  });
});

// Verified
context("Wallet - Convert Account to UTXO", () => {
  it("should test conversion of account to UTXO From Balance screen", () => {
    createDFIWallet();
    cy.getByTestID("button_convert_mode_toggle").click().wait(4000);
    cy.getByTestID("convert_input").clear().type("1");
    cy.getByTestID("button_continue_convert").click();
    cy.getByTestID("button_confirm_convert").click().wait(4000);
    cy.closeOceanInterface().wait(5000);
    cy.getByTestID("dfi_total_balance_amount").contains("19.999");
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("dfi_utxo_amount").contains("10.999");
    cy.getByTestID("dfi_token_amount").should("have.text", "9.00000000 DFI");
  });

  it("should be able to convert correct amount when user cancel a tx and updated some inputs for Account DFI to UTXO conversion", () => {
    const oldAmount = "1";
    const newAmount = "2";
    createDFIWallet();
    cy.getByTestID("button_convert_mode_toggle").click().wait(4000);
    cy.getByTestID("convert_input").clear().type(oldAmount);
    cy.getByTestID("button_continue_convert").click();
    cy.getByTestID("button_confirm_convert").should(
      "not.have.attr",
      "disabled",
    );
    cy.getByTestID("button_cancel_convert").click();
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("convert_button").filter(":visible").click();
    cy.getByTestID("convert_input").clear().type(oldAmount);

    cy.getByTestID("button_continue_convert").click();

    cy.getByTestID("button_confirm_convert").click().wait(2000);
    // Check for authorization page description
    cy.getByTestID("txn_authorization_title").should(
      "have.text",
      `Convert ${new BigNumber(oldAmount).toFixed(8)} DFI to UTXO tokens`,
    );
    // Cancel send on authorisation page
    cy.getByTestID("cancel_authorization").click();
    cy.getByTestID("button_cancel_convert").click();
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("convert_button").filter(":visible").click();
    // Update the input amount
    cy.getByTestID("convert_input").clear().type(newAmount);
    cy.getByTestID("button_continue_convert").click();
    // Confirm convert
    cy.getByTestID("button_confirm_convert").should(
      "not.have.attr",
      "disabled",
    );
    cy.getByTestID("button_confirm_convert").click();
    // Check for authorization page description
    cy.getByTestID("txn_authorization_title").should(
      "have.text",
      `Convert ${new BigNumber(newAmount).toFixed(8)} DFI to UTXO tokens`,
    );
    cy.closeOceanInterface().wait(5000);
    cy.getByTestID("dfi_total_balance_amount").contains("19.999");
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("dfi_utxo_amount").contains("11.999"); // 20 + 2 - fee
    cy.getByTestID("dfi_token_amount").should("have.text", "8.00000000 DFI");
  });

  it("should test conversion of account DFI to UTXO From Quicklinks", () => {
    createDFIWalletWithTokens();
    cy.getByTestID("convert_action_button").should("exist").click();
    cy.getByTestID("select_DFI (Token)").click();
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_DFI (UTXO)").click();
    cy.getByTestID("convert_input").clear().type("1");
    cy.getByTestID("convert_available_label").contains("Available UTXO");
    cy.getByTestID("convert_resulting_label").contains("Resulting UTXO");
    cy.getByTestID("convert_available_amount").contains("9.90000000");
    cy.getByTestID("convert_result_amount").contains("10.90000000");
    cy.getByTestID("button_continue_convert").click();
    cy.getByTestID("confirm_title").should(
      "have.text",
      "You are converting to UTXO",
    );
    cy.getByTestID("text_convert_amount").contains("1.00000000");
    cy.getByTestID("wallet_address").should("exist");
    cy.getByTestID("transaction_fee_value").should("exist");
    cy.getByTestID("resulting_tokens_value")
      .should("contain", "8.99")
      .and("contain", "DFI");
    cy.getByTestID("resulting_utxo_value").contains("10.89");
    cy.getByTestID("button_confirm_convert").click().wait(4000);

    cy.getByTestID("txn_authorization_title").should(
      "have.text",
      `Convert ${new BigNumber(1).toFixed(8)} DFI to UTXO tokens`,
    );
    cy.closeOceanInterface().wait(5000);
    cy.getByTestID("dfi_total_balance_amount").contains("19.999");
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("dfi_utxo_amount").contains("10.999");
    cy.getByTestID("dfi_token_amount").should("have.text", "9.00000000 DFI");
  });
});

// Verified
context("Wallet - Convert DFI Convert Quick links", () => {
  before(() => {
    createDFIWalletWithTokens();
    convertDFIEVMToDVM();
  });

  it("should have form validation using convert Quicklink DFI DVM to EVM", () => {
    cy.getByTestID("domain_switch_DVM").should("exist");
    cy.getByTestID("convert_action_button").should("exist").click();
    cy.getByTestID("search_input").clear().type("DFI");
    cy.getByTestID("DFI (Token)_symbol").click();
    cy.getByTestID("button_continue_convert").should(
      "have.attr",
      "aria-disabled",
    );
    cy.getByTestID("source_balance").should(
      "have.text",
      "I HAVE 5.00000000 DFI",
    );
    cy.getByTestID("token_select_button_FROM_display_symbol").should(
      "have.text",
      "DFI",
    );
    cy.getByTestID("token_select_button_TO").contains("Token");
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("search_input").clear().type("DFI");
    cy.getByTestID("DFI_name").contains("DeFiChain for EVM").click();
    cy.getByTestID("token_select_button_TO_display_symbol").contains("DFI");
    cy.getByTestID("token_select_button_TO")
      .children()
      .first()
      .should("have.attr", "style")
      .and("include", "linear-gradient");
    cy.getByTestID("convert_input").type("1").clear();
    cy.getByTestID("button_continue_convert").should(
      "have.attr",
      "aria-disabled",
    );
    cy.getByTestID("convert_input").type("1");
    validateConvertResult("DFI (EVM)", 5.0, 6.0);
    cy.getByTestID("button_continue_convert").should(
      "not.have.attr",
      "disabled",
    );
  });

  it("should test amount buttons when DFI DVM to EVM conversion", () => {
    cy.getByTestID("25%_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "1.25000000");
    validateConvertResult("DFI", 5.0, 6.25);
    cy.getByTestID("50%_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "2.50000000");
    validateConvertResult("DFI", 5.0, 7.5);
    cy.getByTestID("75%_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "3.75000000");
    validateConvertResult("DFI", 5.0, 8.75);
    cy.getByTestID("MAX_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "5.00000000");
    validateConvertResult("DFI", 5.0, 10.0);
  });

  it("should swap conversion DFI EVM to DVM", () => {
    cy.getByTestID("button_convert_mode_toggle").click().wait(4000);
    cy.getByTestID("source_balance").should(
      "have.text",
      "I HAVE 5.00000000 DFI (EVM)",
    );
    cy.getByTestID("token_select_button_FROM_display_symbol").should(
      "have.text",
      "DFI",
    );
    cy.getByTestID("token_select_button_FROM")
      .children()
      .first()
      .should("have.attr", "style")
      .and("include", "linear-gradient");
    cy.getByTestID("convert_token_button_TO_display_symbol").should(
      "have.text",
      "DFI",
    );
    cy.getByTestID("button_continue_convert").should(
      "not.have.attr",
      "disabled",
    );
  });

  it("should have form validation using convert Quicklink DFI EVM to DVM", () => {
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("domain_switch_DVM").should("exist").click();
    cy.getByTestID("convert_action_button").click();
    cy.getByTestID("search_input").clear().type("DFI");
    cy.getByTestID("select_DFI").click();
    cy.getByTestID("button_continue_convert").should(
      "have.attr",
      "aria-disabled",
    );
    cy.getByTestID("source_balance").should(
      "have.text",
      "I HAVE 5.00000000 DFI (EVM)",
    );
    cy.getByTestID("token_select_button_FROM_display_symbol").should(
      "have.text",
      "DFI",
    );
    cy.getByTestID("convert_token_button_TO_display_symbol").contains("DFI");
    cy.getByTestID("token_select_button_FROM")
      .children()
      .first()
      .should("have.attr", "style")
      .and("include", "linear-gradient");
    cy.getByTestID("convert_input").type("1").clear();
    cy.getByTestID("button_continue_convert").should(
      "have.attr",
      "aria-disabled",
    );
    cy.getByTestID("convert_input").type("1");
    validateConvertResult("DFI", 5.0, 6.0);
    cy.getByTestID("button_continue_convert").should(
      "not.have.attr",
      "disabled",
    );
  });

  it("should test amount buttons when DFI EVM to DVM conversion", () => {
    cy.getByTestID("25%_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "1.25000000");
    validateConvertResult("DFI", 5.0, 6.25);
    cy.getByTestID("50%_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "2.50000000");
    validateConvertResult("DFI", 5.0, 7.5);
    cy.getByTestID("75%_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "3.75000000");
    validateConvertResult("DFI", 5.0, 8.75);
    cy.getByTestID("MAX_amount_button").click();
    cy.getByTestID("convert_input").should("have.value", "5.00000000");
    validateConvertResult("DFI", 5.0, 10.0);
  });

  it("should swap conversion DFI EVM to DVM", () => {
    cy.getByTestID("button_convert_mode_toggle").click().wait(4000);
    cy.getByTestID("source_balance").should(
      "have.text",
      "I HAVE 5.00000000 DFI",
    );
    cy.getByTestID("token_select_button_FROM_display_symbol").should(
      "have.text",
      "DFI",
    );
    cy.getByTestID("token_select_button_TO_display_symbol").should(
      "have.text",
      "DFI",
    );
    cy.getByTestID("convert_input").clear().type("1");
    cy.getByTestID("button_continue_convert").should(
      "not.have.attr",
      "disabled",
    );
  });
});

context("Wallet - Convert tokens EVM <> DVM", () => {
  it("should convert DFI DVM - EVM via Quick Links in DVM Network", () => {
    createDFIWalletWithTokens();
    cy.getByTestID("domain_switch_DVM").should("exist");
    cy.getByTestID("convert_action_button").should("exist").click();
    cy.getByTestID("search_input").clear().type("DFI");
    cy.getByTestID("DFI (Token)_symbol").click();
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("search_input").clear().type("DFI");
    cy.getByTestID("DFI_name").contains("DeFiChain for EVM").click();
    cy.getByTestID("source_balance").contains(10);
    cy.getByTestID("convert_available_label").contains("Available DFI (EVM)");
    cy.getByTestID("convert_resulting_label").contains("Resulting DFI (EVM)");
    cy.getByTestID("convert_available_amount").contains("0.00000000"); // to update the value
    cy.getByTestID("convert_result_amount").contains("-");
    cy.getByTestID("convert_input").clear().type("1");
    validateConvertResult("DFI", 0.0, 1.0);
    cy.getByTestID("button_continue_convert").click();
    cy.getByTestID("confirm_title").should(
      "have.text",
      "You are converting to DFI (EVM)",
    );
    cy.getByTestID("text_convert_amount").should("have.text", "1.00000000");
    cy.getByTestID("wallet_address").should("exist");
    cy.getByTestID("transaction_fee_value").should("exist");
    cy.getByTestID("resulting_tokens_value").should(
      "have.text",
      "9.00000000 DFI",
    );
    cy.getByTestID("resulting_utxo_value").should(
      "have.text",
      "1.00000000 DFI (EVM)",
    );
    cy.getByTestID("button_confirm_convert").click();
    cy.getByTestID("txn_authorization_title").should(
      "have.text",
      `Convert ${new BigNumber(1).toFixed(8)} DFI to DFI (EVM) tokens`,
    );
    cy.closeOceanInterface().wait(5000);

    cy.getByTestID("dfi_total_balance_amount").contains("18.99");
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("dfi_utxo_amount").contains("9.99");
    cy.getByTestID("dfi_token_amount").contains("9.00");
    cy.go("back");
    cy.getByTestID("domain_switch_DVM").click();
    cy.getByTestID("dfi_total_balance_amount").contains("1.00000000");
    cy.getByTestID("dfi_balance_card").should("exist").click();

    cy.getByTestID("token_detail_amount").contains("1.00000000");
  });

  it("should convert DFI EVM - DVM via Quick Links in EVM Network", () => {
    createDFIWalletWithTokens();
    convertDFIEVMToDVM();
    cy.getByTestID("domain_switch_DVM").should("exist");
    cy.getByTestID("domain_switch_DVM").click();
    cy.getByTestID("convert_action_button").should("exist").click();
    cy.getByTestID("search_input").clear().type("DFI");
    cy.getByTestID("select_DFI").contains("DeFiChain for EVM").click();
    cy.getByTestID("token_select_button_FROM")
      .children()
      .first()
      .should("have.attr", "style")
      .and("include", "linear-gradient");
    cy.getByTestID("token_select_button_FROM_display_symbol").contains("DFI");
    cy.getByTestID("convert_token_button_TO_display_symbol").contains("DFI");
    cy.getByTestID("source_balance").contains("I HAVE 5.00000000 DFI (EVM)");
    cy.getByTestID("convert_available_label").contains("Available DFI");
    cy.getByTestID("convert_resulting_label").contains("Resulting DFI");
    cy.getByTestID("convert_available_amount").contains("5.00000000");
    cy.getByTestID("convert_result_amount").contains("-");
    cy.getByTestID("convert_input").clear().type("1");
    validateConvertResult("DFI", 5.0, 6.0);
    cy.getByTestID("button_continue_convert").click();
    cy.getByTestID("confirm_title").should(
      "have.text",
      "You are converting to DFI",
    );
    cy.getByTestID("text_convert_amount").should("have.text", "1.00000000");
    cy.getByTestID("wallet_address").should("exist");
    cy.getByTestID("transaction_fee_value").should("exist");
    cy.getByTestID("resulting_tokens_value").should(
      "have.text",
      "4.00000000 DFI (EVM)",
    );
    cy.getByTestID("resulting_utxo_value").should(
      "have.text",
      "6.00000000 DFI",
    );
    cy.getByTestID("button_confirm_convert").click();
    cy.getByTestID("txn_authorization_title").should(
      "have.text",
      `Convert ${new BigNumber(1).toFixed(8)} DFI (EVM) to DFI tokens`,
    );
    cy.closeOceanInterface().wait(5000);
    cy.getByTestID("dfi_total_balance_amount").contains("4.000");
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("token_detail_amount").should("have.text", "4.00000000");

    cy.go("back");
    cy.getByTestID("domain_switch_EVM").click();
    cy.getByTestID("dfi_total_balance_amount").contains("15.99");
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("token_detail_amount").contains("15.99");
    cy.getByTestID("dfi_utxo_amount")
      .should("contain", "9.99")
      .and("contain", "DFI");
    cy.getByTestID("dfi_token_amount").should("have.text", "6.00000000 DFI");
  });

  it("should convert DFI DVM - EVM via Balance in DVM Network", () => {
    createDFIWallet();
    cy.getByTestID("button_convert_mode_toggle").click();
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("DFI_name").contains("DeFiChain for EVM").click();
    cy.getByTestID("token_select_button_TO")
      .filter(":visible")
      .children()
      .first()
      .should("have.attr", "style")
      .and("include", "linear-gradient");
    cy.getByTestID("source_balance").contains(10);
    cy.getByTestID("token_select_button_FROM_display_symbol").contains("DFI");
    cy.getByTestID("token_select_button_TO_display_symbol").contains("DFI");
    cy.getByTestID("convert_available_label").contains("Available DFI (EVM)");
    cy.getByTestID("convert_resulting_label").contains("Resulting DFI (EVM)");
    cy.getByTestID("convert_available_amount").contains("0.00000000");
    cy.getByTestID("convert_result_amount").contains("-");
    cy.getByTestID("convert_input")
      .filter(":visible")
      .clear()
      .type("0.00000009");
    cy.getByTestID("convert_available_label").contains("Available DFI (EVM)");
    cy.getByTestID("convert_resulting_label").contains("Resulting DFI (EVM)");
    cy.getByTestID("convert_available_amount")
      .filter(":visible")
      .should("have.text", "0.00000000");
    cy.getByTestID("convert_result_amount")
      .filter(":visible")
      .should("have.text", "0.00000009");
    cy.getByTestID("button_continue_convert").eq(1).click();
    cy.getByTestID("confirm_title").contains("You are converting to DFI (EVM)");
    cy.getByTestID("text_convert_amount").contains("0.00000009");
    cy.getByTestID("wallet_address").should("exist");
    cy.getByTestID("transaction_fee_value").should("exist");
    cy.getByTestID("resulting_tokens_value").contains("9.99999991 DFI");
    cy.getByTestID("resulting_utxo_value").contains("0.00000009 DFI (EVM)");
    cy.getByTestID("button_confirm_convert").click();
    cy.getByTestID("txn_authorization_title").contains(
      `Convert ${new BigNumber(0.00000009).toFixed(8)} DFI to DFI (EVM)`,
    );
    cy.closeOceanInterface().wait(5000);
    cy.getByTestID("dfi_total_balance_amount").contains("19.99");
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("token_detail_amount").contains("19.99");
    cy.getByTestID("dfi_utxo_amount")
      .should("contain", "9.99")
      .and("contain", "DFI");
    cy.getByTestID("dfi_token_amount")
      .should("contain", "9.99")
      .and("contain", "DFI");
    cy.go("back");
    cy.getByTestID("domain_switch_DVM").click();
    cy.getByTestID("dfi_total_balance_amount").contains("0.00000009");
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("token_detail_amount").should("have.text", "0.00000009");
  });

  it("should convert DFI EVM - DVM via Balance in EVM Network", () => {
    createDFIWalletWithTokens();
    convertDFIEVMToDVM();
    cy.getByTestID("domain_switch_DVM").should("exist").click();
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("convert_button").should("exist").click();
    cy.getByTestID("token_select_button_FROM")
      .children()
      .first()
      .should("have.attr", "style")
      .and("include", "linear-gradient");
    cy.getByTestID("token_select_button_FROM_display_symbol").contains("DFI");
    cy.getByTestID("convert_token_button_TO_display_symbol").contains("DFI");
    cy.getByTestID("source_balance").contains("I HAVE 5.00000000 DFI (EVM)");
    cy.getByTestID("convert_available_label").contains("Available DFI");
    cy.getByTestID("convert_resulting_label").contains("Resulting DFI");
    cy.getByTestID("convert_available_amount").contains("5.00000000");
    cy.getByTestID("convert_result_amount").contains("-");
    cy.getByTestID("convert_input").clear().type("1.12345678");
    validateConvertResult("DFI", 5.0, 6.12345678);
    cy.getByTestID("button_continue_convert").click();
    cy.getByTestID("confirm_title").should(
      "have.text",
      "You are converting to DFI",
    );
    cy.getByTestID("text_convert_amount").should("have.text", "1.12345678");
    cy.getByTestID("wallet_address").should("exist");
    cy.getByTestID("transaction_fee_value").should("exist");
    cy.getByTestID("resulting_tokens_value").contains("3.87");
    cy.getByTestID("resulting_utxo_value").should(
      "have.text",
      "6.12345678 DFI",
    );
    cy.getByTestID("button_confirm_convert").click();
    cy.getByTestID("txn_authorization_title").should(
      "have.text",
      `Convert ${new BigNumber(1.12345678).toFixed(8)} DFI (EVM) to DFI tokens`,
    );
    cy.closeOceanInterface().wait(5000);
    cy.getByTestID("dfi_total_balance_amount").contains("3.87");
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("token_detail_amount").should("have.text", "3.87654322");

    cy.go("back");
    cy.getByTestID("domain_switch_EVM").click();
    cy.getByTestID("dfi_total_balance_amount").contains("16.123");
    cy.getByTestID("dfi_balance_card").should("exist").click();
    cy.getByTestID("token_detail_amount").contains("16.123");
    cy.getByTestID("dfi_utxo_amount")
      .should("contain", "9.99")
      .and("contain", "DFI");
    cy.getByTestID("dfi_token_amount").should("have.text", "6.12345678 DFI");
  });
});
