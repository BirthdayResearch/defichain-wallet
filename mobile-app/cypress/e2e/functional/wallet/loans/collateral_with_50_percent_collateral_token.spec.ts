import BigNumber from "bignumber.js";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import {
  checkCollateralFormValues,
  checkConfirmEditCollateralValues,
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

function borrowLoan(symbol: string, amount: string): void {
  cy.getByTestID("action_borrow").click();
  cy.getByTestID(`select_${symbol}`).click();
  const amountToBorrow = new BigNumber(amount).toFixed(8);
  cy.getByTestID("text_input_borrow_amount").clear().type(amount);
  cy.wait(3000);
  cy.getByTestID("borrow_button_submit").click();
  cy.getByTestID("tokens_to_borrow").contains(`${amount} ${symbol}`);
  cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
  cy.getByTestID("txn_authorization_title").contains(
    `Borrowing ${amountToBorrow} ${symbol} with vault`,
  );
  cy.closeOceanInterface();
}

context("Wallet - Loans - 50% valid collateral token ratio", () => {
  const walletTheme = { isDark: false };
  let vaultId: string;
  beforeEach(() => {
    cy.intercept("**/settings/flags", {
      body: [
        {
          id: "dusd_vault_share",
          name: "DUSD 50% contribution",
          stage: "public",
          version: ">=0.0.0",
          description: "DUSD 50% contribution in required collateral token",
          networks: [
            EnvironmentNetwork.MainNet,
            EnvironmentNetwork.TestNet,
            EnvironmentNetwork.RemotePlayground,
            EnvironmentNetwork.LocalPlayground,
          ],
          platforms: ["ios", "android", "web"],
        },
      ],
    });
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(["BTC", "DUSD"])
      .wait(4000);
    cy.setWalletTheme(walletTheme);
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.getByTestID("empty_vault").should("exist");
    cy.createVault(0);
    cy.getByTestID("vault_card_0_EMPTY_vault_id").then(($txt: any) => {
      vaultId = $txt[0].textContent;
    });
  });

  it("should display warning message while taking loan", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.wait(3000);
    cy.getByTestID("vault_card_0_EMPTY").click();
    cy.getByTestID("action_add").click();
    addCollateral("dBTC", "10", "10", "$500.00", "100", "100.00%", vaultId);
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("action_borrow").click().wait(2000);
    cy.getByTestID("select_dTS25").click();
    cy.wait(2000);
    cy.getByTestID("validation_message").should(
      "have.text",
      "Insufficient DFI and/or DUSD in vault. Add more to start minting dTokens.",
    );
  });

  it("should display warning message while removing collateral", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.wait(3000);
    cy.getByTestID("vault_card_0_EMPTY").click();
    cy.getByTestID("action_add").click();
    addCollateral("dBTC", "10", "10", "$500.00", "100", "100.00%", vaultId);
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("action_add").click();
    addCollateral("DFI", "18", "10", "$1,000.00", "100", "66.67%", vaultId);
    cy.getByTestID("vault_card_0").click();
    borrowLoan("DUSD", "1");
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("collateral_remove_DFI").click();
    checkCollateralFormValues("I WANT TO REMOVE", "DFI", "10");
    cy.getByTestID("text_input_add_remove_collateral_amount").type("6").blur();
    cy.getByTestID("add_remove_collateral_button_submit").click();
    cy.getByTestID("button_confirm_confirm_edit_collateral").click().wait(2000);
    cy.closeOceanInterface();
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("vault_detail_collateral_DFI_vault_share").should(
      "have.css",
      "color",
      "rgb(229, 69, 69)",
    );
  });

  it("should have valid vault requirement", () => {
    cy.sendTokenToWallet(["DUSD"]).wait(4000);
    cy.getByTestID("bottom_tab_loans").click();
    cy.wait(3000);
    cy.getByTestID("vault_card_0_EMPTY").click();
    cy.getByTestID("action_add").click();
    addCollateral("dBTC", "10", "10", "$500.00", "100", "100.00%", vaultId);
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("action_add").click();
    addCollateral("DFI", "18", "4.9", "$490.00", "100", "49.49%", vaultId);
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("action_add").click();
    addCollateral("DUSD", "20", "20", "$24.00", "120", "2.37%", vaultId);
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("vault_detail_collateral_DFI_vault_share").should(
      "have.css",
      "color",
      "rgb(229, 69, 69)",
    );
  });
});
