import "@testing-library/cypress/add-commands";
import BigNumber from "bignumber.js";
import { VaultStatus } from "../../app/screens/AppNavigator/screens/Loans/VaultStatusTypes";

BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * @description Create a vault
       * @param {string} loanScheme - loanScheme of the vault
       */
      createVault: (
        loanScheme: number,
        hasExistingVault?: boolean,
      ) => Chainable<Element>;

      /**
       * @description Add Collateral
       * @param {string} amount - amount to add
       * @param {string} symbol - symbol of token
       * */
      addCollateral: (amount: string, symbol: string) => Chainable<Element>;

      /**
       * @description Remove Collateral
       * @param {string} amount - amount to add
       * @param {string} symbol - symbol of token
       * */
      removeCollateral: (
        amount: string,
        symbol: string,
        resultingCollateralization?: number,
      ) => Chainable<Element>;

      /**
       * @description Take Loan
       * @param {string} amount - amount to loan
       * @param {string} symbol - symbol of token
       * */
      takeLoan: (amount: string, symbol: string) => Chainable<Element>;

      /**
       * @description Vault Tag
       * @param {string} label - label of the vault tag
       * @param {VaultStatus} status - vault status
       * @param {string} testID - test ID
       * @param {boolean} isDark - if dark mode
       * */
      checkVaultTag: (
        label: string,
        status: VaultStatus,
        testID: string,
        isDark: boolean,
      ) => Chainable<Element>;
      /**
       * @description Vault Tag
       * @param {string} label - label of the vault tag
       * @param {VaultStatus} status - vault status
       * @param {string} testID - test ID
       * @param {boolean} isDark - if dark mode
       * */
      checkVaultStatusColor: (
        status: VaultStatus,
        testID: string,
      ) => Chainable<Element>;
    }
  }
}

Cypress.Commands.add("createVault", (loanScheme: number = 0) => {
  cy.getByTestID("bottom_tab_loans").click();
  cy.getByTestID("button_create_vault").click();
  cy.getByTestID(`loan_scheme_option_${loanScheme}`).click();
  cy.getByTestID("create_vault_submit_button").click().wait(3000);
  cy.closeOceanInterface();
});

Cypress.Commands.add("addCollateral", (amount: string, symbol: string) => {
  cy.getByTestID(`select_${symbol}`).click();
  cy.getByTestID("add_remove_collateral_button_submit").should(
    "have.attr",
    "aria-disabled",
  );
  cy.getByTestID("text_input_add_remove_collateral_amount").type(amount).blur();
  cy.getByTestID("add_remove_collateral_button_submit").click();
  cy.wait(3000);
  cy.getByTestID("button_confirm_confirm_edit_collateral").click().wait(3000);
  cy.closeOceanInterface();
});

Cypress.Commands.add(
  "removeCollateral",
  (amount: string, symbol: string, resultingCollateralization?: number) => {
    cy.getByTestID(`collateral_remove_${symbol}`).click();
    cy.getByTestID("text_input_add_remove_collateral_amount")
      .type(amount)
      .blur();
    if (resultingCollateralization !== undefined) {
      cy.getByTestID("resulting_collateralization")
        .invoke("text")
        .then((colRatioText) => {
          const colRatio = parseFloat(colRatioText.replace("%", ""));
          expect(colRatio).to.be.closeTo(resultingCollateralization, 1);
        });
    }
    cy.getByTestID("add_remove_collateral_button_submit").click();
    cy.getByTestID("button_confirm_confirm_edit_collateral").click().wait(3000);
    cy.getByTestID("txn_authorization_title").contains(
      `Removing ${new BigNumber(amount).toFixed(8)} ${symbol} as collateral`,
    );
    cy.closeOceanInterface();
  },
);

Cypress.Commands.add("takeLoan", (amount: string, symbol: string) => {
  cy.getByTestID(`select_${symbol}`).click();
  cy.getByTestID("text_input_borrow_amount").type(amount).blur();
  cy.getByTestID("borrow_button_submit").click();
  cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
  cy.closeOceanInterface();
});

Cypress.Commands.add(
  "checkVaultTag",
  (label: string, status: VaultStatus, testID: string, isDark: boolean) => {
    const vaultSymbol = `vault_tag_${status}`;
    let vaultItem = {
      title: label,
      symbol: vaultSymbol,
      color: "",
    };
    const nonHealthyState = [
      VaultStatus.Empty,
      VaultStatus.Ready,
      VaultStatus.Liquidated,
    ].includes(status);
    if (status === VaultStatus.AtRisk) {
      vaultItem.color = isDark ? "rgb(255, 159, 10)" : "rgb(255, 150, 41)";
    } else if (status === VaultStatus.Healthy) {
      vaultItem.color = isDark ? "rgb(50, 215, 75)" : "rgb(2, 179, 27)";
    } else if (status === VaultStatus.NearLiquidation) {
      vaultItem.color = isDark ? "rgb(255, 125, 117)" : "rgb(230, 0, 0)";
    } else if (nonHealthyState) {
      vaultItem.color = isDark ? "rgb(163, 163, 163)" : "rgb(115, 115, 115)";
    }
    cy.getByTestID(testID).contains(vaultItem.title);
    cy.getByTestID(testID).should("have.css", "color", vaultItem.color);
    cy.getByTestID(vaultItem.symbol).should(
      nonHealthyState ? "not.exist" : "exist",
    );
  },
);

Cypress.Commands.add(
  "checkVaultStatusColor",
  (status: VaultStatus, testID: string) => {
    let vaultItemColor = "rgb(204, 204, 204)";
    if (status === VaultStatus.AtRisk) {
      vaultItemColor = "rgb(217, 123, 1)";
    } else if (status === VaultStatus.Healthy) {
      vaultItemColor = "rgb(0, 173, 29)";
    } else if (status === VaultStatus.NearLiquidation) {
      vaultItemColor = "rgb(229, 69, 69)";
    }
    cy.getByTestID(testID).should("have.css", "color", vaultItemColor);
  },
);
