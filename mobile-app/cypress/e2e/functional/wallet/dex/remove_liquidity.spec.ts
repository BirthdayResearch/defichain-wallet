import BigNumber from "bignumber.js";
import { checkValueWithinRange } from "../../../../support/walletCommands";

// configure pair token
const tokenA = "dETH";
const tokenB = "DFI";
const tokensPair = `${tokenA}-${tokenB}`;

function createAddLiquidityToWallet(): void {
  cy.createEmptyWallet(true);

  cy.getByTestID("header_settings").click();
  cy.sendDFItoWallet().sendTokenToWallet(["ETH-DFI"]).wait(3000);
  cy.getByTestID("bottom_tab_dex").click().wait(1000);
  cy.getByTestID("dex_tabs_YOUR_POOL_PAIRS").click().wait(1000);
  cy.getByTestID("your_liquidity_tab")
    .wait(2000)
    .getByTestID("pool_pair_row_your")
    .should("have.length", 1);

  cy.getByTestID("your_liquidity_tab")
    .wait(2000)
    .getByTestID("pool_pair_row_your")
    .first()
    .invoke("text")
    .should((text) => expect(text).to.contains("10.00000000"));

  cy.getByTestID(`pool_pair_remove_${tokensPair}`).click().wait(1000);
  cy.getByTestID("remove_liquidity_calculation_summary").should("not.exist");
}

function validatePriceSectionInfo(testID: string): void {
  cy.getByTestID(`${testID}_0`).should("exist");
  cy.getByTestID(`${testID}_0_label`).contains(`${tokenA} to receive`);
  cy.getByTestID(`${testID}_1`).should("exist");
  cy.getByTestID(`${testID}_1_label`).contains(`${tokenB} to receive`);
}

function validatePriceSelectionAndSummaryBasedOnPercentage(): void {
  // value based on LP amount
  cy.getByTestID("25%_amount_button").click().wait(200);
  cy.getByTestID("tokens_remove_amount_input").should(
    "have.value",
    "2.50000000"
  );
  cy.getByTestID("pricerate_value_0")
    .invoke("text")
    .then((value) => {
      checkValueWithinRange(value, "25.00000000");
    });
  cy.getByTestID("pricerate_value_0_rhsUsdAmount")
    .invoke("text")
    .then((value) => {
      checkValueWithinRange(value, "2,500.00");
    });
  cy.getByTestID("pricerate_value_1")
    .invoke("text")
    .then((value) => {
      checkValueWithinRange(value, "0.25000000");
    });
  cy.getByTestID("pricerate_value_1_rhsUsdAmount")
    .invoke("text")
    .then((value) => {
      checkValueWithinRange(value, "2,500.00");
    });

  cy.getByTestID("50%_amount_button").click().wait(200);
  cy.getByTestID("tokens_remove_amount_input").should(
    "have.value",
    "5.00000000"
  );
  cy.getByTestID("pricerate_value_0")
    .invoke("text")
    .then((value) => {
      checkValueWithinRange(value, "50.00000000");
    });
  cy.getByTestID("pricerate_value_0_rhsUsdAmount")
    .invoke("text")
    .then((value) => {
      checkValueWithinRange(value, "5,000.00");
    });
  cy.getByTestID("pricerate_value_1")
    .invoke("text")
    .then((value) => {
      checkValueWithinRange(value, "0.50000000");
    });
  cy.getByTestID("pricerate_value_1_rhsUsdAmount")
    .invoke("text")
    .then((value) => {
      checkValueWithinRange(value, "5,000.00");
    });

  cy.getByTestID("75%_amount_button").click().wait(200);
  cy.getByTestID("tokens_remove_amount_input").should(
    "have.value",
    "7.50000000"
  );
  cy.getByTestID("pricerate_value_0")
    .invoke("text")
    .then((value) => {
      checkValueWithinRange(value, "75.00000000");
    });
  cy.getByTestID("pricerate_value_0_rhsUsdAmount")
    .invoke("text")
    .then((value) => {
      checkValueWithinRange(value, "7,500.00");
    });
  cy.getByTestID("pricerate_value_1")
    .invoke("text")
    .then((value) => {
      checkValueWithinRange(value, "0.75000000");
    });
  cy.getByTestID("pricerate_value_1_rhsUsdAmount")
    .invoke("text")
    .then((value) => {
      checkValueWithinRange(value, "7,500.00");
    });

  cy.getByTestID("MAX_amount_button").click().wait(200);
  cy.getByTestID("tokens_remove_amount_input").should(
    "have.value",
    "10.00000000"
  );
  cy.getByTestID("pricerate_value_0")
    .invoke("text")
    .then((value) => {
      checkValueWithinRange(value, "100.00000000");
    });
  cy.getByTestID("pricerate_value_0_rhsUsdAmount")
    .invoke("text")
    .then((value) => {
      checkValueWithinRange(value, "10,000.00");
    });
  cy.getByTestID("pricerate_value_1")
    .invoke("text")
    .then((value) => {
      checkValueWithinRange(value, "1.00000000");
    });
  cy.getByTestID("pricerate_value_1_rhsUsdAmount")
    .invoke("text")
    .then((value) => {
      checkValueWithinRange(value, "10,000.00");
    });

  cy.getByTestID("tokens_remove_amount_input_clear_button").click().wait(1000); // clear input
}

context("Wallet - DEX - View pool share information", () => {
  before(() => {
    createAddLiquidityToWallet();
  });

  it("clicking view pool share should open details modal and able to close modal", () => {
    cy.getByTestID("view_pool_button").click().wait(1000);
    cy.getByTestID("view_pool_details_title").should(
      "have.text",
      `${tokenA}-${tokenB}`
    );
    cy.getByTestID("lp_tokens_value").should("exist").contains("10.00000000");
    cy.getByTestID("lp_tokens_percentage_amount").should("exist");

    cy.getByTestID(`token_in_${tokenA}_value`)
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "100.00000000");
      });
    cy.getByTestID(`token_in_${tokenA}_value_rhsUsdAmount`)
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "10,000.00");
      });
    cy.getByTestID(`token_in_${tokenB}_value`)
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "0.10000000");
      });
    cy.getByTestID(`token_in_${tokenB}_value_rhsUsdAmount`)
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "10,000.00");
      });
    cy.getByTestID("close_bottom_sheet_button").click();
  });
});

context("Wallet - DEX - Remove Liquidity", () => {
  before(() => {
    createAddLiquidityToWallet();
  });

  after(() => {
    // Remove added liquidity
    cy.getByTestID("bottom_tab_dex").click();
    cy.getByTestID("dex_tabs_YOUR_POOL_PAIRS_active").click().wait(1000);
    cy.getByTestID(`pool_pair_remove_${tokensPair}`).click().wait(1000);
    cy.getByTestID("75%_amount_button").click().wait(200);
    cy.getByTestID("button_continue_remove_liq").click();
    cy.getByTestID("button_confirm_remove").click().wait(2000);
    cy.closeOceanInterface();
  });

  it("should show the available LP tokens equal to their current liqudity pool", () => {
    cy.getByTestID(`token_balance_${tokensPair}`)
      .should("exist")
      .contains("10.00000000");
  });

  it("should disable continue button and hide helper text by default", () => {
    cy.getByTestID("button_continue_remove_liq").should(
      "have.attr",
      "aria-disabled"
    );
    cy.getByTestID("transaction_details_hint_text").should("not.exist");
  });

  it("show helper text when theres an input and should disable continue button when input is invalid but enable button when input is valid", () => {
    cy.getByTestID("tokens_remove_amount_input").clear().type("10000");
    cy.getByTestID("transaction_details_hint_text").should("exist");
    cy.getByTestID("button_continue_remove_liq").should(
      "have.attr",
      "aria-disabled"
    );
    cy.getByTestID("tokens_remove_amount_input").clear().type("2");
    cy.getByTestID("button_continue_remove_liq").should(
      "not.have.attr",
      "aria-disabled"
    );
    cy.getByTestID("tokens_remove_amount_input").clear();
    cy.getByTestID("button_continue_remove_liq").should(
      "have.attr",
      "aria-disabled"
    );
  });

  it("should show correct calculation summary when input is valid", () => {
    cy.getByTestID("tokens_remove_amount_input").clear().type("5"); // input 2
    validatePriceSectionInfo("pricerate_value");
    cy.getByTestID("pricerate_value_0_label").contains(`${tokenA} to receive`);
    cy.getByTestID("pricerate_value_0_rhsUsdAmount").should(
      "have.text",
      "$5,000.00"
    );
    cy.getByTestID("pricerate_value_1_label").contains(`${tokenB} to receive`);
    cy.getByTestID("pricerate_value_1_rhsUsdAmount").should(
      "have.text",
      "$5,000.00"
    );
  });

  it("should show correct calculation summary based on percentage input", () => {
    validatePriceSelectionAndSummaryBasedOnPercentage();
  });
});

context("Wallet - DEX - Remove Liquidity Confirm Txn", () => {
  beforeEach(() => {
    createAddLiquidityToWallet();
  });

  afterEach(() => {
    cy.getByTestID("pool_pair_row_your").should("not.exist");
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("portfolio_row_17").should("not.exist");
  });

  it("Should be able to remove liquidity", () => {
    cy.getByTestID("MAX_amount_button").click().wait(200);
    cy.getByTestID("pricerate_value_0")
      .invoke("text")
      .then((valueA) => {
        checkValueWithinRange(valueA, "100.00000000");
        cy.getByTestID("pricerate_value_1")
          .invoke("text")
          .then((valueB) => {
            checkValueWithinRange(valueB, "1.00000000");
            cy.getByTestID("button_continue_remove_liq").click();
            cy.getByTestID("button_cancel_remove").click();
            cy.getByTestID("remove_liquidity_calculation_summary").should(
              "exist"
            );
            cy.getByTestID("button_continue_remove_liq").click();
            cy.getByTestID("confirm_title").should(
              "have.text",
              "You are removing LP tokens"
            );
            cy.getByTestID("text_remove_liquidity_amount").should(
              "have.text",
              "10.00000000"
            );
            cy.getByTestID("confirm_pricerate_value_0_label").contains(
              `${tokenA} to receive`
            );
            cy.getByTestID("confirm_pricerate_value_0").should(
              "have.text",
              new BigNumber(valueA).toFixed(8)
            );
            cy.getByTestID("confirm_pricerate_value_1_label").contains(
              `${tokenB} to receive`
            );
            cy.getByTestID("confirm_pricerate_value_1").should(
              "have.text",
              new BigNumber(valueB).toFixed(8)
            );

            cy.getByTestID("button_confirm_remove").click().wait(2000);
            cy.closeOceanInterface();
          });
      });
  });

  it("should be able to remove correct liquidity when user cancel a tx and updated some inputs", () => {
    const oldAmount = "5.00000000";
    const newAmount = "10.00000000";

    // Update input values 50%
    cy.getByTestID("50%_amount_button").click().wait(200);
    cy.getByTestID("pricerate_value_0")
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "50.00000000");
      });
    cy.getByTestID("pricerate_value_0_rhsUsdAmount")
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "5,000.00");
      });
    cy.getByTestID("pricerate_value_1")
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "0.50000000");
      });
    cy.getByTestID("pricerate_value_1_rhsUsdAmount")
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "5,000.00");
      });

    cy.getByTestID("button_continue_remove_liq").click();

    // Fee and resulting section info
    cy.getByTestID("confirm_title").should(
      "have.text",
      "You are removing LP tokens"
    );
    cy.getByTestID("text_remove_liquidity_amount").should(
      "have.text",
      oldAmount
    );
    cy.getByTestID("transaction_fee_title_label").should("exist");
    cy.getByTestID("transaction_fee_title_amount").should("exist");
    cy.getByTestID("resulting_pool_share_title_label").should("exist");
    cy.getByTestID("resulting_pool_share_amount").should(
      "have.text",
      `${oldAmount}%`
    );

    // Prices section info
    cy.getByTestID("confirm_pricerate_value_0_label").contains(
      `${tokenA} to receive`
    );
    cy.getByTestID("confirm_pricerate_value_0")
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "50.00000000");
      });
    cy.getByTestID("confirm_pricerate_value_0_rhsUsdAmount")
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "5,000.00");
      });
    cy.getByTestID("confirm_pricerate_value_1_label").contains(
      `${tokenB} to receive`
    );
    cy.getByTestID("confirm_pricerate_value_1")
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "0.50000000");
      });
    cy.getByTestID("confirm_pricerate_value_1_rhsUsdAmount")
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "5,000.00");
      });

    cy.getByTestID("lp_tokens_to_remove_amount").should("have.text", oldAmount);
    cy.getByTestID("button_confirm_remove").click().wait(2000);
    // Check for authorization page description
    cy.getByTestID("txn_authorization_title").contains(
      `Removing ${new BigNumber(oldAmount).toFixed(
        8
      )} ${tokensPair} from liquidity pool`
    );

    // Cancel send on authorisation page
    cy.getByTestID("cancel_authorization").click();
    cy.getByTestID("button_cancel_remove").click();

    // Update input values MAX
    cy.getByTestID("MAX_amount_button").click().wait(200);
    cy.getByTestID("pricerate_value_0")
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "100.00000000");
      });
    cy.getByTestID("pricerate_value_0_rhsUsdAmount")
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "10,000.00");
      });
    cy.getByTestID("pricerate_value_1")
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "1.00000000");
      });
    cy.getByTestID("pricerate_value_1_rhsUsdAmount")
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "10,000.00");
      });

    cy.getByTestID("button_continue_remove_liq").click();
    cy.getByTestID("confirm_title").should(
      "have.text",
      "You are removing LP tokens"
    );
    cy.getByTestID("text_remove_liquidity_amount").should(
      "have.text",
      newAmount
    );
    cy.getByTestID("button_confirm_remove").click().wait(2000);
    // Check for authorization page description
    cy.getByTestID("txn_authorization_title").contains(
      `Removing ${new BigNumber(newAmount).toFixed(
        8
      )} ${tokensPair} from liquidity pool`
    );
    cy.closeOceanInterface();
  });
});
