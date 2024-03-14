import { CollateralToken } from "@defichain/whale-api-client/dist/api/loan";
import BigNumber from "bignumber.js";
import {
  checkCollateralFormValues,
  checkConfirmEditCollateralValues,
  checkVaultDetailCollateralAmounts,
  checkVaultDetailValues,
  checkValueWithinRange,
} from "../../../../support/utils";

BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

function addCollateral(
  token: string,
  balance: string,
  amount: string,
  usdValue: string,
  colFactor: string,
  vaultShare: string,
  vaultId: string,
): void {
  const precisedAmount = new BigNumber(amount).toFixed(8);
  cy.getByTestID(`select_${token}`).click();
  cy.getByTestID("add_remove_collateral_button_submit").should(
    "have.attr",
    "aria-disabled",
  );
  checkCollateralFormValues("I WANT TO ADD", token, balance);
  cy.getByTestID("text_input_add_remove_collateral_amount").type(amount).blur();
  cy.wait(3000);
  cy.getByTestID("add_remove_collateral_button_submit").click();
  checkConfirmEditCollateralValues(
    "You are adding collateral",
    vaultId,
    colFactor,
    token,
    precisedAmount,
    usdValue,
    vaultShare,
  );
  cy.getByTestID("button_confirm_confirm_edit_collateral").click().wait(3000);
  cy.getByTestID("txn_authorization_title").contains(
    `Adding ${precisedAmount} ${token} as collateral`,
  );
  cy.closeOceanInterface();
}

function removeCollateral(
  token: string,
  balance: string,
  amount: string,
  usdValue: string,
  colFactor: string,
  vaultShare: string,
  vaultId: string,
): void {
  const precisedAmount = new BigNumber(amount).toFixed(8);
  cy.getByTestID(`collateral_remove_${token}`).click();
  checkCollateralFormValues("I WANT TO REMOVE", token, balance);
  cy.getByTestID("text_input_add_remove_collateral_amount").type(amount).blur();
  cy.wait(3000);
  cy.getByTestID("add_remove_collateral_button_submit").click();
  checkConfirmEditCollateralValues(
    "You are removing collateral",
    vaultId,
    colFactor,
    token,
    precisedAmount,
    usdValue,
    vaultShare,
  );
  cy.getByTestID("button_confirm_confirm_edit_collateral").click().wait(3000);
  cy.getByTestID("txn_authorization_title").contains(
    `Removing ${precisedAmount} ${token} as collateral`,
  );
  cy.closeOceanInterface();
}

context(
  "Wallet - Loans - Add/Remove Collateral",
  { testIsolation: false },
  () => {
    let vaultId = "";

    function validateCollateralInPortfolio(
      token: string,
      tokenId: string,
      availableAmount: string,
      lockedAmount: string,
    ): void {
      cy.getByTestID("bottom_tab_portfolio").click();
      cy.getByTestID(`portfolio_row_${tokenId}_symbol`).contains(token);
      cy.getByTestID(`portfolio_row_${tokenId}_amount`).contains(
        availableAmount,
      );
      cy.getByTestID(`portfolio_row_${tokenId}`).click();
      cy.getByTestID(`${token}_locked_amount`).contains(lockedAmount);
    }

    before(() => {
      // TODO remove intercept wile removing vault share functionality
      cy.blockAllFeatureFlag();
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.createEmptyWallet(true);
      cy.sendDFItoWallet()
        .sendDFITokentoWallet()
        .sendTokenToWallet(["BTC", "ETH", "DUSD"])
        .wait(6000);
    });

    it("should create vault", () => {
      cy.getByTestID("bottom_tab_loans").click();
      cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
      cy.getByTestID("empty_vault").should("exist");
      cy.createVault(0);
      cy.getByTestID("vault_card_0_EMPTY").should("exist");
      cy.getByTestID("vault_card_0_EMPTY_vault_id").then(($txt: any) => {
        vaultId = $txt[0].textContent;
      });
    });

    it("should show collateral list", () => {
      cy.intercept("**/loans/collaterals?size=50").as("loanCollaterals");
      cy.getByTestID("vault_card_0_EMPTY").click();
      checkVaultDetailValues(
        vaultId,
        "0.00",
        "0.00",
        "0.00",
        "5%",
        "150%",
        "Empty",
      );
      cy.getByTestID("action_add").click();
      cy.wait(["@loanCollaterals"]).then((intercept: any) => {
        const amounts: any = {
          DFI: 18,
          dBTC: 10,
          dETH: 10,
          DUSD: 10,
        };
        const { data } = intercept.response.body;
        data.forEach((collateralToken: CollateralToken) => {
          cy.getByTestID(
            `token_symbol_${collateralToken.token.displaySymbol}`,
          ).contains(collateralToken.token.displaySymbol);
          cy.getByTestID(
            `select_${collateralToken.token.displaySymbol}_value`,
          ).contains(amounts[collateralToken.token.displaySymbol] ?? 0);
        });
      });
    });

    it("should add DFI as collateral", () => {
      addCollateral("DFI", "18", "10", "$1,000.00", "100", "100.00%", vaultId);
    });

    it("should update locked DFI in portfolio screen", () => {
      cy.getByTestID("bottom_tab_portfolio").click();
      cy.getByTestID("dfi_balance_card").click();
      cy.getByTestID("DFI_locked_amount").contains("10.00000000");
      cy.getByTestID("DFI_locked_value_amount").contains("$100,000.00");
      cy.getByTestID("token_detail_amount")
        .invoke("text")
        .then((text) => {
          checkValueWithinRange(text, "8.9", 0.1);
        });
    });

    it("should update vault details", () => {
      cy.getByTestID("bottom_tab_loans").click();
      cy.getByTestID("vault_card_0").click();
      checkVaultDetailValues(
        vaultId,
        "1,000.00",
        "666.67",
        "0.00",
        "5%",
        "150%",
        "Ready",
      );
    });

    it("should update collateral list", () => {
      checkVaultDetailCollateralAmounts(
        "DFI",
        "10.00000000",
        "$1,000.00",
        "100.00%",
      );
    });

    it("should add dBTC as collateral", () => {
      cy.getByTestID("action_add").click();
      addCollateral("dBTC", "10", "10", "$500.00", "100", "33.33%", vaultId);
    });

    it("should add dETH as collateral", () => {
      cy.getByTestID("vault_card_0").click();
      cy.getByTestID("action_add").click();
      addCollateral("dETH", "10", "10", "$70.00", "70", "4.45%", vaultId);
    });

    it("should display locked collateral token in portfolio even though it has no balance", () => {
      cy.getByTestID("bottom_tab_portfolio").click();
      validateCollateralInPortfolio("BTC", "1", "0.00000000", "10.00000000");
      cy.getByTestID("bottom_tab_portfolio").click();
      validateCollateralInPortfolio("ETH", "2", "0.00000000", "10.00000000");
    });

    it("should update vault details", () => {
      cy.getByTestID("bottom_tab_loans").click();
      cy.getByTestID("vault_card_0").click();
      checkVaultDetailValues(
        vaultId,
        "1,570.00",
        "1,046.67",
        "0.00",
        "5%",
        "150%",
        "Ready",
      );
    });

    it("should add DUSD as collateral", () => {
      cy.getByTestID("action_add").click();
      addCollateral("DUSD", "10", "5.1357", "$6.16", "120", "0.39%", vaultId);
    });

    it("should update collateral list", () => {
      cy.getByTestID("vault_card_0").click();
      checkVaultDetailCollateralAmounts(
        "DFI",
        "10.00000000",
        "$1,000.00",
        "63.44%",
      );
      checkVaultDetailCollateralAmounts(
        "dBTC",
        "10.00000000",
        "$500.00",
        "31.72%",
      );
      checkVaultDetailCollateralAmounts(
        "dETH",
        "10.00000000",
        "$70.00",
        "4.44%",
      );
      checkVaultDetailCollateralAmounts("DUSD", "5.13570000", "$6.16", "0.39%");
    });

    it("should remove dBTC collateral", () => {
      removeCollateral("dBTC", "10", "1", "$50.00", "100", "29.49%", vaultId);
    });

    it("should remove DUSD collateral", () => {
      cy.getByTestID("vault_card_0").click();
      removeCollateral(
        "DUSD",
        "5.1357",
        "1.8642",
        "$2.23",
        "120",
        "0.25%",
        vaultId,
      );
    });

    it("vault % should be 0.00% when MAX amount of DUSD collateral is removed", () => {
      cy.getByTestID("vault_card_0").click();
      removeCollateral(
        "DUSD",
        "3.2715",
        "3.2715",
        "$3.92",
        "120",
        "0.00%",
        vaultId,
      );
    });

    it("should update collateral list", () => {
      cy.getByTestID("vault_card_0").click();
      checkVaultDetailCollateralAmounts(
        "DFI",
        "10.00000000",
        "$1,000.00",
        "65.78%",
      );
      checkVaultDetailCollateralAmounts(
        "dBTC",
        "9.00000000",
        "$450.00",
        "29.60%",
      );
      checkVaultDetailCollateralAmounts(
        "dETH",
        "10.00000000",
        "$70.00",
        "4.60%",
      );
    });
  },
);
