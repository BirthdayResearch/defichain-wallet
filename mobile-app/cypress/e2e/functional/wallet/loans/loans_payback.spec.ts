import BigNumber from "bignumber.js";
import { checkValueWithinRange } from "../../../../support/walletCommands";

BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

function createWalletAndVault(): void {
  const walletTheme = { isDark: false };
  cy.createEmptyWallet(true);
  cy.sendDFITokentoWallet()
    .sendDFITokentoWallet()
    .sendDFItoWallet()
    .sendTokenToWallet(["BTC"])
    .wait(6000);
  cy.setWalletTheme(walletTheme);
  cy.go("back");
  cy.getByTestID("bottom_tab_loans").click();
  cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
  cy.getByTestID("empty_vault").should("exist");
  cy.createVault(0);
  cy.getByTestID("vault_card_0_borrow_button").should("not.exist");
  cy.getByTestID("vault_card_0_EMPTY_vault_id").should("exist");
  cy.getByTestID("vault_card_0_EMPTY_add_collateral_button").click();
  cy.addCollateral("10", "DFI");
  cy.getByTestID("vault_card_0").click();
  cy.getByTestID("action_add").click();
  cy.addCollateral("10", "dBTC");
}

function addCollateral(): void {
  cy.getByTestID("vault_card_0_status").contains("Ready");
  cy.getByTestID("vault_card_0_collateral_token_group_DFI").should("exist");
  cy.getByTestID("vault_card_0_collateral_token_group_dBTC").should("exist");
  cy.getByTestID("vault_card_0_total_collateral_amount").contains("$1,500.00");
}

function sendTokenToRandomAddress(tokenId: string, isMax = false): void {
  const randomAddress = "bcrt1qnr4cxeu5dx6nk0u8qr5twppzd0uq7m5wygfhz3";
  cy.getByTestID("bottom_tab_portfolio").click().wait(4000);
  cy.getByTestID(`portfolio_row_${tokenId}`).click();
  cy.getByTestID("send_button").click();
  cy.getByTestID("address_input").clear().type(randomAddress).blur();
  if (isMax) {
    cy.getByTestID("max_value")
      .invoke("text")
      .then((maxValue) => {
        cy.getByTestID("amount_input").clear().type(maxValue).blur();
      });
  } else {
    cy.getByTestID("amount_input").clear().type("10").blur();
  }
  cy.getByTestID("button_confirm_send_continue").click();
  cy.getByTestID("button_confirm_send").click().wait(3000);
  cy.closeOceanInterface();
}

function validate50PercentButton(
  loanTokenSymbol: string,
  paymentTokenSymbol: string,
  canPayWholeLoanAmount: boolean
): void {
  cy.getByTestID("50%_amount_button").click();
  if (canPayWholeLoanAmount) {
    cy.getByTestID("continue_payback_loan_message").should("exist");
    cy.getByTestID("button_confirm_payback_loan_continue").should(
      "not.have.attr",
      "aria-disabled"
    );
    cy.getByTestID("total_outstanding_loan_value").should(
      "have.text",
      `0.00000000 ${loanTokenSymbol}`
    );
  }
  cy.getByTestID("available_token_balance")
    .invoke("text")
    .then((text) => {
      const availableToken = new BigNumber(
        text.replace("Available:", "").replace(paymentTokenSymbol, "").trim()
      );
      cy.getByTestID("payback_input_text").should(
        "have.value",
        availableToken.div(2).toFixed(8)
      );
    });
}

function validateMaxButton(
  loanTokenSymbol: string,
  paymentTokenSymbol: string,
  canPayWholeLoanAmount: boolean
): void {
  cy.getByTestID("MAX_amount_button").click();
  if (canPayWholeLoanAmount) {
    cy.getByTestID("continue_payback_loan_message").should("exist");
    cy.getByTestID("button_confirm_payback_loan_continue").should(
      "not.have.attr",
      "aria-disabled"
    );
    cy.getByTestID("total_outstanding_loan_value").should(
      "have.text",
      `0.00000000 ${loanTokenSymbol}`
    );
  }
  cy.getByTestID("available_token_balance")
    .invoke("text")
    .then((text) => {
      const availableBalance = new BigNumber(
        text.replace("Available:", "").replace(paymentTokenSymbol, "").trim()
      );
      cy.getByTestID("payback_input_text")
        .invoke("val")
        .then((val) => {
          checkValueWithinRange(val, availableBalance.toFixed(8), 1);
        });
    });
}

function borrowFirstLoan(loanTokenSymbol: string, amount: string = "10"): void {
  const amountToBorrow = new BigNumber(amount).toFixed(8);
  cy.getByTestID(`select_${loanTokenSymbol}`).click();
  cy.getByTestID("text_input_borrow_amount").clear().type(amountToBorrow);
  cy.getByTestID("borrow_button_submit").click();
  cy.getByTestID("text_borrow_amount").contains(amountToBorrow);
  cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
  cy.getByTestID("txn_authorization_title").contains(
    `Borrowing ${amountToBorrow} ${loanTokenSymbol}`
  );
  cy.closeOceanInterface();
}

function checkPaybackLoanDetails(
  vaultId: string,
  tokenSymbol: string,
  tokenAmount: string
): void {
  cy.getByTestID("payback_loan_title").contains("I WANT TO PAY");
  cy.getByTestID(
    "token_select_button_loan_token_symbol_display_symbol"
  ).contains(tokenSymbol);
  cy.getByTestID("payback_input_text").clear().type(tokenAmount).blur();
  cy.getByTestID("available_token_balance").should("exist");
  cy.getByTestID("lhs_vault_id").contains("Vault ID");
  cy.getByTestID("text_vault_id").contains(vaultId);
  cy.getByTestID("total_outstanding_loan_label_label").contains(
    "Loan remaining"
  );
  cy.getByTestID("total_outstanding_loan_value").should("exist");
  cy.getByTestID("total_outstanding_loan_value_rhsUsdAmount").should("exist");
  cy.getByTestID("text_resulting_col_ratio_collateralization_bar").should(
    "exist"
  );
  cy.getByTestID("continue_payback_loan_message").should("exist");
}

function checkPaybackLoanConfirmDetails(
  vaultId: string,
  tokenSymbol: string,
  tokenAmount: string
): void {
  cy.getByTestID("confirm_title").contains("You are paying");
  cy.getByTestID("text_send_amount").contains(tokenAmount);
  cy.getByTestID("wallet_address").should("exist");
  cy.getByTestID("transaction_fee_label").contains("Transaction fee");
  cy.getByTestID("transaction_fee_value").contains("DFI");
  cy.getByTestID("text_vault_id").contains("Vault ID");
  cy.getByTestID("vault_id").contains(vaultId);
  cy.getByTestID("text_resulting_col_ratio_collateralization_bar").should(
    "exist"
  );
  cy.getByTestID("text_resulting_loan_amount_label").contains("Loan remaining");
  cy.getByTestID("resulting_loan_amount").contains(tokenSymbol);
  cy.getByTestID("text_tokens_to_pay_label").contains("Amount to pay");
  cy.getByTestID("tokens_to_pay").contains(`${tokenAmount} ${tokenSymbol}`);
  cy.getByTestID("confirm_payback_loan_message").contains(
    "Prices may vary during transaction confirmation."
  );
}

context("Wallet - Loans - Payback DUSD Loans", () => {
  let vaultId = "";
  before(() => {
    cy.setFeatureFlags(["dusd_loan_payment", "dfi_loan_payment"]);
    createWalletAndVault();
    cy.getByTestID("vault_card_0_vault_id").then(($txt: any) => {
      vaultId = $txt[0].textContent;
    });
  });

  it("should add collateral", () => {
    addCollateral();
  });

  it("should borrow DUSD loan", () => {
    cy.getByTestID("vault_card_0_borrow_button").contains("Borrow").click();
    borrowFirstLoan("DUSD");
  });

  it("should show payment tokens for DUSD loans regardless of wallet balance", () => {
    cy.intercept("**/address/**/tokens?size=*", {
      body: {
        data: [],
      },
    }).as("getTokens");
    cy.getByTestID("vault_card_0").click();
    cy.wait("@getTokens").then(() => {
      cy.getByTestID("loan_card_DUSD").should("exist");
      cy.getByTestID("loans_action_button_pay_DUSD_loan").should("exist");
    });
    cy.getByTestID("loans_action_button_pay_DUSD_loan").click();
  });

  it("should display DUSD loan amount and its USD value", () => {
    cy.getByTestID("total_outstanding_loan_value")
      .invoke("text")
      .then((text) => {
        const outstandingBalance = text.replace(" DUSD", "").trim();
        checkValueWithinRange(outstandingBalance, "10", 0.05);
      });
    cy.getByTestID("total_outstanding_loan_value_rhsUsdAmount")
      .invoke("text")
      .then((text) => {
        const outstandingBalanceInUsd = text.replace("$", "");
        checkValueWithinRange(outstandingBalanceInUsd, "12", 0.05);
      });
  });

  it("should have 0 available DUSD", () => {
    sendTokenToRandomAddress("12", true); // Empty out DUSD in wallet
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("available_token_balance").contains("0.00000000 DUSD");
  });

  it("should not allow user to continue payback if entered DUSD exceeds available balance", () => {
    cy.getByTestID("payback_input_text").clear().type("100");
    cy.getByTestID("continue_payback_loan_message").should("not.exist");
    cy.getByTestID("button_confirm_payback_loan_continue").should(
      "have.attr",
      "aria-disabled"
    );
  });

  it("should not be able to press 25%-50%-75%-MAX quick inputs with 0 DUSD", () => {
    cy.getByTestID("25%_amount_button").should("have.attr", "aria-disabled");
    cy.getByTestID("50%_amount_button").should("have.attr", "aria-disabled");
    cy.getByTestID("75%_amount_button").should("have.attr", "aria-disabled");
    cy.getByTestID("MAX_amount_button").should("have.attr", "aria-disabled");
  });

  /* Paying DUSD sufficient DUSD */
  it("should update available balance on top up", () => {
    cy.sendTokenToWallet(["DUSD", "DUSD"]).wait(10000);
  });

  it("should display 50% of available DUSD if 50% button is pressed with sufficient DUSD", () => {
    validate50PercentButton("DUSD", "DUSD", false);
  });

  it("should display 100% of loan amount if MAX button is pressed with sufficient DUSD", () => {
    validateMaxButton("DUSD", "DUSD", true);
  });

  it("should allow excess amount when paying DUSD", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("loans_action_button_pay_DUSD_loan").click();
    cy.getByTestID("total_outstanding_loan_value")
      .invoke("text")
      .then((text) => {
        const outstandingBalance = new BigNumber(
          text.replace("DUSD", "").trim()
        );
        const excessiveAmount = outstandingBalance.plus(5);
        cy.getByTestID("payback_input_text")
          .type(excessiveAmount.toFixed(8))
          .blur();
      });
    cy.getByTestID("total_outstanding_loan_value").contains("0.00000000 DUSD");
    cy.getByTestID("continue_payback_loan_message").contains(
      "Any excess payment will be returned."
    );
    cy.getByTestID("button_confirm_payback_loan_continue").should(
      "not.have.attr",
      "aria-disabled"
    );
  });

  it("should be able to payback DUSD loans with DUSD", () => {
    checkPaybackLoanDetails(vaultId, "DUSD", "10");
    cy.getByTestID("continue_payback_loan_message").contains(
      "Review full details in the next screen"
    );
    cy.getByTestID("button_confirm_payback_loan_continue").click().wait(3000);

    checkPaybackLoanConfirmDetails(vaultId, "DUSD", "10.00000000");
    cy.getByTestID("button_confirm_payback_loan").click().wait(4000);
    cy.getByTestID("txn_authorization_title").contains(
      "Paying 10.00000000 DUSD"
    );
    cy.closeOceanInterface();
    cy.wait(3000);
  });
});

context("Wallet - Loans Payback Non-DUSD Loans", () => {
  let vaultId = "";

  before(() => {
    cy.setFeatureFlags(["dusd_loan_payment", "dfi_loan_payment"]);
    createWalletAndVault();
    cy.getByTestID("vault_card_0_vault_id").then(($txt: any) => {
      vaultId = $txt[0].textContent;
    });
  });

  it("should add collateral", () => {
    addCollateral();
  });

  it("should borrow dTU10 loan", () => {
    cy.getByTestID("vault_card_0_borrow_button").contains("Borrow").click();
    borrowFirstLoan("dTU10");
  });

  it("should show payment tokens for non-DUSD loans regardless of wallet balance", () => {
    cy.intercept("**/address/**/tokens?size=*", {
      body: {
        data: [],
      },
    }).as("getTokens");
    cy.getByTestID("vault_card_0").click();
    cy.wait("@getTokens").then(() => {
      cy.getByTestID("loan_card_dTU10").should("exist");
      cy.getByTestID("loans_action_button_pay_dTU10_loan").should("exist");
    });
    cy.getByTestID("loans_action_button_pay_dTU10_loan").click();
  });

  it("should display dTU10 loan amount and its USD value", () => {
    cy.getByTestID("total_outstanding_loan_value")
      .invoke("text")
      .then((text) => {
        const outstandingBalance = text.replace(" dTU10", "");
        checkValueWithinRange(outstandingBalance, "10", 0.05);
      });
    cy.getByTestID("total_outstanding_loan_value_rhsUsdAmount")
      .invoke("text")
      .then((text) => {
        const outstandingBalanceUSD = text.replace("$", "");
        checkValueWithinRange(outstandingBalanceUSD, "105", 5);
      });
  });

  it("should have 0 available dTU10", () => {
    sendTokenToRandomAddress("13", true); // Empty out dTU10 in wallet
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("available_token_balance").contains("0.00000000 dTU10");
  });

  it("should not allow user to continue payback if entered dTU10 exceeds available balance", () => {
    cy.getByTestID("payback_input_text").clear().type("100");
    cy.getByTestID("continue_payback_loan_message").should("not.exist");
    cy.getByTestID("button_confirm_payback_loan_continue").should(
      "have.attr",
      "aria-disabled"
    );
  });

  it("should not be able to press 25%-50%-75%-MAX quick inputs with 0 dTU10", () => {
    cy.getByTestID("25%_amount_button").should("have.attr", "aria-disabled");
    cy.getByTestID("50%_amount_button").should("have.attr", "aria-disabled");
    cy.getByTestID("75%_amount_button").should("have.attr", "aria-disabled");
    cy.getByTestID("MAX_amount_button").should("have.attr", "aria-disabled");
  });

  /* Paying dTU10 with sufficient dTU10 */
  it("should topup dTU10 to pay for previous dTU10 loan", () => {
    cy.sendTokenToWallet(["TU10", "TU10"]).wait(6000);
  });

  it("should display 50% of available dTU10 if 50% button is pressed with sufficient dTU10", () => {
    validate50PercentButton("dTU10", "dTU10", false);
  });

  it("should display 100% of available dTU10 if MAX button is pressed with sufficient dTU10", () => {
    validateMaxButton("dTU10", "dTU10", false);
  });

  it("should allow excess amount when paying Non-DUSD", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("vault_card_0").click();
    cy.getByTestID("loans_action_button_pay_dTU10_loan").click();
    cy.getByTestID("total_outstanding_loan_value")
      .invoke("text")
      .then((text) => {
        const outstandingBalance = new BigNumber(
          text.replace("dTU10", "").trim()
        );
        const excessiveAmount = outstandingBalance.plus(2);
        cy.getByTestID("payback_input_text")
          .type(excessiveAmount.toFixed(8))
          .blur();
      });
    cy.getByTestID("total_outstanding_loan_value").contains("0.00000000 dTU10");
    cy.getByTestID("continue_payback_loan_message").contains(
      "Any excess payment will be returned."
    );
    cy.getByTestID("button_confirm_payback_loan_continue").should(
      "not.have.attr",
      "aria-disabled"
    );
  });

  it("should be able to payback dTU10 loans with dTU10", () => {
    checkPaybackLoanDetails(vaultId, "dTU10", "10");
    cy.getByTestID("continue_payback_loan_message").contains(
      "Review full details in the next screen"
    );
    cy.getByTestID("button_confirm_payback_loan_continue").click().wait(3000);
    checkPaybackLoanConfirmDetails(vaultId, "dTU10", "10.00000000");
    cy.getByTestID("button_confirm_payback_loan").click().wait(4000);
    cy.getByTestID("txn_authorization_title").contains(
      "Paying 10.00000000 dTU10"
    );
    cy.closeOceanInterface();
    cy.wait(3000);
  });
});
