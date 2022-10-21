import { LoanToken } from "@defichain/whale-api-client/dist/api/loan";
import BigNumber from "bignumber.js";
import {
  checkCollateralDetailValues,
  checkVaultDetailValues,
} from "../../../../support/loanCommands";
import { VaultStatus } from "../../../../../app/screens/AppNavigator/screens/Loans/VaultStatusTypes";
import { checkValueWithinRange } from "../../../../support/walletCommands";

function addCollateral(): void {
  cy.go("back");
  cy.wait(2000);
  cy.getByTestID("vault_card_0_status").contains("Ready");
  cy.getByTestID("vault_card_0_collateral_token_group_DFI").should("exist");
  cy.getByTestID("vault_card_0_collateral_token_group_dBTC").should("exist");
  cy.getByTestID("vault_card_0_loan_available_amount").contains("$0.00");
  cy.getByTestID("vault_card_0_total_collateral_amount").contains("$1,500.00");
}

function checkTokensSortingOrder(
  sortedType: string,
  firstToken: string,
  lastToken: string
): void {
  const containerTestID = '[data-testid="loan_screen_token_lists"]';
  const sortButtonTestID = "loans_tokens_sort_toggle";
  cy.getByTestID(sortButtonTestID).click();
  cy.getByTestID(`select_sort_${sortedType}`).click();
  cy.wait(3000);
  cy.getByTestID(sortButtonTestID).contains(sortedType);
  cy.get(containerTestID).children().first().contains(firstToken);
  cy.get(containerTestID).children().last().contains(lastToken);
}

context("Wallet - Loans - Create Loans page", () => {
  before(() => {
    cy.createEmptyWallet(true);
  });
  it("should display empty loans state", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click(); // landing page is on BORROW tab
    cy.getByTestID("empty_vault_title").contains("No vaults");
    cy.getByTestID("empty_vault_description").contains(
      "Get started with loans. Create a vault for your collaterals."
    );
  });

  it("should display learn more bottom sheet", () => {
    cy.getByTestID("empty_vault_learn_more").click();
    cy.wait(2000);
    cy.getByTestID("loans_carousel").should("exist");
    cy.getByTestID("close_bottom_sheet_button").click();
  });
});

context("Wallet - Loans", () => {
  before(() => {
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet().sendDFITokentoWallet().wait(6000);
  });

  it("should display correct loans tokens from API", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.intercept("**/loans/tokens?size=200").as("loans");
    cy.wait(["@loans"]).then((intercept: any) => {
      const { data } = intercept.response.body;
      data.forEach((loan: LoanToken, i) => {
        // const price = loan.activePrice?.active?.amount ?? 0
        cy.getByTestID(`loan_card_${i}_display_symbol`).contains(
          loan.token.displaySymbol
        );
        cy.getByTestID(`loan_card_${i}_interest_rate`).contains(
          `${loan.interest}%`
        );
        // TODO update to fix volatility
        /* cy.getByTestID(`loan_card_${i}_loan_amount`)
          .contains(price > 0 ? `$${Number(new BigNumber(price).toFixed(2)).toLocaleString()}` : '-') */
      });
    });
  });

  it("should create vaults and add collaterals", () => {
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.createVault(0);
    cy.getByTestID("vault_card_0_EMPTY_add_collateral_button").click();
    cy.addCollateral("10", "DFI");
    cy.getByTestID("loans_tabs_BORROW").click();
    cy.getByTestID("loans_tokens_sort_row").should("exist");
  });

  it("should sort tokens based on Lowest interest", () => {
    checkTokensSortingOrder("Lowest interest", "DUSD", "dTR50");
  });

  it("should sort tokens based on Highest interest", () => {
    checkTokensSortingOrder("Highest interest", "dTR50", "DUSD");
  });

  it("should sort tokens based on A to Z", () => {
    checkTokensSortingOrder("Highest interest", "dTD10", "DUSD");
  });

  it("should sort tokens based on Z to A", () => {
    checkTokensSortingOrder("Highest interest", "DUSD", "dTD10");
  });

  it("should sort tokens based on Lowest oracle price", () => {
    checkTokensSortingOrder("Lowest oracle price", "DUSD", "dTD10");
  });

  it("should sort tokens based on Lowest oracle price", () => {
    checkTokensSortingOrder("Lowest oracle price", "dTD10", "DUSD");
  });
});

context("Wallet - Loans - Take Loans", () => {
  let vaultId = "";
  const walletTheme = { isDark: false };
  before(() => {
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(["BTC"])
      .wait(6000);
    cy.setWalletTheme(walletTheme);
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
    cy.getByTestID("vault_card_0_EMPTY_add_collateral_button").click();
    cy.addCollateral("10", "DFI");
    cy.addCollateral("10", "dBTC");
    addCollateral();
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
      "loans_action_button_dTS25_borrow_button_loan_screen"
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
      "loans_action_button_dTS25_borrow_button_loan_screen"
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

  // TODO: update for v2 vault details screen
  it("should add loan", () => {
    let annualInterest: string;
    cy.getByTestID("vault_card_0").click();
    checkVaultDetailValues("READY", vaultId, "$1,500.00", "$0.00", "5");
    cy.getByTestID("vault_detail_tabs_LOANS").click();
    cy.getByTestID("button_browse_loans").click();
    cy.getByTestID(
      "loans_action_button_DUSD_borrow_button_loans_cards"
    ).click();
    cy.getByTestID("form_input_borrow").type("1000").blur();
    cy.wait(3000);
    cy.getByTestID("text_input_usd_value").should("have.value", "1000.00");
    cy.getByTestID("form_input_borrow_error").contains(
      "This amount may place the vault in liquidation"
    );
    cy.getByTestID("text_resulting_col_ratio").contains("150.00%");
    cy.getByTestID("borrow_loan_submit_button").should(
      "have.attr",
      "aria-disabled"
    );
    cy.getByTestID("form_input_borrow").clear().type("100").blur();
    cy.wait(3000);
    cy.getByTestID("text_input_usd_value").should("have.value", "100.00");
    cy.getByTestID("text_resulting_col_ratio").contains("1,500.00%");
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
    cy.getByTestID("text_vault_id").contains(vaultId);
    cy.getByTestID("text_collateral_amount").contains("$1,500.00");
    cy.getByTestID("text_current_collateral_ratio").contains("N/A");
    cy.getByTestID("text_resulting_col_ratio").contains("1,500.00");
    cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
    cy.getByTestID("txn_authorization_description").contains(
      "Borrowing 100.00000000 DUSD"
    );
    cy.closeOceanInterface();
  });

  it("should verify vault card", () => {
    cy.checkVaultStatusColor(VaultStatus.Healthy, "vault_card_0_min_ratio");
    cy.getByTestID("vault_card_0_min_ratio").contains("1.50K %");
    cy.getByTestID("vault_card_0_loan_available_amount").contains("$100");
    cy.getByTestID("vault_card_0_total_collateral_amount").contains(
      "$1,500.00"
    );
  });

  it("should borrow more loan", () => {
    let annualInterest: string;
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("vault_detail_tabs_LOANS").click();
    cy.getByTestID("loan_card_DUSD_borrow_more").click();
    cy.getByTestID("loan_symbol").contains("DUSD");
    cy.getByTestID("loan_outstanding_balance").contains("100");
    cy.getByTestID("vault_id").contains(vaultId);
    cy.checkVaultStatusColor(VaultStatus.Healthy, "vault_card_0_min_ratio");
    cy.getByTestID("loan_col_ratio")
      .invoke("text")
      .then((text) => {
        const loanVal = text.replace("%", "").trim();
        checkValueWithinRange(loanVal, "1,499.99", 1);
      });
    cy.getByTestID("loan_min_col").contains("150.00%");
    cy.getByTestID("loan_add_input").type("1000").blur();
    cy.getByTestID("loan_add_input_error").contains(
      "This amount may place the vault in liquidation"
    );
    cy.getByTestID("text_input_usd_value").should("have.value", "1000.00");
    cy.getByTestID("text_resulting_col_ratio").contains("136");
    cy.getByTestID("borrow_more_button").should("have.attr", "aria-disabled");
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
        new BigNumber("1000").plus(annualInterest).toFixed(8)
      );
    });
    cy.getByTestID("text_total_loan_with_annual_interest_suffix").contains(
      "DUSD"
    );
    cy.getByTestID("loan_add_input").clear().type("648").blur();
    cy.getByTestID("text_resulting_col_ratio").contains("200");
    cy.getByTestID("borrow_more_button").click();
    // check confirm page
    cy.getByTestID("text_borrow_amount").contains("648.00000000");
    cy.getByTestID("text_borrow_amount_suffix").contains("DUSD");
    cy.getByTestID("text_transaction_type").contains("Borrow loan token");
    cy.getByTestID("tokens_to_borrow").contains("648.00000000");
    cy.getByTestID("tokens_to_borrow_suffix").contains("DUSD");
    cy.getByTestID("text_vault_id").contains(vaultId);
    cy.getByTestID("text_collateral_amount").contains("$1,500.00");
    cy.getByTestID("text_resulting_col_ratio").contains("200");
    cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
    cy.getByTestID("txn_authorization_description").contains(
      "Borrowing 648.00000000 DUSD"
    );
    cy.closeOceanInterface();
  });

  it("should verify vault card after adding loans", () => {
    cy.checkVaultStatusColor(VaultStatus.AtRisk, "vault_card_0_min_ratio");
    cy.getByTestID("vault_card_0_min_ratio").contains("200.53%");
    cy.getByTestID("vault_card_0_loan_available_amount").contains("$748");
    cy.getByTestID("vault_card_0_total_collateral_amount").contains(
      "$1,500.00"
    );
  });

  it("should verify collaterals page", () => {
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("vault_detail_edit_collateral").click();
    checkCollateralDetailValues(
      "ACTIVE",
      "$1,500.00",
      "$748.00",
      201.0,
      "%",
      "150.00",
      "5.00"
    );
  });

  it("should verify resulting collateralization after taking loan", () => {
    cy.removeCollateral("1", "DFI", 187.17);
    checkCollateralDetailValues(
      "ACTIVE",
      "$1,400.00",
      "$748",
      187.16,
      "%",
      "150.00",
      "5.00"
    );
    cy.removeCollateral("1", "DFI", 173.8);
    checkCollateralDetailValues(
      "ACTIVE",
      "$1,300.00",
      "$748",
      173.79,
      "%",
      "150.00",
      "5.00"
    );
  });

  it("should borrow another loan token", () => {
    cy.go("back");
    cy.wait(2000);
    cy.go("back");
    cy.getByTestID("loans_tabs_BORROW").click();
    cy.getByTestID("loan_search_input").clear().type("dTS25").wait(1000);
    cy.getByTestID(
      "loans_action_button_dTS25_borrow_button_loan_screen"
    ).click();
    cy.wait(2000);
    cy.getByTestID("form_input_borrow").clear().type("4.5").blur();
    cy.wait(3000);
    cy.getByTestID("text_input_usd_value")
      .invoke("val")
      .then((text) => {
        const value = text.replace("$", "").trim();
        checkValueWithinRange(value, "112.50", 1);
      });
    cy.getByTestID("text_resulting_col_ratio")
      .invoke("text")
      .then((text) => {
        const value = text.replace("%", "").trim();
        checkValueWithinRange(value, "151", 2);
      });
    cy.getByTestID("borrow_loan_submit_button").click();
    cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
    cy.getByTestID("txn_authorization_description").contains(
      "Borrowing 4.50000000 dTS25"
    );
    cy.closeOceanInterface().wait(5000);
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.checkVaultStatusColor(
      VaultStatus.NearLiquidation,
      "vault_card_0_min_ratio"
    );
    cy.getByTestID("vault_card_0_min_ratio").contains("151.07%");
    cy.getByTestID("vault_card_0_loan_available_amount")
      .invoke("text")
      .then((text) => {
        const value = text.replace("%", "").trim();
        checkValueWithinRange(value, "860.56", 1);
      });
    cy.getByTestID("vault_card_0_total_collateral_amount").contains(
      "$1,300.00"
    );
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("vault_detail_tabs_LOANS").click();
    cy.getByTestID("loan_card_DUSD").should("exist");
    cy.getByTestID("loan_card_dTS25").should("exist");
  });
});
