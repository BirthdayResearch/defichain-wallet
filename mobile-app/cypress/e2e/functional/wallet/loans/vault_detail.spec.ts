import BigNumber from "bignumber.js";
import {
  checkVaultDetailCollateralAmounts,
  checkVaultDetailLoansAmount,
  checkVaultDetailValues,
} from "../../../../support/loanCommands";

function borrowLoan(symbol: string, amount: string) {
  cy.getByTestID(`select_${symbol}`).click();
  cy.getByTestID("text_input_borrow_amount").clear().type(amount).blur();
  cy.getByTestID("borrow_button_submit").click();
  cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
  cy.closeOceanInterface();
}

context("Wallet - Loans - Vault Details", () => {
  let vaultId = "";

  before(() => {
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(["BTC", "DUSD"])
      .wait(6000);
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.getByTestID("empty_vault").should("exist");
    cy.createVault(0);
    cy.getByTestID("vault_card_0_EMPTY_add_collateral_button").should("exist");
    cy.getByTestID("vault_card_0_EMPTY_vault_id").then(($txt: any) => {
      vaultId = $txt[0].textContent;
    });
  });

  it("should check empty state", () => {
    cy.getByTestID("vault_card_0_EMPTY").click();
    checkVaultDetailValues(
      vaultId,
      "0.00",
      "0.00",
      "0.00",
      "5%",
      "150%",
      "Empty"
    );
    cy.getByTestID("action_borrow").should("have.attr", "aria-disabled");
    cy.getByTestID("action_pay").should("have.attr", "aria-disabled");
    cy.getByTestID("collateral_card_dfi_empty").should("exist");
    cy.getByTestID("button_close_vault").should(
      "not.have.attr",
      "aria-disabled"
    );
    cy.go("back");
  });

  it("should add collaterals", () => {
    cy.getByTestID("vault_card_0_EMPTY_add_collateral_button").click();
    cy.addCollateral("10", "DFI");
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("action_add").click();
    cy.addCollateral("10", "dBTC");
  });

  it("should check ready state", () => {
    cy.getByTestID("vault_card_0").click();
    checkVaultDetailValues(
      vaultId,
      "1,500.00",
      "1,000.00",
      "0.00",
      "5%",
      "150%",
      "Ready"
    );
    cy.getByTestID("action_borrow").should("not.have.attr", "aria-disabled");
    cy.getByTestID("action_pay").should("have.attr", "aria-disabled");
    cy.getByTestID("collateral_card_dfi_empty").should("not.exist");
    checkVaultDetailCollateralAmounts("10.00000000", "DFI", "66.67%");
    checkVaultDetailCollateralAmounts("10.00000000", "dBTC", "33.33%");
  });

  it("should add loan", () => {
    cy.getByTestID("action_borrow").click();
    borrowLoan("DUSD", "100");
  });

  it("should check active state", () => {
    cy.getByTestID("vault_card_0").click();
    checkVaultDetailValues(
      vaultId,
      "1,500.00",
      "900.00",
      "100.00",
      "5%",
      "150%",
      undefined, // ACTIVE vault
      "1.50K"
    );
    cy.getByTestID("action_pay").should("not.have.attr", "aria-disabled");
    checkVaultDetailLoansAmount("100.0", "DUSD", "0.00");
    cy.getByTestID("button_close_vault").should("have.attr", "aria-disabled");
  });

  it("should be able to add more collateral", () => {
    cy.getByTestID("action_add").click();
    cy.addCollateral("10", "DFI");
    cy.getByTestID("vault_card_0").click();
    checkVaultDetailValues(
      vaultId,
      "2,500",
      "1,566.67",
      "100.00",
      "5%",
      "150%",
      undefined,
      "2.50K"
    );
  });

  it("should be able to remove collateral", () => {
    cy.removeCollateral("10", "dBTC");
    cy.getByTestID("vault_card_0").click();
    checkVaultDetailValues(
      vaultId,
      "2,000.00",
      "1,233.3",
      "100.0",
      "5",
      "150",
      undefined,
      "2.00K"
    );
  });

  it("should display different collateral message for affected vault", () => {
    // Affected vault: have both DUSD in collaterals and loans
    cy.getByTestID("info_text").contains(
      "Your loan amount can be maximized by adding DFI/DUSD as collaterals"
    );
    cy.getByTestID("payback_using_DUSD_collateral").should("not.exist");
    cy.getByTestID("action_add").click();
    cy.addCollateral("10", "DUSD");
    cy.getByTestID("vault_card_0").click();
    checkVaultDetailValues(
      vaultId,
      "2,012.00",
      "1,241.33",
      "100.0",
      "5",
      "150",
      undefined,
      "2.01K"
    );
    cy.getByTestID("info_text").contains(
      "Maintain at least 50% DFI as collateral for DUSD loans"
    );
    cy.getByTestID("payback_using_DUSD_collateral").should("exist");
  });

  it("should be able to edit loan scheme", () => {
    cy.getByTestID("action_edit").click();
    cy.getByTestID("loan_scheme_option_1").click();
    cy.getByTestID("edit_loan_scheme_submit_button").click();
    cy.getByTestID("edit_loan_scheme_title").contains(
      "You are editing loan scheme of"
    );
    cy.getByTestID("edit_loan_scheme_vault_id").contains(vaultId);
    cy.getByTestID("prev_min_col_ratio").contains("150");
    cy.getByTestID("prev_vault_interest").contains("5");
    cy.getByTestID("new_min_col_ratio").contains("175");
    cy.getByTestID("new_vault_interest").contains("3");
    cy.getByTestID("button_confirm_edit_loan_scheme").click();
    cy.closeOceanInterface();
    cy.getByTestID("vault_card_0").click();
    checkVaultDetailValues(
      vaultId,
      "2,012.00",
      "1,049.71",
      "100.0",
      "3",
      "175",
      undefined,
      "2.01K"
    );
  });
});

context("Wallet - Loans - Close Vault", () => {
  before(() => {
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(["BTC", "DUSD"])
      .wait(6000);
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.getByTestID("empty_vault").should("exist");
    cy.createVault(0);
    cy.getByTestID("vault_card_0_EMPTY_add_collateral_button").click();
    cy.addCollateral("10", "DFI");
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("action_add").click();
    cy.addCollateral("10", "dBTC");
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("action_add").click();
    cy.addCollateral("10", "DUSD");
    cy.wait(2000);
  });

  it("should add loan", () => {
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("action_borrow").click();
    borrowLoan("DUSD", "100");
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("button_close_vault").should("have.attr", "aria-disabled");
  });

  it("should be able to close vault", () => {
    cy.sendTokenToWallet(["DUSD"]).sendTokenToWallet(["DUSD"]).wait(3000);
    cy.getByTestID("loans_action_button_pay_DUSD_loan").click();
    cy.getByTestID("payback_input_text").clear().type("102").blur();
    cy.getByTestID("button_confirm_payback_loan_continue").click().wait(3000);
    cy.getByTestID("button_confirm_payback_loan").click().wait(4000);
    cy.closeOceanInterface();
    cy.getByTestID("vault_card_0").click();

    cy.getByTestID("button_close_vault").click().wait(4000);
    cy.getByTestID("fees_to_return_text_lhs_label").should(
      "have.text",
      "Fees to return"
    );
    cy.getByTestID("fees_to_return_text_rhs").should("have.text", "0.5 DFI");
    cy.getByTestID("fees_to_burn_text_lhs_label").should(
      "have.text",
      "Fees to burn"
    );
    cy.getByTestID("fees_to_return_text_rhs").should("have.text", "0.5 DFI");
    cy.getByTestID("button_confirm_close_vault").click().wait(3000);
    cy.getByTestID("txn_authorization_title").contains("Closing vault");
    cy.closeOceanInterface();
    cy.getByTestID("button_create_vault").should("exist");
  });
});

context("Wallet - Loans - Health Bar", () => {
  before(() => {
    cy.createEmptyWallet(true);
    cy.intercept("**/address/**/vaults?size=*", {
      statusCode: 200,
      body: {
        data: [
          {
            vaultId:
              "85a5fbbb7a73ed0586b43d3fb2eb75e06d44c043692e9090bf316a7ff18c5ecc",
            loanScheme: {
              id: "MIN150",
              minColRatio: "150",
              interestRate: "5",
            },
            ownerAddress: "bcrt1qvlu82whrzgayss7x2t6jmjp70eu78ls7r54grj",
            state: "ACTIVE",
            informativeRatio: "993.92181328",
            collateralRatio: "994",
            collateralValue: "100",
            loanValue: "10.06115357",
            interestValue: "0.00097623",
            collateralAmounts: [
              {
                id: "0",
                amount: "1.00000000",
                symbol: "DFI",
                symbolKey: "DFI",
                name: "Default Defi token",
                displaySymbol: "DFI",
                activePrice: {
                  id: "DFI-USD-258",
                  key: "DFI-USD",
                  isLive: true,
                  block: {
                    hash: "f7cd0948080cc9c6bd1c05fdc387bd99db9f95b890b9b6d28e3688a24be4c55e",
                    height: 258,
                    medianTime: 1644834131,
                    time: 1644834137,
                  },
                  active: {
                    amount: "100.00000000",
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3,
                    },
                  },
                  next: {
                    amount: "150.00000000",
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3,
                    },
                  },
                  sort: "00000102",
                },
              },
            ],
            loanAmounts: [
              {
                id: "11",
                amount: "1.00000000",
                symbol: "TU10",
                symbolKey: "TU10",
                name: "Decentralized TU10",
                displaySymbol: "dTU10",
                activePrice: {
                  id: "TU10-USD-258",
                  key: "TU10-USD",
                  isLive: true,
                  block: {
                    hash: "f7cd0948080cc9c6bd1c05fdc387bd99db9f95b890b9b6d28e3688a24be4c55e",
                    height: 258,
                    medianTime: 1644834131,
                    time: 1644834137,
                  },
                  active: {
                    amount: "10",
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3,
                    },
                  },
                  next: {
                    amount: "20",
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3,
                    },
                  },
                  sort: "00000102",
                },
              },
            ],
            interestAmounts: [
              {
                id: "11",
                amount: "0.00009704",
                symbol: "TU10",
                symbolKey: "TU10",
                name: "Decentralized TU10",
                displaySymbol: "dTU10",
                activePrice: {
                  id: "TU10-USD-258",
                  key: "TU10-USD",
                  isLive: true,
                  block: {
                    hash: "f7cd0948080cc9c6bd1c05fdc387bd99db9f95b890b9b6d28e3688a24be4c55e",
                    height: 258,
                    medianTime: 1644834131,
                    time: 1644834137,
                  },
                  active: {
                    amount: "10.06017734",
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3,
                    },
                  },
                  next: {
                    amount: "10.06319570",
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3,
                    },
                  },
                  sort: "00000102",
                },
              },
            ],
          },
        ],
      },
    });
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
  });

  it("should display col ratio from vault API", () => {
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("vault_ratio").contains("993.92");
  });

  it("should calculate next ratio using next price from oracle", () => {
    const loanInNextPrice = new BigNumber(1.0).multipliedBy(20);
    const nextRatioValue = new BigNumber(150.0)
      .dividedBy(loanInNextPrice)
      .multipliedBy(100)
      .toFixed(2);
    cy.getByTestID("vault_next_col_ratio")
      .invoke("text")
      .then((nextRatio: string) => {
        expect(nextRatio).to.equal(`${nextRatioValue}% next`);
      });
    cy.getByTestID("vault_ratio")
      .invoke("text")
      .then((colRatio: string) => {
        const colRatioValue = new BigNumber(colRatio.replace("%", ""));
        expect(colRatioValue.isGreaterThan(nextRatioValue)).equal(true);
      });
  });
});
