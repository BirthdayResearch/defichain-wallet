import BigNumber from "bignumber.js";
import { VaultStatus } from "../../../../../app/screens/AppNavigator/screens/Loans/VaultStatusTypes";
import { checkValueWithinRange } from "../../../../support/walletCommands";

function addCollateral(): void {
  cy.go("back");
  cy.wait(2000);
  cy.getByTestID("vault_card_0_status").contains("READY");
  cy.getByTestID("vault_card_0_collateral_token_group_DFI").should("exist");
  cy.getByTestID("vault_card_0_collateral_token_group_dBTC").should("exist");
  cy.getByTestID("vault_card_0_total_collateral").contains("$1,500.00");
}

function sendTokenToRandomAddress(tokenId: string, isMax = false): void {
  const randomAddress = "bcrt1qnr4cxeu5dx6nk0u8qr5twppzd0uq7m5wygfhz3";
  cy.getByTestID("bottom_tab_portfolio").click().wait(4000);
  cy.getByTestID(`portfolio_row_${tokenId}`).click();
  cy.getByTestID("send_button").click();
  cy.getByTestID("address_input").clear().type(randomAddress).blur();
  isMax
    ? cy.getByTestID("MAX_amount_button").click()
    : cy.getByTestID("amount_input").clear().type("10").blur();
  cy.getByTestID("button_confirm_send_continue").click();
  cy.getByTestID("button_confirm_send").click().wait(3000);
  cy.closeOceanInterface();
}

function validate50PercentButton(
  loanTokenSymbol: string,
  paymentTokenSymbol: string,
  loanToPaymentTokenRate: number,
  canPayWholeLoanAmount: boolean
): void {
  const penaltyFee = new BigNumber(1.01);
  cy.getByTestID("50%_amount_button").click();
  if (canPayWholeLoanAmount) {
    cy.getByTestID("payback_input_text_error").should("not.exist");
    cy.getByTestID("button_confirm_payback_loan_continue").should(
      "not.have.attr",
      "aria-disabled"
    );
    cy.getByTestID("loan_outstanding_balance")
      .invoke("text")
      .then((text) => {
        const outstandingBalance = new BigNumber(
          text.replace(loanTokenSymbol, "").trim()
        );
        if (loanTokenSymbol === paymentTokenSymbol) {
          cy.getByTestID("payback_input_text")
            .invoke("val")
            .then((text) => {
              checkValueWithinRange(
                text,
                outstandingBalance.div(2).toFixed(8),
                1
              );
            });
        } else {
          cy.getByTestID("payback_input_text")
            .invoke("val")
            .then((text) => {
              checkValueWithinRange(
                text,
                outstandingBalance
                  .multipliedBy(loanToPaymentTokenRate)
                  .multipliedBy(penaltyFee)
                  .div(2)
                  .toFixed(8),
                1
              );
            });
        }
        cy.getByTestID("loan_payment_percentage").should("have.text", "50.00%");
      });
    return;
  }

  cy.getByTestID("available_token_balance")
    .invoke("text")
    .then((text) => {
      const availableBalance = new BigNumber(
        text.replace(paymentTokenSymbol, "").trim()
      );
      if (availableBalance.isZero()) {
        cy.getByTestID("button_confirm_payback_loan_continue").should(
          "have.attr",
          "aria-disabled"
        );
        cy.getByTestID("payback_input_text").should(
          "have.value",
          new BigNumber(0).toFixed(8)
        );
        return;
      }
      cy.getByTestID("payback_input_text")
        .invoke("val")
        .then((text) => {
          checkValueWithinRange(text, availableBalance.div(2).toFixed(8), 1);
        });
    });
}

function validateMaxButton(
  loanTokenSymbol: string,
  paymentTokenSymbol: string,
  loanToPaymentTokenRate: number,
  canPayWholeLoanAmount: boolean
): void {
  cy.getByTestID("MAX_amount_button").click();
  if (canPayWholeLoanAmount) {
    const penaltyFee = new BigNumber(1.01);
    cy.getByTestID("payback_input_text_error").should("not.exist");
    cy.getByTestID("button_confirm_payback_loan_continue").should(
      "not.have.attr",
      "aria-disabled"
    );
    cy.getByTestID("loan_payment_percentage").should("have.text", "100.00%");

    if (loanTokenSymbol === paymentTokenSymbol) {
      cy.getByTestID("loan_outstanding_balance")
        .invoke("text")
        .then((text) => {
          const outstandingBalance = new BigNumber(
            text.replace(loanTokenSymbol, "").trim()
          );
          cy.getByTestID("payback_input_text").should(
            "have.value",
            outstandingBalance.toFixed(8)
          );
        });
    } else {
      cy.getByTestID("loan_outstanding_balance")
        .invoke("text")
        .then((text) => {
          const outstandingBalance = new BigNumber(
            text.replace(loanTokenSymbol, "").trim()
          );
          cy.getByTestID("payback_input_text")
            .invoke("val")
            .then((text) => {
              checkValueWithinRange(
                text,
                outstandingBalance
                  .multipliedBy(loanToPaymentTokenRate)
                  .multipliedBy(penaltyFee)
                  .toFixed(8),
                1
              );
            });
        });
    }
    return;
  }

  cy.getByTestID("available_token_balance")
    .invoke("text")
    .then((text) => {
      const availableBalance = new BigNumber(
        text.replace(paymentTokenSymbol, "").trim()
      );
      if (availableBalance.isZero()) {
        cy.getByTestID("button_confirm_payback_loan_continue").should(
          "have.attr",
          "aria-disabled"
        );
        cy.getByTestID("payback_input_text").should(
          "have.value",
          new BigNumber(0).toFixed(8)
        );
        cy.getByTestID("loan_payment_percentage").should("have.text", "0%");
        return;
      }
      cy.getByTestID("payback_input_text")
        .invoke("val")
        .then((text) => {
          checkValueWithinRange(text, availableBalance.toFixed(8), 1);
        });
    });
}

function borrowFirstLoan(loanTokenSymbol: string, amount: string = "10"): void {
  const amountToBorrow = new BigNumber(amount).toFixed(8);
  cy.getByTestID("button_browse_loans").click();
  cy.getByTestID(
    `loans_action_button_${loanTokenSymbol}_borrow_button_loans_cards`
  ).click();
  cy.getByTestID("form_input_borrow").clear().type(amountToBorrow);
  cy.wait(3000);
  cy.getByTestID("borrow_loan_submit_button").click();
  cy.getByTestID("text_borrow_amount").contains(amountToBorrow);
  cy.getByTestID("text_borrow_amount_suffix").contains(loanTokenSymbol);
  cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
  cy.getByTestID("txn_authorization_description").contains(
    `Borrowing ${amountToBorrow} ${loanTokenSymbol}`
  );
  cy.closeOceanInterface();
}

context("Wallet - Loans - Payback DUSD Loans", () => {
  let vaultId = "";
  const walletTheme = { isDark: false };
  before(() => {
    cy.setFeatureFlags(["dusd_loan_payment", "dfi_loan_payment"]);
    cy.createEmptyWallet(true);
    cy.sendDFITokentoWallet()
      .sendDFITokentoWallet()
      .sendDFItoWallet()
      .sendTokenToWallet(["BTC"])
      .wait(6000);
    cy.setWalletTheme(walletTheme);
    cy.go("back");
    cy.getByTestID("bottom_tab_dex").click();
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.getByTestID("empty_vault").should("exist");
    cy.createVault(0);
    cy.getByTestID("vault_card_0_manage_loans_button").should("not.exist");
    cy.getByTestID("vault_card_0_vault_id").then(($txt: any) => {
      vaultId = $txt[0].textContent;
    });
    cy.getByTestID("vault_card_0_edit_collaterals_button").click();
    cy.addCollateral("10", "DFI");
    cy.addCollateral("10", "dBTC");
  });

  it("should add collateral", () => {
    addCollateral();
  });

  it("should add DUSD loan", () => {
    cy.getByTestID("vault_card_0_manage_loans_button").click();
    borrowFirstLoan("DUSD");
  });

  it("should show payment tokens for DUSD loans regardless of wallet balance", () => {
    cy.intercept("**/address/**/tokens?size=*", {
      body: {
        data: [],
      },
    }).as("getTokens");
    cy.getByTestID("vault_card_0_manage_loans_button").click();
    cy.getByTestID("loan_card_DUSD_payback_loan").click();
    cy.wait("@getTokens").then(() => {
      cy.getByTestID("payment_token_card_DUSD").should("exist");
      cy.getByTestID("payment_token_card_DFI").should("exist");
    });

    cy.getByTestID("payment_token_card_DFI").click();
    cy.getByTestID("text_penalty_fee_warning").contains(
      "A 5% fee is applied when you pay with DFI."
    );
    cy.getByTestID("payment_token_card_DUSD").click();
  });

  it("should display loan amount and its USD value", () => {
    cy.getByTestID("loan_outstanding_balance")
      .invoke("text")
      .then((text) => {
        const outstandingBalance = new BigNumber(
          text.replace("DUSD", "").trim()
        );
        checkValueWithinRange(outstandingBalance.toFixed(8), "10", 0.05);
      });
    cy.getByTestID("loan_outstanding_balance_usd").should(
      "have.text",
      "≈ $10.00"
    );
  });

  /* Paying DUSD with DUSD */
  it("should have 0 available DUSD", () => {
    sendTokenToRandomAddress("12"); // Empty out DUSD in wallet
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("available_token_balance").should(
      "have.text",
      "0.00000000 DUSD"
    );
  });

  it("should display 0 if MAX/50% button is pressed with 0 DUSD", () => {
    validate50PercentButton("DUSD", "DUSD", 1, false);
    validateMaxButton("DUSD", "DUSD", 1, false);
  });

  /* Paying DUSD with DFI */
  it("should display 50% of loan amount if 50% button is pressed with sufficient DFI", () => {
    cy.getByTestID("payment_token_card_DFI").click();
    cy.getByTestID("50%_amount_button").click();
    cy.getByTestID("button_confirm_payback_loan_continue").should(
      "not.have.attr",
      "aria-disabled"
    );
    cy.getByTestID("payback_input_text")
      .invoke("val")
      .then((text) => {
        checkValueWithinRange(text, "0.05", 0.0005);
      });
    cy.getByTestID("loan_payment_percentage").should("have.text", "50.00%");
  });

  it("should cap to available DFI balance if MAX button is pressed with sufficient DFI", () => {
    cy.getByTestID("MAX_amount_button").click();
    cy.getByTestID("button_confirm_payback_loan_continue").should(
      "not.have.attr",
      "aria-disabled"
    );
    cy.getByTestID("payback_input_text")
      .invoke("val")
      .then((text) => {
        checkValueWithinRange(text, "0.1", 0.0005);
      });
  });

  /* Paying DUSD sufficient DUSD */
  it("should update available balance on top up", () => {
    cy.sendTokenToWallet(["DUSD", "DUSD"]).wait(10000);
  });

  it("should display vault info", () => {
    cy.getByTestID("toggle_resulting_col").click().wait(1000);
    cy.getByTestID("resulting_col").should("have.text", "N/A");
    cy.getByTestID("text_vault_id").should("have.text", vaultId);
    cy.getByTestID("text_min_col_ratio").should("have.text", "150.00%");
    cy.getByTestID("text_total_collateral_usd").should(
      "have.text",
      "$1,500.00"
    );
    cy.getByTestID("text_total_loan_usd")
      .invoke("text")
      .then((text) => {
        const totalLoanUSD = new BigNumber(text.replace("$", "").trim());
        checkValueWithinRange(
          totalLoanUSD.toFixed(8),
          new BigNumber(10).toFixed(8),
          0.05
        );
      });
  });

  it("should display 50% of loan amount if 50% button is pressed with sufficient DUSD", () => {
    cy.getByTestID("payment_token_card_DUSD").click();
    cy.getByTestID("50%_amount_button").click();
    cy.getByTestID("payback_input_text_error").should("not.exist");
    cy.getByTestID("button_confirm_payback_loan_continue").should(
      "not.have.attr",
      "aria-disabled"
    );
    cy.getByTestID("loan_outstanding_balance")
      .invoke("text")
      .then((text) => {
        const outstandingBalance = new BigNumber(
          text.replace("DUSD", "").trim()
        );
        cy.getByTestID("payback_input_text").should(
          "have.value",
          outstandingBalance.div(2).toFixed(8)
        );
        cy.getByTestID("loan_payment_percentage").should("have.text", "50.00%");
      });
  });

  it("should display 100% of loan amount if MAX button is pressed with sufficient DUSD", () => {
    validateMaxButton("DUSD", "DUSD", 10, true);
  });

  it("should display excess amount details when paying with DUSD", () => {
    cy.getByTestID("payback_input_text").clear().type("20").blur();
    cy.getByTestID("loan_outstanding_balance")
      .invoke("text")
      .then((text) => {
        const outstandingBalance = new BigNumber(
          text.replace("DUSD", "").trim()
        );
        const excessAmount = new BigNumber(20).minus(outstandingBalance);
        cy.getByTestID("text_excess_amount").should(
          "have.text",
          excessAmount.toFixed(8)
        );
      });
  });

  it("should display conversion if DFI UTXO to pay whole loan amount", () => {
    cy.intercept("**/balance", {
      data: 10.0,
    }).as("getUTXO");
    cy.intercept("**/address/**/tokens?size=*", {
      body: {
        data: [],
      },
    }).as("getTokens");
    cy.getByTestID("payment_token_card_DFI").click();
    cy.wait("@getUTXO")
      .wait("@getTokens")
      .then(() => {
        cy.wait(2000);
        cy.getByTestID("MAX_amount_button").click();
        cy.getByTestID("conversion_info_text").should("exist");
      });
  });

  it("should not display conversion if DFI UTXO is < 0.1", () => {
    cy.intercept("**/balance", {
      data: 0.05,
    }).as("getUTXO");
    cy.intercept("**/address/**/tokens?size=*", {
      body: {
        data: [],
      },
    }).as("getTokens");
    cy.wait("@getUTXO")
      .wait("@getTokens")
      .then(() => {
        cy.wait(2000);
        cy.getByTestID("payment_token_card_DFI").click();
        cy.getByTestID("MAX_amount_button").click();
        cy.getByTestID("conversion_info_text").should("not.exist");
      });
  });

  /* This is a cypress issue. Tested that it works as expected when executing the steps out of cypress */
  // it('should be able to payback DUSD loans with DUSD', function () {
  //   cy.getByTestID('payback_input_text').clear().type('11').blur()
  //   cy.getByTestID('loan_outstanding_balance').invoke('text').then(text => {
  //     const outstandingBalance = new BigNumber(text.replace('DUSD', '').trim())
  //     cy.getByTestID('text_excess_amount').contains(new BigNumber(11).minus(outstandingBalance).toFixed(8))
  //   })

  //   cy.getByTestID('button_confirm_payback_loan_continue').click().wait(3000)
  //   cy.getByTestID('text_transaction_type').contains('Loan payment')
  //   cy.getByTestID('text_payment_amount').contains('11.00000000')
  //   cy.getByTestID('text_payment_amount_suffix').contains('DUSD')
  //   cy.getByTestID('text_resulting_loan_amount').contains('0.00000000')
  //   cy.getByTestID('text_resulting_loan_amount_suffix').contains('DUSD')
  //   cy.getByTestID('tokens_to_pay').contains('11.00000000')
  //   cy.getByTestID('tokens_to_pay_suffix').contains('DUSD')
  //   cy.getByTestID('text_vault_id').contains(vaultId)
  //   cy.getByTestID('text_current_collateral_ratio').contains('N/A')
  //   cy.getByTestID('button_confirm_payback_loan').click().wait(4000)
  //   cy.getByTestID('txn_authorization_description')
  //     .contains('Paying 11.00000000 DUSD')
  //   cy.closeOceanInterface()
  //   cy.wait(3000)
  // })
});

context("Wallet - Loans Payback Non-DUSD Loans", () => {
  let vaultId = "";
  const walletTheme = { isDark: false };

  before(() => {
    cy.setFeatureFlags(["dusd_loan_payment", "dfi_loan_payment"]);
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(["BTC"])
      .wait(6000);
    cy.setWalletTheme(walletTheme);
    cy.go("back");
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.getByTestID("empty_vault").should("exist");
    cy.createVault(0);
    cy.getByTestID("vault_card_0_manage_loans_button").should("not.exist");
    cy.getByTestID("vault_card_0_vault_id").then(($txt: any) => {
      vaultId = $txt[0].textContent;
    });
    cy.getByTestID("vault_card_0_edit_collaterals_button").click();
    cy.addCollateral("10", "DFI");
    cy.addCollateral("10", "dBTC");
  });

  it("should add collateral", () => {
    addCollateral();
  });

  it("should borrow dTU10 loan", () => {
    cy.getByTestID("vault_card_0_manage_loans_button").click();
    cy.getByTestID("button_browse_loans").click();
    cy.getByTestID(
      "loans_action_button_dTU10_borrow_button_loans_cards"
    ).click();

    cy.getByTestID("form_input_borrow").clear().type("10").blur();
    cy.wait(3000);
    cy.getByTestID("borrow_loan_submit_button").click();
    cy.getByTestID("text_borrow_amount").contains("10.00000000");
    cy.getByTestID("text_borrow_amount_suffix").contains("dTU10");
    cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
    cy.getByTestID("txn_authorization_description").contains(
      "Borrowing 10.00000000 dTU10"
    );
    cy.closeOceanInterface();
  });

  it("should show payment tokens for DUSD loans regardless of wallet balance", () => {
    cy.intercept("**/address/**/tokens?size=*", {
      body: {
        data: [],
      },
    }).as("getTokens");
    cy.getByTestID("vault_card_0_manage_loans_button").click();
    cy.getByTestID("loan_card_dTU10_payback_loan").click();
    cy.wait("@getTokens").then(() => {
      cy.getByTestID("payment_token_card_dTU10").should("exist");
      cy.getByTestID("payment_token_card_DUSD").should("exist");
    });

    cy.getByTestID("payment_token_card_DUSD").click();
    cy.getByTestID("text_penalty_fee_warning").contains(
      "A 5% fee is applied when you pay with DUSD."
    );
    cy.getByTestID("payment_token_card_dTU10").click();
  });

  /* Paying dTU10 with dTU10 balance */
  it("should topup dTU10 to pay for previous dTU10 loan", () => {
    cy.sendTokenToWallet(["TU10"]).wait(6000);
  });

  it("should display 50% of loan amount if 50% button is pressed with sufficient dTU10", () => {
    validate50PercentButton("dTU10", "dTU10", 1, true);
  });

  it("should display 100% of loan amount if MAX button is pressed with sufficient dTU10", () => {
    validateMaxButton("dTU10", "dTU10", 1, true);
  });

  it("should display loan amount and its USD value", () => {
    cy.getByTestID("loan_outstanding_balance")
      .invoke("text")
      .then((text) => {
        const outstandingBalance = new BigNumber(
          text.replace("dTU10", "").trim()
        );
        checkValueWithinRange(
          outstandingBalance.toFixed(8),
          new BigNumber(10).toFixed(8),
          0.05
        );
      });
    cy.getByTestID("loan_outstanding_balance_usd")
      .invoke("text")
      .then((text) => {
        const outstandingBalanceUSD = new BigNumber(
          text.replace("≈ $", "").trim()
        );
        checkValueWithinRange(
          outstandingBalanceUSD.toFixed(2),
          new BigNumber(100).toFixed(2),
          5
        );
      });
  });

  it("should display insufficient error if dTU10 is not enough", () => {
    cy.getByTestID("payback_input_text").clear().type("100");
    cy.getByTestID("payback_input_text_error").should(
      "have.text",
      "Insufficient dTU10 to pay for the entered amount"
    );
  });

  it("should be able to payback dTU10 loans with dTU10", () => {
    cy.getByTestID("payback_input_text").clear().type("12").blur();
    cy.getByTestID("button_confirm_payback_loan_continue").click().wait(3000);
    cy.getByTestID("confirm_title").contains("You are paying");
    cy.getByTestID("text_payment_amount").contains("12.00000000");
    cy.getByTestID("text_payment_amount_suffix").contains("dTU10");
    cy.getByTestID("text_transaction_type").contains("Loan payment");
    cy.getByTestID("tokens_to_pay").contains("12.00000000");
    cy.getByTestID("tokens_to_pay_suffix").contains("dTU10");
    cy.getByTestID("text_resulting_loan_amount").contains("0.00000000");
    cy.getByTestID("text_resulting_loan_amount_suffix").contains("dTU10");
    cy.getByTestID("text_vault_id").contains(vaultId);
    cy.getByTestID("text_current_collateral_ratio").contains("N/A");
    cy.getByTestID("button_confirm_payback_loan").click().wait(4000);
    cy.getByTestID("txn_authorization_description").contains(
      "Paying 12.00000000 dTU10"
    );
    cy.closeOceanInterface();
    cy.wait(3000);
    cy.checkVaultTag(
      "READY",
      VaultStatus.Ready,
      "vault_card_0_status",
      walletTheme.isDark
    );
  });

  it("should have 0 available dTU10", () => {
    sendTokenToRandomAddress("13", true); // Empty out dTU10 in wallet
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("vault_card_0_manage_loans_button").click();
    cy.getByTestID("button_browse_loans").should("exist");
  });

  it("should borrow dTU10 loan to be paid with DUSD", () => {
    borrowFirstLoan("dTU10", "3");
    cy.getByTestID("vault_card_0_manage_loans_button").click();
    cy.getByTestID("loan_card_dTU10_payback_loan").click();
  });

  /* Paying dTU10 with DUSD balance */
  it("should display 0 if MAX/50% button is pressed with 0 DUSD", () => {
    cy.getByTestID("payment_token_card_DUSD").click();
    validateMaxButton("dTU10", "DUSD", 10, false);
    validate50PercentButton("dTU10", "DUSD", 1, false);
  });

  it("should display 50% of available balance if 50% button is pressed with insufficient DUSD", () => {
    cy.sendTokenToWallet(["DUSD", "DUSD"]).wait(10000);
    validate50PercentButton("dTU10", "DUSD", 10, false);
  });

  it("should display 100% of loan amount if MAX button is pressed with insufficient DUSD", () => {
    validateMaxButton("dTU10", "DUSD", 10, false);
  });

  it("should display 50% of loan amount if 50% button is pressed with sufficient DUSD", () => {
    cy.sendTokenToWallet(["DUSD", "DUSD"]).wait(10000);
    validate50PercentButton("dTU10", "DUSD", 10, true);
  });

  it("should display 100% of loan amount if MAX button is pressed with sufficient DUSD", () => {
    validateMaxButton("dTU10", "DUSD", 10, true);
  });

  it("should display insufficient error if DUSD is not enough", () => {
    cy.getByTestID("payback_input_text").clear().type("100");
    cy.getByTestID("payback_input_text_error").should(
      "have.text",
      "Insufficient DUSD to pay for the entered amount"
    );
  });

  it("should be able to partially payback dTU10 loans with DUSD", () => {
    cy.getByTestID("payback_input_text").clear().type("20");
    cy.getByTestID("button_confirm_payback_loan_continue").click().wait(3000);
    cy.getByTestID("confirm_title").contains("You are paying");
    cy.getByTestID("text_payment_amount").contains("20.00000000");
    cy.getByTestID("text_payment_amount_suffix").contains("DUSD");
    cy.getByTestID("text_transaction_type").contains("Loan payment");
    cy.getByTestID("tokens_to_pay").contains("20.00000000");
    cy.getByTestID("tokens_to_pay_suffix").contains("DUSD");
    cy.getByTestID("text_resulting_loan_amount_suffix").contains("dTU10");
    cy.getByTestID("text_vault_id").contains(vaultId);
    cy.getByTestID("button_confirm_payback_loan").click().wait(4000);
    cy.getByTestID("txn_authorization_description").contains(
      "Paying 20.00000000 DUSD"
    );
    cy.closeOceanInterface();
    cy.wait(3000);
    cy.checkVaultTag(
      "ACTIVE",
      VaultStatus.Healthy,
      "vault_card_0_status",
      walletTheme.isDark
    );
  });
});
