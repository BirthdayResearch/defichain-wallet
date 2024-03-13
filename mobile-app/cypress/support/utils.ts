import BigNumber from "bignumber.js";

export function generateBlockUntilLiquidate(): void {
  cy.getByTestID("playground_generate_blocks").click();
  cy.wait(3000);
  cy.getByTestID("vault_card_0_status")
    .invoke("text")
    .then((status: string) => {
      if (status !== "IN LIQUIDATION") {
        generateBlockUntilLiquidate();
      }
    });
}

export function checkValueWithinRange(
  actualVal: string,
  expectedVal: string,
  range: number = 2,
): void {
  const value = new BigNumber(actualVal.replace(/[≈$,%()K]/gi, "").trim());
  const expectedValue = new BigNumber(
    expectedVal.replace(/[≈$,%()K]/gi, "").trim(),
  );
  expect(
    value.gte(expectedValue.minus(range)),
    `${value.toFixed(8)} should be gte ${expectedValue.minus(range).toFixed(8)}`,
  ).to.be.eq(true);
  expect(
    value.lte(expectedValue.plus(range)),
    `${value.toFixed(8)} should be lte ${expectedValue.plus(range).toFixed(8)}`,
  ).to.be.eq(true);
}

export function checkCollateralFormValues(
  title: string,
  symbol: string,
  balance: string,
): void {
  cy.getByTestID("add_remove_title").contains(title);
  cy.getByTestID(
    "token_select_button_add_remove_collateral_quick_input_display_symbol",
  ).contains(symbol);
  cy.getByTestID("add_remove_collateral_token_balance").contains(balance);
}

export function checkConfirmEditCollateralValues(
  title: string,
  vaultId: string,
  colFactor: string,
  symbol: string,
  amount: string,
  colValue: string,
  vaultShare: string,
): void {
  cy.getByTestID("confirm_title").contains(title);
  cy.getByTestID("text_confirm_edit_collateral_amount").contains(amount);
  cy.getByTestID("confirm_edit_vault_id").contains(vaultId);
  cy.getByTestID("confirm_edit_collateral_factor").contains(colFactor);
  cy.getByTestID("confirm_edit_collateral_amount").contains(
    `${amount} ${symbol}`,
  );
  cy.getByTestID("confirm_edit_collateral_amount_rhsUsdAmount").contains(
    colValue,
  );
  cy.getByTestID("confirm_edit_vault_share")
    .invoke("text")
    .then((val) => {
      checkValueWithinRange(val, vaultShare, 0.1);
    });
}

export function checkVaultDetailValues(
  vaultID: string,
  totalCollateral: string,
  maxLoanAmount: string,
  totalLoans: string,
  vaultInterest: string,
  minColRatio: string,
  status?: string,
  vaultRatio?: string,
): void {
  if (status !== undefined) {
    cy.getByTestID("vault_status").contains(status);
  }
  if (vaultRatio !== undefined) {
    cy.getByTestID("vault_ratio")
      .invoke("text")
      .then((val) => {
        checkValueWithinRange(val, vaultRatio, 0.1);
      });
  }
  cy.getByTestID("collateral_vault_id").contains(vaultID);
  cy.getByTestID("total_collateral").contains(totalCollateral);
  cy.getByTestID("max_loan_amount")
    .invoke("text")
    .then((val) => {
      checkValueWithinRange(val, maxLoanAmount, 0.1);
    });
  cy.getByTestID("total_loan").contains(totalLoans);
  cy.getByTestID("interest").contains(vaultInterest);
  cy.getByTestID("min_col_ratio").contains(minColRatio);
  // Vault detail labels
  cy.getByTestID("collateral_vault_id_label").contains("Vault ID");
  cy.getByTestID("total_collateral_label").contains("Total collateral");
  cy.getByTestID("max_loan_amount_label").contains("Max loan amount");
  cy.getByTestID("total_loan_label").contains("Total loan");
  cy.getByTestID("interest_label").contains("Interest (APR)");
  cy.getByTestID("min_col_ratio_label").contains("Min. collateral ratio");
}

export function checkVaultDetailCollateralAmounts(
  symbol: string,
  amount: string,
  dollarValue: string,
  vaultShare: string,
): void {
  cy.getByTestID(`vault_detail_collateral_${symbol}_amount`).contains(amount);
  cy.getByTestID(`vault_detail_collateral_${symbol}_usd`).contains(dollarValue);
  cy.getByTestID(`vault_detail_collateral_${symbol}_vault_share`)
    .invoke("text")
    .then((val) => {
      checkValueWithinRange(val, vaultShare, 0.1);
    });
}

export function checkVaultDetailLoansAmount(
  amount: string,
  displaySymbol: string,
  interest: string,
) {
  cy.getByTestID(`loan_card_${displaySymbol}`).should("exist");
  cy.getByTestID(`loan_card_${displaySymbol}_amount`).contains(amount);
  cy.getByTestID(`loan_card_${displaySymbol}_interest`).contains(interest);
}
