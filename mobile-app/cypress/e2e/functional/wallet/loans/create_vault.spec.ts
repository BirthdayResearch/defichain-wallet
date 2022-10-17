import { LoanScheme } from "@defichain/whale-api-client/dist/api/loan";
import BigNumber from "bignumber.js";
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

  it("should display carousel bottom sheet", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.getByTestID("empty_vault").should("exist");
    cy.getByTestID("empty_vault_learn_more").should("exist").click();
    cy.getByTestID("loans_carousel").should("exist");
    cy.getByTestID("Next_button")
      .should("exist")
      .should("not.have.attr", "disabled");
    cy.getByTestID("Next_button").click().click().click();
    cy.getByTestID("Next_button").should("not.exist");
    cy.getByTestID("Done_button").should("exist").click();
    cy.getByTestID("loans_carousel").should("not.exist");
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
        .sort((a: LoanScheme, b: LoanScheme) =>
          new BigNumber(a.minColRatio).minus(b.minColRatio).toNumber()
        )
        .forEach((scheme: LoanScheme, i: number) => {
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
    cy.getByTestID("vault_card_0_EMPTY_vault").should("exist");
    cy.getByTestID("vault_card_0_EMPTY_empty_vault_image").should("exist");
    cy.getByTestID("vault_card_0_EMPTY_vault_description").should(
      "have.text",
      "Add collateral to borrow"
    );
    cy.getByTestID("oracle_price_info")
      .should("exist")
      .contains("All prices displayed are from price oracles.");
  });

  it("should display bottom sheet for oracle pricing", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("oracle_price_info").should("exist").first().click();
    cy.getByTestID("oracle_price_info_title")
      .should("exist")
      .should("have.text", "Price Oracles");
    cy.getByTestID("oracle_price_info_description")
      .should("exist")
      .should(
        "have.text",
        "Loans and vaults use aggregated market prices outside the blockchain (called price oracles)"
      );
    cy.getByTestID("close_bottom_sheet_button").click();
    cy.getByTestID("oracle_price_info_title").should("not.exist");
    cy.getByTestID("oracle_price_info_description").should("not.exist");
  });
});
