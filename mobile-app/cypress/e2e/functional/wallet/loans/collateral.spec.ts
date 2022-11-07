import { CollateralToken } from "@defichain/whale-api-client/dist/api/loan";
import BigNumber from "bignumber.js";
import { EnvironmentNetwork } from "../../../../../../shared/environment";
import {
  checkCollateralFormValues,
  checkConfirmEditCollateralValues,
  checkVaultDetailCollateralAmounts,
  checkVaultDetailValues,
} from "../../../../support/loanCommands";
import { checkValueWithinRange } from "../../../../support/walletCommands";

BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

function addCollateral(
  token: string,
  balance: string,
  amount: string,
  usdValue: string,
  colFactor: string,
  vaultShare: string,
  vaultId: string
): void {
  const precisedAmount = new BigNumber(amount).toFixed(8);
  cy.getByTestID(`select_${token}`).click();
  cy.getByTestID("add_remove_collateral_button_submit").should(
    "have.attr",
    "aria-disabled"
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
    vaultShare
  );
  cy.getByTestID("button_confirm_confirm_edit_collateral").click().wait(3000);
  cy.getByTestID("txn_authorization_title").contains(
    `Adding ${precisedAmount} ${token} as collateral`
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
  vaultId: string
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
    vaultShare
  );
  cy.getByTestID("button_confirm_confirm_edit_collateral").click().wait(3000);
  cy.getByTestID("txn_authorization_title").contains(
    `Removing ${precisedAmount} ${token} as collateral`
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
    `Borrowing ${amountToBorrow} ${symbol} with vault`
  );
  cy.closeOceanInterface();
}

context("Wallet - Loans - Add/Remove Collateral", () => {
  let vaultId = "";

  function validateCollateralInPortfolio(
    token: string,
    tokenId: string,
    availableAmount: string,
    lockedAmount: string
  ): void {
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID(`portfolio_row_${tokenId}_symbol`).contains(token);
    cy.getByTestID(`portfolio_row_${tokenId}_amount`).contains(availableAmount);
    cy.getByTestID(`portfolio_row_${tokenId}`).click();
    cy.getByTestID(`${token}_locked_amount`).contains(lockedAmount);
  }

  before(() => {
    // TODO remove intercept wile removing vault share functionality
    cy.intercept("**/settings/flags", {
      body: [],
    });
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
      "Empty"
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
          `token_symbol_${collateralToken.token.displaySymbol}`
        ).contains(collateralToken.token.displaySymbol);
        cy.getByTestID(
          `select_${collateralToken.token.displaySymbol}_value`
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
      "Ready"
    );
  });

  it("should update collateral list", () => {
    checkVaultDetailCollateralAmounts(
      "DFI",
      "10.00000000",
      "$1,000.00",
      "100.00%"
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
      "Ready"
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
      "63.44%"
    );
    checkVaultDetailCollateralAmounts(
      "dBTC",
      "10.00000000",
      "$500.00",
      "31.72%"
    );
    checkVaultDetailCollateralAmounts("dETH", "10.00000000", "$70.00", "4.44%");
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
      vaultId
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
      vaultId
    );
  });

  it("should update collateral list", () => {
    cy.getByTestID("vault_card_0").click();
    checkVaultDetailCollateralAmounts(
      "DFI",
      "10.00000000",
      "$1,000.00",
      "65.78%"
    );
    checkVaultDetailCollateralAmounts(
      "dBTC",
      "9.00000000",
      "$450.00",
      "29.60%"
    );
    checkVaultDetailCollateralAmounts("dETH", "10.00000000", "$70.00", "4.60%");
  });
});

context("Wallet - Loans - Add/Remove Collateral - Invalid data", () => {
  const getVault = (loanValue: string): any => ({
    vaultId: "vaultidhere",
    loanScheme: {
      id: "MIN150",
      minColRatio: "150",
      interestRate: "5",
    },
    ownerAddress: "bcrt1qjk6p9kc28wdj84c500lh2h5zlzf5ce3r8r0y92",
    state: "ACTIVE",
    informativeRatio: "-1",
    collateralRatio: "100", // must be positive
    collateralValue: "0",
    loanValue,
    interestValue: "0",
    collateralAmounts: [],
    loanAmounts: [],
    interestAmounts: [],
  });
  const walletTheme = { isDark: false };
  beforeEach(() => {
    // TODO remove intercept wile removing vault share functionality
    cy.intercept("**/settings/flags", {
      body: [],
    });
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet().sendDFITokentoWallet().wait(4000);
    cy.setWalletTheme(walletTheme);
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.getByTestID("empty_vault").should("exist");
    cy.createVault(0);
  });

  it("should display Ready if resulting collateralization is infinity", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.intercept("**/vaults?size=200", {
      statusCode: 200,
      body: { data: getVault("0") },
    }).as("getVaults");

    cy.wait("@getVaults").then(() => {
      /* (collateralValueInUSD / vault.loanValue) * 100
       (any number / 0) = Infinity
    */
      cy.wait(3000);
      cy.getByTestID("vault_card_0_EMPTY").click();
      cy.getByTestID("action_add").click();
      cy.getByTestID("select_DFI").click();
      cy.getByTestID("MAX_amount_button").click();
      cy.getByTestID("resulting_collateralization").should(
        "have.text",
        "Ready"
      );
    });
  });

  it("should display Ready if resulting collateralization is NaN", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.intercept("**/vaults?size=200", {
      statusCode: 200,
      body: { data: getVault("0") },
    }).as("getVaults");
    cy.wait("@getVaults").then(() => {
      /* (collateralValueInUSD / vault.loanValue) * 100
       (any number / '') = NaN
    */
      cy.wait(3000);
      cy.getByTestID("vault_card_0_EMPTY").click();
      cy.getByTestID("action_add").click();
      cy.getByTestID("select_DFI").click();
      cy.getByTestID("MAX_amount_button").click();
      cy.getByTestID("resulting_collateralization").should(
        "have.text",
        "Ready"
      );
    });
  });

  it("should display Ready if resulting collateralization is negative", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.intercept("**/vaults?size=200", {
      statusCode: 200,
      body: { data: getVault("-10") },
    }).as("getVaults");
    cy.wait("@getVaults").then(() => {
      /* (collateralValueInUSD / vault.loanValue) * 100
       (any number / -10) = -number
    */
      cy.wait(3000);
      cy.getByTestID("vault_card_0_EMPTY").click();
      cy.getByTestID("action_add").click();
      cy.getByTestID("select_DFI").click();
      cy.getByTestID("MAX_amount_button").click();
      cy.getByTestID("resulting_collateralization").should(
        "have.text",
        "Ready"
      );
    });
  });
});

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
      "Insufficient DFI and/or DUSD in vault. Add more to start minting dTokens."
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
      "rgb(229, 69, 69)"
    );
  });

  it("should have valid vault requirement", () => {
    cy.sendTokenToWallet(["DUSD"]).wait(4000);
    cy.getByTestID("bottom_tab_loans").click();
    cy.wait(3000);
    cy.getByTestID("vault_card_0_EMPTY").click();
    cy.getByTestID("action_add").click();
    addCollateral("dBTC", "10", "10", "$500.00", "100", "0.00%", vaultId);
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
      "rgb(229, 69, 69)"
    );
  });
});
