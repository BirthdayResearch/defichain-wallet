import { LoanScheme } from "@defichain/whale-api-client/dist/api/loan";
import BigNumber from "bignumber.js";
import { VaultStatus } from "../../../../../app/screens/AppNavigator/screens/Loans/VaultStatusTypes";
import { checkValueWithinRange } from "../../../../support/walletCommands";

function setupWalletForConversion(): void {
  cy.getByTestID("bottom_tab_portfolio").click();
  cy.getByTestID("portfolio_list").should("exist");
  cy.getByTestID("dfi_balance_card").should("exist").click();
  cy.getByTestID("dfi_token_amount").contains("10.00000000");
  cy.getByTestID("dfi_utxo_amount").contains("10.00000000");
  cy.getByTestID("convert_button").click();
  cy.getByTestID("button_convert_mode_toggle").click();
  cy.getByTestID("MAX_amount_button").click();
  cy.getByTestID("button_continue_convert").click().wait(3000);
  cy.getByTestID("button_confirm_convert").click().wait(3000);
  cy.closeOceanInterface();
}

function navigateToVault(selectIndex: string): void {
  cy.getByTestID("bottom_tab_loans").click();
  cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
  cy.getByTestID("button_create_vault").click();
  cy.getByTestID(`loan_scheme_option_${selectIndex}`).click();
}

function validateSummary(hasConversion: boolean): void {
  cy.getByTestID("create_vault_summary").should("exist");
  cy.getByTestID("amount_to_convert_label").should(
    hasConversion ? "exist" : "not.exist"
  );
  cy.getByTestID("transaction_fee_label").should("exist");
  cy.getByTestID("transaction_fee_value").should("contain", "0.0002");
  cy.getByTestID("vault_fee_label").should("exist");
  cy.getByTestID("vault_fee_value").should("contain", "1.00000000");
}

context("Wallet - Loans - Create vault", () => {
  beforeEach(() => {
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet().wait(6000);
  });

  it("should display empty vault screen", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.getByTestID("empty_vault").should("exist");
  });

  it("should navigate to create vault screen", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.getByTestID("button_create_vault").click();
    cy.getByTestID("create_vault_screen").should("exist");
  });

  it("should display correct loan schemes in create vault screen", () => {
    cy.intercept("**/loans/schemes?size=50").as("loanSchemes");
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.getByTestID("button_create_vault").click();
    cy.getByTestID("create_vault_submit_button").should(
      "have.attr",
      "aria-disabled"
    );
    cy.getByTestID("loan_scheme_options").should("exist");
    cy.wait(["@loanSchemes"]).then((intercept: any) => {
      const { data } = intercept.response.body;
      data
        .sort((a, b) =>
          new BigNumber(a.minColRatio).minus(b.minColRatio).toNumber()
        )
        .forEach((scheme: LoanScheme, i) => {
          cy.getByTestID(`min_col_ratio_value_${i}`).contains(
            `${Number(scheme.minColRatio).toLocaleString()}%`
          );
          cy.getByTestID(`interest_rate_value_${i}`).contains(
            `${scheme.interestRate}% APR`
          );
        });
    });
  });
});

context("Wallet - Loan - Create vault summary", () => {
  beforeEach(() => {
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet().sendDFITokentoWallet().wait(6000);
  });

  it("should display convert message", () => {
    setupWalletForConversion();
    navigateToVault("0");
    cy.getByTestID("create_vault_summary").should("not.exist");
    cy.getByTestID("action_message").should(
      "have.text",
      "By continuing, the required amount of DFI will be converted"
    );
    cy.getByTestID("create_vault_submit_button").should(
      "have.text",
      "Continue"
    );
    cy.getByTestID("create_vault_submit_button").should(
      "not.have.attr",
      "disabled"
    );
    cy.getByTestID("create_vault_submit_button").click().wait(3000);

    cy.getByTestID("txn_authorization_title")
      .invoke("text")
      .then((text: string) => {
        const value = text.replace(/[^\d.]/g, ""); // use regex to retrieve number value only
        checkValueWithinRange(value, "2.0000", 0.0001);
      });
    cy.closeOceanInterface().wait(6000);
    validateSummary(true);
    cy.getByTestID("action_message").should(
      "have.text",
      "Monitor your vault’s collateralization to prevent liquidation."
    );
    cy.getByTestID("create_vault_submit_button").should(
      "have.text",
      "Create vault"
    );
  });

  it("should display vault summary", () => {
    navigateToVault("1");
    validateSummary(false);
    cy.getByTestID("action_message").should(
      "have.text",
      "Monitor your vault’s collateralization to prevent liquidation."
    );
    cy.getByTestID("create_vault_submit_button").should(
      "have.text",
      "Create vault"
    );
  });
});

context("Wallet - Loans - Confirm create vault", () => {
  const walletTheme = { isDark: false };
  before(() => {
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet().wait(6000);
    cy.setWalletTheme(walletTheme);
  });

  it("should navigate to confirm create vault screen and create a vault", () => {
    navigateToVault("0");
    validateSummary(false);
    cy.getByTestID("create_vault_submit_button").should(
      "have.text",
      "Create vault"
    );
    cy.getByTestID("create_vault_submit_button").click().wait(3000);
    cy.getByTestID("txn_authorization_title").should(
      "have.text",
      "Creating vault"
    );

    // Cancel first selection
    cy.getByTestID("cancel_authorization").click();
    cy.getByTestID("loan_scheme_option_1").click();
    cy.getByTestID("create_vault_submit_button").click().wait(3000);
    cy.getByTestID("txn_authorization_title").should(
      "have.text",
      "Creating vault"
    );
    cy.closeOceanInterface();
  });

  it("should verify if vault was created", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("vault_card_0").should("exist");
    cy.checkVaultTag(
      "EMPTY",
      VaultStatus.Empty,
      "vault_card_0_status",
      walletTheme.isDark
    );
    cy.getByTestID("vault_card_0_collateral_none").contains("None");
    cy.getByTestID("vault_card_0_total_loan").contains("$0.00");
    cy.getByTestID("vault_card_0_total_collateral").contains("$0.00");
    cy.getByTestID("icon-tooltip").should("exist");
  });

  it("should display tooltip message for oracle pricing", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("icon-tooltip").should("exist").first().click();
    cy.getByTestID("icon-tooltip-text")
      .should("exist")
      .should(
        "have.text",
        "This icon indicates that the price is provided by Oracles instead of the DEX"
      );
    cy.wait(2000); // manual condition to hide popover/tooltip on web
    cy.getByTestID("icon-tooltip-text").should("not.exist");
  });
});
