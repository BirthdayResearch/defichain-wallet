import { VaultStatus } from "../../../../../app/screens/AppNavigator/screens/Loans/VaultStatusTypes";
import {
  checkVaultDetailValues,
  checkValueWithinRange,
} from "../../../../support/utils";

context("Wallet - Loans - Take Loans", { testIsolation: false }, () => {
  let vaultId = "";
  before(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(["BTC"])
      .wait(6000);
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.createVault(0);
    cy.getByTestID("vault_card_0_EMPTY_vault").should("exist");
  });

  it("should add collateral", () => {
    cy.getByTestID("vault_card_0_EMPTY_add_collateral_button").should("exist");
    cy.getByTestID("vault_card_0_EMPTY_vault_id").then(($txt: any) => {
      vaultId = $txt[0].textContent;
    });
    cy.getByTestID("vault_card_0_EMPTY_vault").click();
    cy.getByTestID("action_add").click();
    cy.addCollateral("10", "DFI");
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("action_add").click();
    cy.addCollateral("10", "dBTC");
  });

  it("should verify vault card after adding collateral", () => {
    cy.getByTestID("vault_card_0_status").contains("Ready");
    cy.getByTestID("vault_card_0_collateral_token_group_DFI").should("exist");
    cy.getByTestID("vault_card_0_collateral_token_group_dBTC").should("exist");
    cy.getByTestID("vault_card_0_max_loan_amount")
      .invoke("text")
      .then((text) => {
        checkValueWithinRange("1000.00", text.replace("$", ""));
      });
    cy.getByTestID("vault_card_0_total_collateral_amount").contains(
      "$1,500.00",
    );
  });

  it("should hide loan token lists when clicking on search input", () => {
    cy.getByTestID("vault_card_0_status").contains("Ready");
    cy.getByTestID("loans_tabs_BORROW").click();
    cy.getByTestID("loan_search_input").should("exist").click();
    cy.getByTestID("loan_card_token_lists").should("not.exist");
    cy.getByTestID("empty_search_result_text").should("exist");
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
  });

  it("should show the correct token on search input", () => {
    cy.getByTestID("vault_card_0_status").contains("Ready");
    cy.getByTestID("loans_tabs_BORROW").click();
    cy.getByTestID("loan_search_input").clear().type("dTS25").wait(1000);
    cy.getByTestID("loan_card_dTS25").should("exist");
    cy.getByTestID("loan_card_dTR50").should("not.exist");
    cy.getByTestID("loan_card_DUSD").should("not.exist");
    cy.getByTestID("loan_search_input").clear().type("DUSD").wait(1000);
    cy.getByTestID("loan_card_DUSD").should("exist");
    cy.getByTestID("loan_card_dTS25").should("not.exist");
    cy.getByTestID("loan_card_dTD10").should("not.exist");
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
  });

  it("should show borrow button and search token input if vault status equal Ready ", () => {
    cy.getByTestID("vault_card_0_status").contains("Ready");
    cy.getByTestID("loans_tabs_BORROW").click();
    cy.getByTestID("loan_search_input").should("exist").clear();
    cy.getByTestID("loan_card_dTS25").should("exist");
    cy.getByTestID(
      "loans_action_button_dTS25_borrow_button_loan_screen",
    ).should("exist");
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
  });

  it("should show borrow button and search token input if vault status equal Ready ", () => {
    cy.getByTestID("vault_card_0_status").contains("Ready");
    cy.getByTestID("loans_tabs_BORROW").click();
    cy.getByTestID("loan_search_input").should("exist").clear();
    cy.getByTestID("loan_card_dTS25").should("exist");
    cy.getByTestID(
      "loans_action_button_dTS25_borrow_button_loan_screen",
    ).should("exist");
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
  });

  it("should hide loan token lists when clicking on search input on vault borrow token screen", () => {
    cy.getByTestID("loans_tabs_BORROW").click();
    cy.getByTestID("loan_search_input").should("exist").click();
    cy.getByTestID("loan_card_token_lists").should("not.exist");
    cy.getByTestID("empty_search_result_text").should("exist");
    cy.getByTestID("bottom_tab_loans").click();
  });

  it("should show collaterals token group", () => {
    cy.getByTestID("vault_card_0_collateral_token_group_DFI").should("exist");
    cy.getByTestID("vault_card_0_collateral_token_group_dBTC").should("exist");
  });

  it("should show correct token on browse loan token screen on active vault on search", () => {
    cy.getByTestID("loan_search_input").type("dTS25").wait(1000);
    cy.getByTestID("loan_card_dTS25").should("exist");
    cy.getByTestID("loan_card_DUSD").should("not.exist");
    cy.getByTestID("loan_card_dTR50").should("not.exist");
    cy.getByTestID("loan_search_input").clear().type("dTR50").wait(1000);
    cy.getByTestID("loan_card_dTR50").should("exist");
    cy.getByTestID("loan_card_dTS25").should("not.exist");
    cy.getByTestID("loan_card_DUSD").should("not.exist");
    cy.getByTestID("loan_search_input").clear().blur().wait(1000);
  });

  it("should borrow loan inside vault details screen", () => {
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.getByTestID("vault_card_0").click();
    checkVaultDetailValues(
      vaultId,
      "$1,500.00",
      "$1,000.00",
      "$0.00",
      "5",
      "150",
      "Ready",
    );
    cy.getByTestID("action_borrow").click();
    cy.getByTestID("select_DUSD").click();
    cy.getByTestID("text_input_borrow_amount").type("1000").blur();
    cy.getByTestID("borrow_amount_in_usd").contains("$1,000.00");
    cy.getByTestID("vault_liquidation_error")
      .should("be.visible")
      .contains("Amount entered will result in vault liquidation");
    cy.getByTestID("borrow_transaction_detail_col_ratio")
      .invoke("text")
      .then((text) => {
        checkValueWithinRange("150.00", text, 0.1);
      });
    cy.getByTestID("borrow_button_submit").should("have.attr", "aria-disabled");
    cy.getByTestID("text_input_borrow_amount").clear().type("100").blur();
    cy.getByTestID("borrow_amount_in_usd").contains("$100.00");
    cy.getByTestID("borrow_transaction_detail_col_ratio")
      .invoke("text")
      .then((text) => {
        checkValueWithinRange("1,500.00", text, 0.1);
      });
    cy.getByTestID("borrow_button_submit").click();
    // Confirm borrow screen
    cy.getByTestID("confirm_title").contains("You are borrowing");
    cy.getByTestID("text_borrow_amount").contains("100.00000000");
    cy.getByTestID("transaction_fee_value").should("exist");
    cy.getByTestID("vault_id_value").contains(vaultId);
    cy.getByTestID("col_ratio_value")
      .invoke("text")
      .then((text) => {
        checkValueWithinRange("1,500.00", text, 0.1);
      });
    cy.getByTestID("estimated_annual_interest")
      .invoke("text")
      .then((text) => {
        checkValueWithinRange("5.00000000", text.replace(" DUSD", ""), 0.1);
      });
    cy.getByTestID("tokens_to_borrow").contains("100 DUSD");
    cy.getByTestID("tokens_to_borrow_rhsUsdAmount").contains("$100.00");
    cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
    cy.getByTestID("txn_authorization_title").contains(
      "Borrowing 100.00000000 DUSD",
    );
    cy.closeOceanInterface();
  });

  it("should verify vault card", () => {
    cy.checkVaultStatusColor(VaultStatus.Healthy, "vault_card_0_min_ratio");
    cy.getByTestID("vault_card_0_min_ratio")
      .invoke("text")
      .then((text) => {
        checkValueWithinRange("1.50", text.replace("K %", ""), 0.1);
      });
    cy.getByTestID("vault_card_0_max_loan_amount").should("exist");
    cy.getByTestID("vault_card_0_total_collateral_amount").contains(
      "$1,500.00",
    );
  });

  it("should borrow more loan from vault card", () => {
    cy.getByTestID("vault_card_0_borrow_button").contains("Borrow").click();
    cy.getByTestID("select_DUSD").click();
    cy.getByTestID("borrow_transaction_detail_col_ratio")
      .invoke("text")
      .then((text) => {
        const loanVal = text.replace("%", "").trim();
        checkValueWithinRange(loanVal, "1,499.99", 1);
      });
    cy.getByTestID("text_input_borrow_amount").type("1000").blur();
    cy.getByTestID("borrow_amount_in_usd").contains("$1,000.00");
    cy.getByTestID("vault_liquidation_error")
      .should("be.visible")
      .contains("Amount entered will result in vault liquidation");
    cy.getByTestID("borrow_transaction_detail_col_ratio").contains("136");
    cy.getByTestID("borrow_button_submit").should("have.attr", "aria-disabled");
    cy.getByTestID("text_input_borrow_amount").clear().type("648").blur();
    cy.getByTestID("borrow_transaction_detail_col_ratio").contains("200");
    cy.getByTestID("borrow_button_submit").click();
    // Confirm borrow screen
    cy.getByTestID("confirm_title").contains("You are borrowing");
    cy.getByTestID("text_borrow_amount").contains("648.00000000");
    cy.getByTestID("transaction_fee_value").should("exist");
    cy.getByTestID("vault_id_value").contains(vaultId);
    cy.getByTestID("col_ratio_value").contains("200");
    cy.getByTestID("tokens_to_borrow").contains("648 DUSD");
    cy.getByTestID("tokens_to_borrow_rhsUsdAmount").contains("$648.00");
    cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
    cy.getByTestID("txn_authorization_title").contains(
      "Borrowing 648.00000000 DUSD",
    );
    cy.closeOceanInterface();
  });

  it("should verify vault card after adding loans", () => {
    cy.checkVaultStatusColor(VaultStatus.AtRisk, "vault_card_0_min_ratio");
    cy.getByTestID("vault_card_0_min_ratio").contains("200.53%");
    cy.getByTestID("vault_card_0_max_loan_amount").should("exist");
    cy.getByTestID("vault_card_0_total_collateral_amount").contains(
      "$1,500.00",
    );
  });

  it("should borrow another loan token from Loans tab", () => {
    cy.getByTestID("loans_tabs_BORROW").click();
    cy.getByTestID(
      "loans_action_button_dTS25_borrow_button_loan_screen",
    ).click();
    cy.getByTestID("select_vault_0").click();
    cy.getByTestID("text_input_borrow_amount").type("4.5").blur();
    cy.getByTestID("borrow_amount_in_usd")
      .invoke("text")
      .then((text) => {
        const value = text.replace("$", "").trim();
        checkValueWithinRange(value, "112.50", 1);
      });
    cy.getByTestID("borrow_transaction_detail_col_ratio")
      .invoke("text")
      .then((text) => {
        const value = text.replace("%", "").trim();
        checkValueWithinRange(value, "174", 2);
      });
    cy.getByTestID("borrow_button_submit").click();
    cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
    cy.getByTestID("txn_authorization_title").contains(
      "Borrowing 4.50000000 dTS25",
    );
    cy.closeOceanInterface().wait(5000);
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.checkVaultStatusColor(
      VaultStatus.NearLiquidation,
      "vault_card_0_min_ratio",
    );
    cy.getByTestID("vault_card_0_min_ratio").contains("174");
    cy.getByTestID("vault_card_0_max_loan_amount")
      .invoke("text")
      .then((text) => {
        const value = text.replace("%", "").trim();
        checkValueWithinRange(value, "139.46", 1);
      });
    cy.getByTestID("vault_card_0_total_collateral_amount").contains(
      "$1,500.00",
    );
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("loan_card_DUSD").should("exist");
    cy.getByTestID("loan_card_dTS25").should("exist");
  });
});
