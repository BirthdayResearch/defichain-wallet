import BigNumber from "bignumber.js";
import { checkValueWithinRange } from "../../../../support/walletCommands";

function setupWallet(): void {
  cy.createEmptyWallet(true);
  cy.getByTestID("bottom_tab_dex").click();
  cy.sendDFItoWallet()
    .sendDFITokentoWallet()
    .sendTokenToWallet(["BTC"])
    .wait(3000);

  cy.getByTestID("dex_search_icon").click();
  cy.getByTestID("dex_search_input").type("BTC");
  cy.getByTestID("pair_symbol_dBTC-DFI").click();
  cy.getByTestID("poolpair_token_details_add_liquidity").click();
  cy.wait(100);
  cy.getByTestID("token_balance_primary").contains("10");
  cy.getByTestID("token_balance_secondary").contains("19.9");
}

function setupWalletForConversion(): void {
  cy.createEmptyWallet(true);
  cy.getByTestID("bottom_tab_dex").click();
  cy.sendDFItoWallet()
    .sendDFITokentoWallet()
    .sendTokenToWallet(["BTC"])
    .wait(3000)
    .sendTokenToWallet(["BTC"])
    .wait(3000);

  cy.getByTestID("dex_search_icon").click();
  cy.getByTestID("dex_search_input").type("BTC");
  cy.getByTestID("pair_symbol_dBTC-DFI").click();
  cy.getByTestID("poolpair_token_details_add_liquidity").click();
  cy.wait(100);
  cy.getByTestID("token_balance_primary").contains("20");
  cy.getByTestID("token_balance_secondary").contains("19.9");
}

function validatePriceSection(testID: string): void {
  cy.getByTestID(`${testID}_0`).should("have.text", "1.00000000 DFI");
  cy.getByTestID(`${testID}_0_label`).contains("1 dBTC");
  cy.getByTestID(`${testID}_0_rhsUsdAmount`).should("have.text", "$10,000.00");

  cy.getByTestID(`${testID}_1`).should("have.text", "1.00000000 dBTC");
  cy.getByTestID(`${testID}_1_label`).contains("1 DFI");
  cy.getByTestID(`${testID}_1_rhsUsdAmount`).should("have.text", "$10,000.00");
}

function percentageAmountButton(
  percentage: string,
  tokenAAmount: string,
  tokenBAmount: string,
  lpToken: string,
  lpTokenUsd: string
): void {
  if (percentage === "MAX") {
    cy.getByTestID(`${percentage}_amount_button`).first().click();
  } else {
    cy.getByTestID(`${percentage}_amount_button`).first().click();
  }
  cy.getByTestID("token_input_primary").should("have.value", tokenAAmount);
  cy.getByTestID("token_input_secondary").should("have.value", tokenBAmount);

  cy.getByTestID("lp_tokens_to_receive_value").contains(lpToken);
  cy.getByTestID("lp_tokens_to_receive_value_rhsUsdAmount").contains(
    lpTokenUsd
  );
}

context("Wallet - DEX - Add Liquidity", () => {
  before(() => {
    setupWallet();
  });

  it("should update both token and build summary when click on max amount button", () => {
    percentageAmountButton(
      "MAX",
      "10.00000000",
      "10.00000000",
      "10.00000000",
      "$200,000.00"
    );
  });

  it("should display price rates", () => {
    validatePriceSection("pricerate_value");
  });

  it("should view pool share", () => {
    cy.getByTestID("view_pool_shares").click();
    cy.getByTestID("view_pool_details_title").contains("dBTC-DFI");
    cy.getByTestID("volume_24h_dBTC-DFI").contains("$0.00");
    cy.getByTestID("total_liquidity_dBTC-DFI_amount").contains(
      "$20,000,000.00"
    );
    cy.getByTestID("pooled_dBTC_value_USDT").contains("1,000");
    cy.getByTestID("pooled_dBTC_value_USDT_rhsUsdAmount").contains(
      "$10,000,000.00"
    );
    cy.getByTestID("pooled_DFI_value_USDT").contains("1,000");
    cy.getByTestID("pooled_DFI_value_USDT_rhsUsdAmount").contains(
      "$10,000,000.00"
    );
    cy.getByTestID("apr_dBTC-DFI_amount")
      .invoke("text")
      .then((text) => {
        checkValueWithinRange("4,458.84", text, 0.1);
      });
    cy.getByTestID("close_bottom_sheet_button").click();
  });

  it("should update both token and build summary when click on 25% amount button", () => {
    cy.getByTestID("token_input_primary_clear_button").click();
    percentageAmountButton(
      "25%",
      "2.50000000",
      "2.50000000",
      "2.50000000",
      "$50,000.00"
    );
  });

  it("should update both token and build summary when click on half amount button", () => {
    cy.getByTestID("token_input_primary_clear_button").click();
    percentageAmountButton(
      "50%",
      "5.00000000",
      "5.00000000",
      "5.00000000",
      "$100,000.00"
    );
  });

  it("should update both token and build summary when click on 75% amount button", () => {
    cy.getByTestID("token_input_primary_clear_button").click();
    percentageAmountButton(
      "75%",
      "7.50000000",
      "7.50000000",
      "7.50000000",
      "$150,000.00"
    );
  });

  it("should display price rates on confirmation", () => {
    validatePriceSection("pricerate_value");
  });

  it("should update both token and build summary base on primary token input", () => {
    cy.getByTestID("token_input_primary_clear_button").click();
    cy.getByTestID("token_input_primary")
      .invoke("val")
      .should((text) => expect(text).to.contain(""));
    cy.getByTestID("token_input_secondary")
      .invoke("val")
      .should((text) => expect(text).to.contain("0"));

    cy.getByTestID("token_input_primary").type("3");
    cy.getByTestID("token_input_secondary").should("have.value", "3.00000000");

    validatePriceSection("pricerate_value");

    cy.getByTestID("lp_tokens_to_receive_value").contains("3.00000000");
    cy.getByTestID("lp_tokens_to_receive_value_rhsUsdAmount").contains(
      "$60,000.00"
    );
  });

  it("should update both token and build summary base on secondary token input", () => {
    cy.getByTestID("token_input_secondary_clear_button").click();
    cy.getByTestID("token_input_secondary").type("2");

    cy.getByTestID("token_input_primary").should("have.value", "2.00000000");

    validatePriceSection("pricerate_value");

    cy.getByTestID("lp_tokens_to_receive_value").contains("2.00000000");
    cy.getByTestID("lp_tokens_to_receive_value_rhsUsdAmount").contains(
      "$40,000.00"
    );
    cy.getByTestID("button_continue_add_liq").click();
  });

  it("should have correct confirm info", () => {
    cy.getByTestID("text_add_amount").contains("2.00000000");
    cy.getByTestID("transaction_fee_amount").contains("0.00010000 DFI");
    cy.getByTestID("pool_share_amount").contains("0.20000000%");
    cy.getByTestID("dBTC_to_supply").contains("2.00000000");
    cy.getByTestID("dBTC_to_supply_rhsUsdAmount").contains("$20,000.00");
    cy.getByTestID("DFI_to_supply").contains("2.00000000");
    cy.getByTestID("DFI_to_supply_rhsUsdAmount").contains("$20,000.00");
    cy.getByTestID("lp_tokens_to_receive_value").contains("2.00000000");
    cy.getByTestID("lp_tokens_to_receive_value_rhsUsdAmount").contains(
      "$40,000.00"
    );
    cy.getByTestID("button_cancel_add").click();
  });
});

context("Wallet - DEX - Combine Add and Confirm Liquidity Spec", () => {
  before(() => {
    setupWallet();
  });

  it("should get disabled submit button when value is zero", () => {
    cy.getByTestID("token_input_primary").type("0");
    cy.getByTestID("button_continue_add_liq").should(
      "have.attr",
      "aria-disabled"
    );
    cy.getByTestID("token_input_secondary_clear_button").click();
    cy.getByTestID("token_input_secondary").type("0");
    cy.getByTestID("button_continue_add_liq").should(
      "have.attr",
      "aria-disabled"
    );

    cy.getByTestID("dBTC_display_input_text").contains("Available");
    cy.getByTestID("DFI_display_input_text").contains("Available");
    cy.getByTestID("reserved_info_text").should("not.exist");
    cy.getByTestID("dBTC_insufficient_token_display_msg").should("not.exist");
    cy.getByTestID("DFI_insufficient_token_display_msg").should("not.exist");
  });

  it("should get disabled submit button when value is nan", () => {
    cy.getByTestID("token_input_primary_clear_button").click();
    cy.getByTestID("token_input_primary").type("test value");
    cy.getByTestID("button_continue_add_liq").should(
      "have.attr",
      "aria-disabled"
    );
    cy.getByTestID("token_input_secondary_clear_button").click();
    cy.getByTestID("token_input_secondary").type("test value");
    cy.getByTestID("button_continue_add_liq").should(
      "have.attr",
      "aria-disabled"
    );

    cy.getByTestID("dBTC_display_input_text").contains("Available");
    cy.getByTestID("DFI_display_input_text").contains("Available");
    cy.getByTestID("reserved_info_text").should("not.exist");
    cy.getByTestID("dBTC_insufficient_token_display_msg").should("not.exist");
    cy.getByTestID("DFI_insufficient_token_display_msg").should("not.exist");
  });

  it("should get disabled submit button when value is more than input token A and token B", () => {
    cy.getByTestID("token_input_primary_clear_button").click();
    cy.getByTestID("token_input_primary").type("20.00000000");
    cy.getByTestID("button_continue_add_liq").should(
      "have.attr",
      "aria-disabled"
    );
    cy.getByTestID("token_input_secondary_clear_button").click();
    cy.getByTestID("token_input_secondary").type("15.00000000");
    cy.getByTestID("button_continue_add_liq").should(
      "have.attr",
      "aria-disabled"
    );

    cy.getByTestID("dBTC_display_input_text").should(
      "not.have.text",
      "Available"
    );
    cy.getByTestID("DFI_display_input_text").should(
      "not.have.text",
      "Available"
    );
    cy.getByTestID("dBTC_insufficient_token_display_msg").should("exist");
    cy.getByTestID("DFI_insufficient_token_display_msg").should("not.exist");
    cy.getByTestID("reserved_info_text").should("not.exist");
  });

  it("should get disabled submit button when max for token A, while token B doesn't have enough balanceB", () => {
    cy.sendTokenToWallet(["BTC"]).wait(3000);
    cy.getByTestID("token_input_primary_clear_button").click();
    cy.getByTestID("MAX_amount_button").first().click();
    cy.getByTestID("button_continue_add_liq").should(
      "have.attr",
      "aria-disabled"
    );

    cy.getByTestID("dBTC_display_input_text").contains("Available");
    cy.getByTestID("DFI_display_input_text").should(
      "not.have.text",
      "Available"
    );
    cy.getByTestID("dBTC_insufficient_token_display_msg").should("not.exist");
    cy.getByTestID("DFI_insufficient_token_display_msg").should("exist");
    cy.getByTestID("reserved_info_text").should("not.exist");
  });

  it("should get disabled submit button when max for token B, while token A doesn't have enough balanceB", () => {
    cy.sendDFITokentoWallet().sendDFITokentoWallet().wait(3000);
    cy.getByTestID("MAX_amount_button").eq(1).click();
    cy.getByTestID("button_continue_add_liq").should(
      "have.attr",
      "aria-disabled"
    );

    cy.getByTestID("dBTC_display_input_text").should(
      "not.have.text",
      "Available"
    );
    cy.getByTestID("DFI_display_input_text").should(
      "not.have.text",
      "Available"
    );
    cy.getByTestID("dBTC_insufficient_token_display_msg").should("exist");
    cy.getByTestID("DFI_insufficient_token_display_msg").should("not.exist");
    cy.getByTestID("dBTC_reserved_info_text").should("not.exist");
    cy.getByTestID("DFI_reserved_info_text").should("exist");
  });

  it("should get redirect to confirm page after clicking on continue", () => {
    cy.getByTestID("MAX_amount_button").first().click();
    cy.getByTestID("button_continue_add_liq").should(
      "not.have.attr",
      "disabled"
    );

    cy.getByTestID("dBTC_display_input_text").contains("Available");
    cy.getByTestID("DFI_display_input_text").contains("Available");
    cy.getByTestID("DFI_insufficient_token_display_msg").should("not.exist");
    cy.getByTestID("dBTC_insufficient_token_display_msg").should("not.exist");
    cy.getByTestID("DFI_reserved_info_text").should("not.exist");
    cy.getByTestID("dBTC_reserved_info_text").should("not.exist");

    cy.getByTestID("button_continue_add_liq").click();
    cy.url().should("include", "DEX/ConfirmAddLiquidity");
  });
});

context("Wallet - DEX - Add Liquidity Confirm Txn", () => {
  beforeEach(() => {
    setupWallet();
  });

  afterEach(() => {
    cy.getByTestID("dex_tabs_YOUR_POOL_PAIRS").click();
    cy.getByTestID("pool_share_amount_17").contains("10.00000000");
    cy.getByTestID("pool_pair_row_0_dBTC-DFI").click();
    cy.getByTestID("your_lp_tokenA_value").contains("9.99999999");
    cy.getByTestID("your_lp_tokenB_value").contains("9.99999999");

    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("portfolio_row_17").should("exist");
    cy.getByTestID("portfolio_row_17_symbol").contains("dBTC-DFI");
    // Remove added liquidity
    cy.getByTestID("bottom_tab_dex").click();
    cy.getByTestID("bottom_tab_dex").click();
    cy.getByTestID("dex_tabs_YOUR_POOL_PAIRS_active").click();
    cy.getByTestID("pool_pair_remove_dBTC-DFI").click();
    cy.getByTestID("MAX_amount_button").click();
    cy.getByTestID("button_continue_remove_liq").click();
    cy.getByTestID("button_confirm_remove").click().wait(2000);
    cy.closeOceanInterface();
  });

  it("should have updated confirm info", () => {
    cy.getByTestID("token_input_primary").type("10");
    cy.getByTestID("button_continue_add_liq").click();
    cy.getByTestID("transaction_fee_amount").contains("0.00010000 DFI");
    cy.getByTestID("pool_share_amount").contains("1.00000000%");
    cy.getByTestID("dBTC_to_supply").contains("10.00000000");
    cy.getByTestID("dBTC_to_supply_rhsUsdAmount").contains("$100,000.00");
    cy.getByTestID("DFI_to_supply").contains("10.00000000");
    cy.getByTestID("DFI_to_supply_rhsUsdAmount").contains("$100,000.00");
    cy.getByTestID("lp_tokens_to_receive_value").contains("10.00000000");
    cy.getByTestID("lp_tokens_to_receive_value_rhsUsdAmount").contains(
      "$200,000.00"
    );
    cy.getByTestID("button_confirm_add").click().wait(3000);
    cy.closeOceanInterface();
    cy.getByTestID("dex_search_input_close").click();
  });

  it("should be able to add correct liquidity when user cancel a tx and updated some inputs", () => {
    const oldAmount = "5.00000000";
    const oldUsdAmount = "$50,000.00";
    const newAmount = "10.00000000";
    const newUsdAmount = "$100,000.00";
    cy.getByTestID("token_input_primary").type(oldAmount);
    cy.getByTestID("button_continue_add_liq").click();
    cy.getByTestID("transaction_fee_amount").contains("0.00010000 DFI");
    cy.getByTestID("pool_share_amount").contains("0.50000000%");
    cy.getByTestID("dBTC_to_supply").contains(oldAmount);
    cy.getByTestID("dBTC_to_supply_rhsUsdAmount").contains(oldUsdAmount);
    cy.getByTestID("DFI_to_supply").contains(oldAmount);
    cy.getByTestID("DFI_to_supply_rhsUsdAmount").contains(oldUsdAmount);
    cy.getByTestID("lp_tokens_to_receive_value").contains(oldAmount);
    cy.getByTestID("lp_tokens_to_receive_value_rhsUsdAmount").contains(
      "$100,000.00"
    );
    cy.getByTestID("button_confirm_add").click().wait(3000);
    // Check for authorization page description
    cy.getByTestID("txn_authorization_title").contains(
      `Adding ${oldAmount} dBTC-DFI to liquidity pool`
    );
    // Cancel send on authorisation page
    cy.getByTestID("cancel_authorization").click();
    cy.getByTestID("button_cancel_add").click();
    cy.getByTestID("pool_pair_add_dBTC-DFI").click().wait(1000);
    // Update the input amount
    cy.getByTestID("token_input_primary_clear_button").click();
    cy.getByTestID("token_input_primary").type(newAmount);
    cy.getByTestID("button_continue_add_liq").click();
    cy.getByTestID("transaction_fee_amount").contains("0.00010000 DFI");
    cy.getByTestID("pool_share_amount").contains("1.00000000%");
    cy.getByTestID("dBTC_to_supply").contains(newAmount);
    cy.getByTestID("dBTC_to_supply_rhsUsdAmount").contains(newUsdAmount);
    cy.getByTestID("DFI_to_supply").contains(newAmount);
    cy.getByTestID("DFI_to_supply_rhsUsdAmount").contains(newUsdAmount);
    cy.getByTestID("lp_tokens_to_receive_value").contains(newAmount);
    cy.getByTestID("lp_tokens_to_receive_value_rhsUsdAmount").contains(
      "$200,000.00"
    );
    cy.getByTestID("button_confirm_add").click().wait(3000);
    // Check for authorization page description
    cy.getByTestID("txn_authorization_title").contains(
      `Adding ${newAmount} dBTC-DFI to liquidity pool`
    );
    cy.closeOceanInterface();
    cy.getByTestID("dex_search_input_close").click();
  });
});

context("Wallet - DEX - Add Liquidity with Conversion", () => {
  beforeEach(() => {
    setupWalletForConversion();
  });

  it("should be able to display conversion info", () => {
    cy.getByTestID("MAX_amount_button").last().click();
    cy.getByTestID("reserved_info_text").should("exist");
    cy.getByTestID("dBTC_display_input_text").should("contain", "Available");
    cy.getByTestID("DFI_reserved_info_text").should(
      "contain",
      "A small UTXO amount (0.1 DFI) is reserved for fees."
    );
    cy.getByTestID("transaction_details_hint_text").contains(
      "By continuing, the required amount of DFI will be converted"
    );
  });

  it("should trigger convert and add liquidity", () => {
    cy.getByTestID("token_input_primary").type("11");
    cy.getByTestID("button_continue_add_liq").click();
    cy.getByTestID("txn_authorization_title").contains(
      `Convert ${new BigNumber("1").toFixed(8)} DFI to tokens`
    );
    cy.closeOceanInterface().wait(3000);
    cy.getByTestID("conversion_status").should("exist");
    cy.getByTestID("text_add_amount").should("contain", "11.00000000");
    cy.getByTestID("button_confirm_add").click().wait(3000);
    cy.closeOceanInterface();
  });
});
