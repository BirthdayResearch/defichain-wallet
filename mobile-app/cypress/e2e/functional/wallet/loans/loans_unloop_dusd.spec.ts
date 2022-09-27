import BigNumber from "bignumber.js";
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
    cy.getByTestID("vault_card_0_manage_loans_button").should("not.exist");
    cy.getByTestID("vault_card_0_edit_collaterals_button").click();
    cy.addCollateral("10", "DFI");
    cy.addCollateral("10", "dBTC");
    cy.addCollateral("10", "DUSD");
    cy.go("back");
    cy.wait(2000);
    cy.getByTestID("vault_card_0_status").contains("READY");
    cy.getByTestID("vault_card_0_collateral_token_group_DFI").should("exist");
    cy.getByTestID("vault_card_0_collateral_token_group_dBTC").should("exist");
    cy.getByTestID("vault_card_0_collateral_token_group_DUSD").should("exist");
    cy.getByTestID("vault_card_0_total_collateral").contains("$1,509.90");
  }

  function takeDUSDLoan() {
    let annualInterest: string;
    cy.getByTestID("vault_card_0_manage_loans_button").click();
    cy.getByTestID("button_browse_loans").click();
    cy.getByTestID("loans_action_button_DUSD_borrow_button").click();
    cy.getByTestID("form_input_borrow").clear().type("100").blur();
    cy.wait(3000);
    cy.getByTestID("text_input_usd_value").should("have.value", "100.00");
    cy.getByTestID("text_resulting_col_ratio").contains("1,509.90%");
    cy.getByTestID("text_estimated_annual_interest").then(($txt: any) => {
      annualInterest = $txt[0].textContent
        .replace(" DUSD", "")
        .replace(",", "");
    });
    cy.getByTestID("text_total_loan_with_annual_interest").then(($txt: any) => {
      const totalLoanWithAnnualInterest = $txt[0].textContent
        .replace(" DUSD", "")
        .replace(",", "");
      expect(new BigNumber(totalLoanWithAnnualInterest).toFixed(8)).to.be.equal(
        new BigNumber("100").plus(annualInterest).toFixed(8)
      );
    });
    cy.getByTestID("borrow_loan_submit_button").click();
    cy.getByTestID("text_borrow_amount").contains("100.00000000");
    cy.getByTestID("text_borrow_amount_suffix").contains("DUSD");
    cy.getByTestID("text_transaction_type").contains("Borrow loan token");
    cy.getByTestID("tokens_to_borrow").contains("100.00000000");
    cy.getByTestID("tokens_to_borrow_suffix").contains("DUSD");
    cy.getByTestID("text_collateral_amount").contains("1,509.90");
    cy.getByTestID("text_current_collateral_ratio").contains("N/A");
    cy.getByTestID("text_resulting_col_ratio").contains("1,509.90");
    cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
    cy.getByTestID("txn_authorization_description").contains(
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
      cy.getByTestID("vault_card_0_manage_loans_button")
        .should("exist")
        .click();
      cy.getByTestID("loan_card_DUSD_payback_dusd_loan").should("not.exist");
    });
  });

  context("Wallet - Loans - Unloop with enabled feature flag", () => {
    before(() => {
      cy.setFeatureFlags(["unloop_dusd"]);
      addCollaterals();
      takeDUSDLoan();
    });

    it("should have payback with DUSD collateral btn", () => {
      cy.getByTestID("vault_card_0_manage_loans_button")
        .should("exist")
        .click();
      cy.getByTestID("loan_card_DUSD_payback_dusd_loan").should("exist");
    });

    it("should able to payback partial DUSD loan with DUSD collateral", () => {
      cy.getByTestID("loan_card_DUSD_payback_dusd_loan")
        .should("exist")
        .click();
      cy.getByTestID("dusd_payback_amount").contains("10.00000000 DUSD");
      cy.getByTestID("dusd_payback_value").contains("≈ $10.00");
      cy.getByTestID("button_confirm_payback_loan_continue")
        .should("exist")
        .click();
      cy.closeOceanInterface();
      cy.getByTestID("vault_card_0_manage_loans_button")
        .should("exist")
        .click();
      cy.getByTestID("loan_card_DUSD_payback_dusd_loan").should("not.exist");
      cy.getByTestID("loan_card_DUSD_outstanding_balance")
        .invoke("text")
        .then((text: string) => {
          checkValueWithinRange(text.replace(" DUSD", ""), "90", 0.1);
        });
    });

    it("should able to payback full DUSD loan with DUSD collateral", () => {
      cy.sendTokenToWallet(Array(10).fill("DUSD")).wait(6000);
      cy.go("back");
      cy.getByTestID("vault_card_0_edit_collaterals_button").click();
      cy.addCollateral("100", "DUSD");
      cy.go("back");
      cy.wait(2000);
      cy.getByTestID("vault_card_0_manage_loans_button")
        .should("exist")
        .click();
      cy.getByTestID("loan_card_DUSD_outstanding_balance")
        .invoke("text")
        .then((amount: string) => {
          cy.getByTestID("loan_card_DUSD_outstanding_balance_value")
            .invoke("text")
            .then((value: string) => {
              cy.getByTestID("loan_card_DUSD_payback_dusd_loan")
                .should("exist")
                .click();
              cy.getByTestID("dusd_payback_amount").contains(amount);
              cy.getByTestID("dusd_payback_value").contains(value);
              cy.getByTestID("button_confirm_payback_loan_continue")
                .should("exist")
                .click();
              cy.closeOceanInterface();
              cy.getByTestID("vault_card_0_manage_loans_button")
                .should("exist")
                .click();
              cy.getByTestID("empty_active_loans").should("exist");
            });
        });
    });

    it("should not have DUSD payback btn on non DUSD loans", () => {
      cy.go("back");
      cy.getByTestID("vault_card_0_manage_loans_button").click();
      cy.getByTestID("button_browse_loans").click();
      cy.takeLoan("10", "dTS25");
      cy.getByTestID("vault_card_0_manage_loans_button")
        .should("exist")
        .click();
      cy.getByTestID("loan_card_DUSD_payback_dusd_loan").should("not.exist");
    });
  });
});
