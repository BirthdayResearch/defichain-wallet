import { checkValueWithinRange } from "../../../../support/walletCommands";

context("Wallet - Loans - Unloop", () => {
  function addCollaterals() {
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(["BTC", "DUSD"])
      .wait(6000);
    cy.setWalletTheme({ isDark: false });
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.getByTestID("empty_vault").should("exist");
    cy.createVault(0);
    cy.getByTestID("vault_card_0_borrow_button").should("not.exist");
    cy.getByTestID("vault_card_0_EMPTY_add_collateral_button").click();
    cy.addCollateral("10", "DFI");
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("action_add").click();
    cy.addCollateral("10", "dBTC");
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("action_add").click();
    cy.addCollateral("10", "DUSD");
    cy.getByTestID("vault_card_0_status").contains("Ready");
    cy.getByTestID("vault_card_0_collateral_token_group_DFI").should("exist");
    cy.getByTestID("vault_card_0_collateral_token_group_dBTC").should("exist");
    cy.getByTestID("vault_card_0_collateral_token_group_DUSD").should("exist");
    cy.getByTestID("vault_card_0_total_collateral_amount").contains(
      "$1,512.00"
    );
  }

  function takeDUSDLoan() {
    cy.getByTestID("vault_card_0_borrow_button").contains("Borrow").click();
    cy.getByTestID("select_DUSD").click();
    cy.getByTestID("text_input_borrow_amount").type("100").blur();
    cy.getByTestID("borrow_amount_in_usd").contains("$100.00");
    cy.getByTestID("borrow_transaction_detail_col_ratio").contains("1,512.00%");
    cy.getByTestID("borrow_button_submit").click();
    // Confirm borrow screen
    cy.getByTestID("confirm_title").contains("You are borrowing");
    cy.getByTestID("text_borrow_amount").contains("100.00000000");
    cy.getByTestID("transaction_fee_value").should("exist");
    cy.getByTestID("col_ratio_value").contains("1,512.00");
    cy.getByTestID("tokens_to_borrow").contains("100 DUSD");
    cy.getByTestID("tokens_to_borrow_rhsUsdAmount").contains("$100.00");
    cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
    cy.getByTestID("txn_authorization_title").contains(
      "Borrowing 100.00000000 DUSD"
    );
    cy.closeOceanInterface();
  }

  context("Wallet - Loans - Unloop with disabled feature flag", () => {
    before(() => {
      cy.blockAllFeatureFlag();
      addCollaterals();
      takeDUSDLoan();
    });

    it("should not have PAYBACK WITH DUSD COLLATERAL btn when feature flags is disabled", () => {
      cy.getByTestID("vault_card_0").should("exist").click();
      cy.getByTestID("payback_using_DUSD_collateral").should("not.exist");
    });
  });

  context("Wallet - Loans - Unloop with enabled feature flag", () => {
    before(() => {
      cy.setFeatureFlags(["unloop_dusd"]);
      addCollaterals();
      takeDUSDLoan();
    });

    it("should have payback with DUSD collateral btn", () => {
      cy.getByTestID("vault_card_0").should("exist").click();
      cy.getByTestID("payback_using_DUSD_collateral").should("exist");
    });

    it("should able to payback partial DUSD loan with DUSD collateral", () => {
      cy.getByTestID("payback_using_DUSD_collateral").should("exist").click();
      cy.getByTestID("payback_loan_title").contains(
        "I WANT TO PAY WITH DUSD COLLATERAL"
      );
      cy.getByTestID("payback_input_text").contains("10.00000000");
      cy.getByTestID("payback_input_value").contains("$12.00");
      cy.getByTestID("token_select_button_loan_token_symbol").contains("DUSD");
      cy.getByTestID("total_outstanding_loan_value").should("exist");
      cy.getByTestID("resulting_collateral_amount").contains("0.00000000 DUSD");
      cy.getByTestID("text_resulting_col_ratio_col_ratio").contains("1,704");
      cy.getByTestID("continue_payback_loan_message").contains(
        "Use your DUSD collaterals to fully pay off your DUSD loan."
      );
      cy.getByTestID("button_confirm_payback_loan_continue")
        .should("exist")
        .click();
      // Confirm payback loan
      cy.getByTestID("confirm_title").contains("You are paying");
      cy.getByTestID("text_send_amount").contains("10.00000000");
      cy.getByTestID("tokens_to_pay").contains("10.00000000 DUSD");
      cy.getByTestID("resulting_loan_amount")
        .invoke("text")
        .then((text: string) => {
          checkValueWithinRange(text.replace(" DUSD", ""), "90", 0.1);
        });
      cy.getByTestID("confirm_payback_loan_message").contains(
        "Prices may vary during transaction confirmation."
      );
      cy.getByTestID("button_confirm_payback_loan")
        .should("exist")
        .contains("Payback loan")
        .click();
      cy.wait(2000);
      cy.closeOceanInterface();
      cy.getByTestID("vault_card_0").should("exist").click();
      cy.getByTestID("payback_using_DUSD_collateral").should("not.exist");
      cy.getByTestID("loan_card_DUSD_amount")
        .invoke("text")
        .then((text: string) => {
          const amountToPay = text.replace(" DUSD", "");
          checkValueWithinRange(amountToPay, "90", 0.1);
        });
    });

    it("should able to payback full DUSD loan with DUSD collateral", () => {
      cy.sendTokenToWallet(Array(10).fill("DUSD")).wait(6000);
      cy.go("back");
      cy.getByTestID("vault_card_0").click();
      cy.getByTestID("action_add").click();
      cy.addCollateral("100", "DUSD");
      cy.getByTestID("vault_card_0").should("exist").click();
      cy.getByTestID("loan_card_DUSD_amount")
        .invoke("text")
        .then((textValue: string) => {
          const amountToPay = textValue.replace(" DUSD", "");
          cy.getByTestID("payback_using_DUSD_collateral").click();
          cy.getByTestID("payback_input_text").contains(amountToPay);
          cy.getByTestID("total_outstanding_loan_value").contains(
            "0.00000000 DUSD"
          );
          cy.getByTestID("continue_payback_loan_message").contains(
            "Use your DUSD collaterals to fully pay off your DUSD loan."
          );
          cy.getByTestID("button_confirm_payback_loan_continue").click();
          cy.getByTestID("button_confirm_payback_loan")
            .should("exist")
            .contains("Payback loan")
            .click();
          cy.closeOceanInterface();
          cy.getByTestID("vault_card_0").should("exist").click();
          cy.getByTestID("vault_detail_loans_section").should("not.exist");
        });
    });

    it("should not have DUSD payback btn on non DUSD loans", () => {
      cy.go("back");
      cy.getByTestID("vault_card_0_borrow_button").click();
      cy.takeLoan("10", "dTS25");
      cy.getByTestID("vault_card_0").should("exist").click();
      cy.getByTestID("vault_detail_loans_section").should("exist");
      cy.getByTestID("payback_using_DUSD_collateral").should("not.exist");
    });
  });
});
