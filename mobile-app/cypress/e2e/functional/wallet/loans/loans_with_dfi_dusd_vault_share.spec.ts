import { checkVaultDetailValues } from "../../../../support/loanCommands";
import { EnvironmentNetwork } from "../../../../../../shared/environment";

context(
  "Wallet - Loans - Take Loans using DFI and DUSD as 50% vault share",
  () => {
    let vaultId = "";
    const walletTheme = { isDark: false };
    before(() => {
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
        .sendTokenToWallet(["BTC", "DUSD", "DUSD"])
        .wait(6000);
      cy.setWalletTheme(walletTheme);
      cy.getByTestID("bottom_tab_loans").click();
      cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
      cy.getByTestID("empty_vault").should("exist");
      cy.createVault(0);
      cy.getByTestID("vault_card_0_manage_loans_button").should("not.exist");
      cy.getByTestID("vault_card_0_EMPTY_vault_id").then(($txt: any) => {
        vaultId = $txt[0].textContent;
      });

      cy.getByTestID("vault_card_0_EMPTY_vault").click();
      cy.getByTestID("action_add").click();
      cy.addCollateral("10", "dBTC");
      cy.getByTestID("vault_card_0").click();
      cy.getByTestID("action_add").click();
      cy.addCollateral("4.9", "DFI");
      cy.getByTestID("vault_card_0").click();
      cy.getByTestID("action_add").click();
      cy.addCollateral("20", "DUSD");

      cy.getByTestID("vault_card_0_status").contains("Ready");
      cy.getByTestID("vault_card_0_collateral_token_group_DFI").should("exist");
      cy.getByTestID("vault_card_0_collateral_token_group_dBTC").should(
        "exist"
      );
      cy.getByTestID("vault_card_0_collateral_token_group_DUSD").should(
        "exist"
      );
      cy.getByTestID("vault_card_0_total_collateral_amount").contains(
        "$1,014.00"
      );
    });

    it("should add loan using DFI and DUSD as 50% vault share", () => {
      cy.getByTestID("vault_card_0").click();
      checkVaultDetailValues(
        "Ready",
        vaultId,
        "$1,014.00",
        "$676",
        "$0.00",
        "5",
        "150"
      );
      cy.getByTestID("action_borrow").click();
      cy.getByTestID("select_DUSD").click();
      cy.getByTestID("text_input_borrow_amount").type("1000").blur();
      cy.getByTestID("borrow_amount_in_usd").contains("$1,000.00");
      cy.getByTestID("vault_liquidation_error")
        .should("be.visible")
        .contains("Amount entered will result in vault liquidation");
      cy.getByTestID("borrow_transaction_detail_col_ratio").contains("101.40%");
      cy.getByTestID("borrow_button_submit").should(
        "have.attr",
        "aria-disabled"
      );
      cy.getByTestID("text_input_borrow_amount").clear().type("100").blur();
      cy.getByTestID("borrow_amount_in_usd").contains("$100.00");
      cy.getByTestID("borrow_transaction_detail_col_ratio").contains(
        "1,014.00%"
      );
      cy.getByTestID("borrow_button_submit").click();
      // Confirm borrow screen
      cy.getByTestID("confirm_title").contains("You are borrowing");
      cy.getByTestID("text_borrow_amount").contains("100.00000000");
      cy.getByTestID("transaction_fee_value").should("exist");
      cy.getByTestID("vault_id_value").contains(vaultId);
      cy.getByTestID("col_ratio_value").contains("1,014");
      cy.getByTestID("tokens_to_borrow").contains("100 DUSD");
      cy.getByTestID("tokens_to_borrow_rhsUsdAmount").contains("$100.00");
      cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
      cy.getByTestID("txn_authorization_title").contains(
        "Borrowing 100.00000000 DUSD"
      );
      cy.closeOceanInterface();
    });

    it("should not allow DFI/DUSD to be zero", () => {
      // remove entire DUSD collateral token
      cy.getByTestID("vault_card_0").click();
      cy.removeCollateral("20", "DUSD");
      // remove entire DFI collateral token
      cy.getByTestID("vault_card_0").click();
      cy.getByTestID("collateral_remove_DFI").click();
      cy.getByTestID("text_input_add_remove_collateral_amount")
        .type("4.9")
        .blur();
      cy.getByTestID("zero_required_token_share_error")
        .should("exist")
        .contains(
          "Insufficient DFI and/or DUSD in vault to maintain active loans"
        );
      cy.getByTestID("add_remove_collateral_button_submit").should(
        "have.attr",
        "aria-disabled"
      );
    });
  }
);
