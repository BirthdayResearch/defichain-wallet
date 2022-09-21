import BigNumber from "bignumber.js";
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
      cy.getByTestID("empty_vault").should("exist");
      cy.createVault(0);
      cy.getByTestID("vault_card_0_manage_loans_button").should("not.exist");
      cy.getByTestID("vault_card_0_vault_id").then(($txt: any) => {
        vaultId = $txt[0].textContent;
      });
      cy.getByTestID("vault_card_0_edit_collaterals_button").click();
      cy.addCollateral("10", "dBTC");
      cy.addCollateral("4.9", "DFI");
      cy.addCollateral("20", "DUSD");
      cy.go("back");
      cy.wait(2000);
      cy.getByTestID("vault_card_0_status").contains("READY");
      cy.getByTestID("vault_card_0_collateral_token_group_DFI").should("exist");
      cy.getByTestID("vault_card_0_collateral_token_group_dBTC").should(
        "exist"
      );
      cy.getByTestID("vault_card_0_total_collateral").contains("$1,009.80");
    });

    it("should add loan using DFI and DUSD as 50% vault share", () => {
      let annualInterest: string;
      cy.getByTestID("vault_card_0_manage_loans_button").click();
      checkVaultDetailValues("READY", vaultId, "$1,009.80", "$0.00", "5");
      cy.getByTestID("button_browse_loans").click();
      cy.getByTestID("loan_card_DUSD").click();
      cy.getByTestID("form_input_borrow").type("1000").blur();
      cy.wait(3000);
      cy.getByTestID("text_input_usd_value").should("have.value", "1000.00");
      cy.getByTestID("form_input_borrow_error").contains(
        "This amount may place the vault in liquidation"
      );
      cy.getByTestID("text_resulting_col_ratio").contains("100.98%");
      cy.getByTestID("borrow_loan_submit_button").should(
        "have.attr",
        "aria-disabled"
      );
      cy.getByTestID("form_input_borrow").clear().type("100").blur();
      cy.wait(3000);
      cy.getByTestID("text_input_usd_value").should("have.value", "100.00");
      cy.getByTestID("text_resulting_col_ratio").contains("1,009.80%");
      cy.getByTestID("text_estimated_annual_interest").then(($txt: any) => {
        annualInterest = $txt[0].textContent
          .replace(" DUSD", "")
          .replace(",", "");
      });
      cy.getByTestID("text_total_loan_with_annual_interest").then(
        ($txt: any) => {
          const totalLoanWithAnnualInterest = $txt[0].textContent
            .replace(" DUSD", "")
            .replace(",", "");
          expect(
            new BigNumber(totalLoanWithAnnualInterest).toFixed(8)
          ).to.be.equal(new BigNumber("100").plus(annualInterest).toFixed(8));
        }
      );
      cy.getByTestID("borrow_loan_submit_button").click();
      cy.getByTestID("text_borrow_amount").contains("100.00000000");
      cy.getByTestID("text_borrow_amount_suffix").contains("DUSD");
      cy.getByTestID("text_transaction_type").contains("Borrow loan token");
      cy.getByTestID("tokens_to_borrow").contains("100.00000000");
      cy.getByTestID("tokens_to_borrow_suffix").contains("DUSD");
      cy.getByTestID("text_vault_id").contains(vaultId);
      cy.getByTestID("text_collateral_amount").contains("$1,009.80");
      cy.getByTestID("text_current_collateral_ratio").contains("N/A");
      cy.getByTestID("text_resulting_col_ratio").contains("1,009.80%");
      cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
      cy.getByTestID("txn_authorization_description").contains(
        "Borrowing 100.00000000 DUSD"
      );
      cy.closeOceanInterface();
    });

    it("should not able to remove required collateral token below its 50% vault share", () => {
      cy.getByTestID("vault_card_0_edit_collaterals_button").click();
      cy.getByTestID("collateral_card_remove_DUSD").click();
      cy.getByTestID("form_input_text").type("20").blur();
      cy.getByTestID("resulting_collateralization")
        .invoke("text")
        .then((colRatioText) => {
          const colRatio = parseFloat(colRatioText.replace("%", ""));
          expect(colRatio).to.be.closeTo(990, 1);
        });
      cy.getByTestID("bottom-sheet-vault-requirement-text").contains("49.49%");
      cy.getByTestID("add_collateral_button_submit").should(
        "have.attr",
        "aria-disabled"
      );
      cy.go("back");

      cy.getByTestID("vault_card_0_edit_collaterals_button").click();
      cy.getByTestID("collateral_card_remove_DFI").click();
      cy.getByTestID("form_input_text").type("1").blur();
      cy.getByTestID("resulting_collateralization")
        .invoke("text")
        .then((colRatioText) => {
          const colRatio = parseFloat(colRatioText.replace("%", ""));
          expect(colRatio).to.be.closeTo(909.9, 1);
        });
      cy.getByTestID("bottom-sheet-vault-requirement-text").contains("45.02%");
      cy.getByTestID("add_collateral_button_submit").should(
        "have.attr",
        "aria-disabled"
      );
    });
  }
);
