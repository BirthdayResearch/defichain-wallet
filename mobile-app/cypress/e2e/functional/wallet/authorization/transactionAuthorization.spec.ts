function openSendScreen(isRandom: boolean = true): void {
  cy.createEmptyWallet(isRandom);
  cy.sendDFItoWallet().sendTokenToWallet(["BTC"]).wait(5000);
  cy.getByTestID("bottom_tab_portfolio").click();
  cy.getByTestID("portfolio_list").should("exist");
  cy.getByTestID("dfi_total_balance_amount").contains("10.00000000");
  cy.getByTestID("dfi_balance_card").click();
  cy.getByTestID("dfi_utxo_amount").contains("10.00000000");
  cy.getByTestID("send_button").click();
}

context("Wallet - Transaction Authorization with Error", () => {
  const MAX_PASSCODE_ATTEMPT = 3;
  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  before(() => {
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet().sendTokenToWallet(["BTC"]).wait(5000);
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("portfolio_list").should("exist");
    cy.getByTestID("dfi_balance_card").click();
    cy.getByTestID("dfi_utxo_amount").contains("10.00000000");
    cy.getByTestID("convert_button").click();
    cy.getByTestID("button_convert_mode_toggle").click();
  });

  it("should be able to show ocean interface error", () => {
    cy.intercept("**/regtest/rawtx/send", {
      statusCode: 404,
      body: "404 Not Found!",
      headers: {
        "x-not-found": "true",
      },
    }).as("sendToAddress");
    cy.getByTestID("convert_input").clear().type("1");
    cy.getByTestID("button_continue_convert").click();
    cy.getByTestID("button_confirm_convert").click().wait(2000);
    cy.closeOceanInterface();
  });

  it("should not reset attempts on cancel", () => {
    cy.getByTestID("button_confirm_convert").click().wait(2000);
    cy.wrap(Array(MAX_PASSCODE_ATTEMPT - 1)).each(() => {
      cy.getByTestID("pin_authorize").type("696969").wait(1000);
    });
    cy.getByTestID("cancel_authorization").click();
    cy.getByTestID("button_confirm_convert").click().wait(2000);
    cy.getByTestID("pin_attempt_error").should("exist"); //  error message should exist when incorrect pin is entered.
    cy.getByTestID("pin_authorize").type("696969").wait(1000);
    cy.on("window:confirm", () => {});
    cy.url().should("include", "wallet/onboarding");
  });
});

context(
  "Wallet - Transaction Authorization with Error - non transaction UI",
  () => {
    const MAX_PASSCODE_ATTEMPT = 3;
    it("should not reset attempts on cancel - non transaction UI", () => {
      cy.createEmptyWallet(true);
      cy.getByTestID("header_settings").click();
      cy.getByTestID("view_recovery_words").click();
      cy.wait(3000);
      cy.wrap(Array(MAX_PASSCODE_ATTEMPT - 1)).each(() => {
        cy.getByTestID("pin_authorize").type("696969").wait(1000);
      });
      cy.getByTestID("cancel_authorization").click().wait(1000);
      cy.getByTestID("view_recovery_words").click();
      cy.getByTestID("pin_attempt_error").should("exist");
      cy.getByTestID("pin_authorize").type("696969").wait(1000);
      cy.on("window:confirm", () => {});
      cy.url().should("include", "wallet/onboarding");
    });
  }
);

context("Wallet - Transaction Authorization", () => {
  const MAX_PASSCODE_ATTEMPT = 3;
  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  before(() => {
    openSendScreen();
  });

  it("should be able to cancel", () => {
    cy.getByTestID("address_input")
      .clear()
      .type("bcrt1qjhzkxvrgs3az4sv6ca9nqxqccwudvx768cgq93");
    cy.getByTestID("amount_input").clear().type("1");
    cy.getByTestID("button_confirm_send_continue").click();
    cy.getByTestID("button_confirm_send").click().wait(3000);
    cy.getByTestID("cancel_authorization").click();
  });

  it("should be able to exit failed retries", () => {
    cy.go("back");
    cy.getByTestID("address_input")
      .clear()
      .type("bcrt1qjhzkxvrgs3az4sv6ca9nqxqccwudvx768cgq93");
    cy.getByTestID("amount_input").clear().type("1");
    cy.getByTestID("button_confirm_send_continue").click();
    cy.getByTestID("button_confirm_send").click().wait(3000);
    cy.wrap(Array(MAX_PASSCODE_ATTEMPT)).each(() => {
      cy.getByTestID("pin_authorize").type("696969").wait(1000);
    });
    cy.on("window:confirm", () => {});
    cy.url().should("include", "wallet/onboarding");
  });

  it("should clear attempt on success", () => {
    openSendScreen();
    cy.getByTestID("address_input").type(
      "bcrt1qjhzkxvrgs3az4sv6ca9nqxqccwudvx768cgq93"
    );
    cy.getByTestID("amount_input").clear().type("1");
    cy.getByTestID("button_confirm_send_continue").click();
    cy.getByTestID("button_confirm_send").click().wait(3000);
    cy.wrap(Array(MAX_PASSCODE_ATTEMPT - 1)).each(() => {
      cy.getByTestID("pin_authorize").type("696969").wait(1000);
    });
    cy.closeOceanInterface();
    cy.getByTestID("portfolio_list").should("exist");
    cy.getByTestID("dfi_total_balance_amount").should("exist");
    cy.getByTestID("send_balance_button").click().wait(3000);
    cy.getByTestID("select_DFI").click().wait(3000);
    cy.getByTestID("address_input")
      .clear()
      .type("bcrt1qjhzkxvrgs3az4sv6ca9nqxqccwudvx768cgq93");
    cy.getByTestID("amount_input").clear().type("1");
    cy.getByTestID("button_confirm_send_continue").click();
    cy.getByTestID("button_confirm_send").click().wait(3000);
    cy.getByTestID("pin_authorize").type("696969").wait(1000);
    cy.getByTestID("pin_authorize").type("000000").wait(1000);
  });
});

context("Wallet - Non-Transaction Authorization", () => {
  const MAX_PASSCODE_ATTEMPT = 3;
  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  before(() => {
    openSendScreen();
  });

  it("should be prompt non-signing authorization", () => {
    cy.createEmptyWallet(true).wait(4000);
    cy.getByTestID("header_settings").click();
    cy.wait(2000);
    cy.getByTestID("view_recovery_words").click();
    cy.getByTestID("cancel_authorization").should("exist");
  });

  it("should be able to cancel", () => {
    cy.getByTestID("cancel_authorization").click();
    cy.getByTestID("view_recovery_words").click().wait(3000);
  });

  it("should be able to exit failed retries", () => {
    cy.wrap(Array(MAX_PASSCODE_ATTEMPT)).each(() => {
      cy.getByTestID("pin_authorize").type("696969").wait(1000);
    });
    cy.on("window:confirm", () => {});
    cy.url().should("include", "wallet/onboarding");
  });

  it("should clear attempt on success", () => {
    cy.createEmptyWallet(true).wait(4000);
    cy.getByTestID("header_settings").click();
    cy.getByTestID("view_recovery_words").click();
    cy.wrap(Array(MAX_PASSCODE_ATTEMPT - 1)).each(() => {
      cy.getByTestID("pin_authorize").type("696969").wait(1000);
    });
    cy.getByTestID("pin_authorize").type("000000").wait(1000);
    cy.getByTestID("recovery_word_screen").should("exist");
    cy.go("back");
    cy.getByTestID("view_recovery_words").click();
    cy.getByTestID("pin_attempt_error").should("not.exist"); // No error message should show when previous attempt is successful
  });
});
