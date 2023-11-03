import { checkValueWithinRange } from "../../../../support/walletCommands";

function addDFICollaterals() {
  cy.createEmptyWallet(true);
  cy.sendDFItoWallet()
    .sendDFITokentoWallet()
    .sendDFITokentoWallet()
    .sendDFITokentoWallet()
    .sendTokenToWallet(["BTC", "ETH"])
    .wait(6000);
}

context("Wallet - Loans - DUSD Loops", () => {
  let cntr = -1;
  before(() => {
    addDFICollaterals();
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
  });

  beforeEach(() => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.createVault(0);
    cntr++;
  });

  it("should allow user to take a DUSD Loan when vault has 100% DFI collateral", () => {
    cy.getByTestID(`vault_card_${cntr}_borrow_button`).should("not.exist");
    cy.getByTestID(`vault_card_${cntr}_EMPTY_add_collateral_button`).click();
    cy.addCollateral("10", "DFI");
    cy.getByTestID(`vault_card_${cntr}_status`).contains("Ready");
    cy.getByTestID(`vault_card_${cntr}_collateral_token_group_DFI`).should(
      "exist",
    );
    cy.getByTestID(`vault_card_${cntr}_total_collateral_amount`).contains(
      "$1,000.00",
    );
    cy.getByTestID(`vault_card_${cntr}_borrow_button`).should("exist").click();
    cy.getByTestID("select_DUSD").click();
    cy.getByTestID("text_input_borrow_amount").type("5").blur();
    cy.getByTestID("borrow_button_submit").click();
    cy.getByTestID("confirm_title").contains("You are borrowing");
    cy.getByTestID("text_borrow_amount").contains("5.00000000");
    cy.getByTestID("transaction_fee_value").should("exist");
    cy.getByTestID("vault_id_value").should("exist");
    cy.getByTestID("col_ratio_value")
      .invoke("text")
      .then((text) => {
        checkValueWithinRange("19,999.98", text, 0.1);
      });
    cy.getByTestID("tokens_to_borrow").contains("5 DUSD");
    cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
    cy.getByTestID("txn_authorization_title").contains(
      "Borrowing 5.00000000 DUSD",
    );

    cy.closeOceanInterface();
    cy.getByTestID("vault_card_0").should("exist").click().wait(3000);
    cy.getByTestID("loan_card_DUSD_amount")
      .should("contain", "5.00")
      .and("contain", "DUSD");
  });

  it("should allow user to take a DUSD Loan when vault has 100% DUSD collateral", () => {
    cy.getByTestID(`vault_card_${cntr}_borrow_button`).should("not.exist");
    cy.getByTestID(`vault_card_${cntr}_EMPTY_add_collateral_button`).click();
    cy.addCollateral("5", "DUSD");
    cy.getByTestID(`vault_card_${cntr}_status`).contains("Ready");
    cy.getByTestID(`vault_card_${cntr}_collateral_token_group_DUSD`).should(
      "exist",
    );
    cy.getByTestID(`vault_card_${cntr}_total_collateral_amount`).contains(
      "$6.00",
    );
    cy.getByTestID(`vault_card_${cntr}_borrow_button`).should("exist").click();
    cy.getByTestID("select_DUSD").click();
    cy.getByTestID("text_input_borrow_amount").type("2").blur();
    cy.getByTestID("borrow_button_submit").click();
    cy.getByTestID("confirm_title").contains("You are borrowing");
    cy.getByTestID("text_borrow_amount").contains("2.00000000");
    cy.getByTestID("transaction_fee_value").should("exist");
    cy.getByTestID("vault_id_value").should("exist");
    cy.getByTestID("col_ratio_value")
      .invoke("text")
      .then((text) => {
        checkValueWithinRange("299.99", text, 0.1);
      });
    cy.getByTestID("tokens_to_borrow").contains("2 DUSD");
    cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
    cy.getByTestID("txn_authorization_title").contains(
      "Borrowing 2.00000000 DUSD",
    );

    cy.closeOceanInterface();
  });

  it("should allow user to take a DUSD Loan when vault has 50% DFI + other tokens as collateral", () => {
    cy.getByTestID(`vault_card_${cntr}_borrow_button`).should("not.exist");
    cy.getByTestID(`vault_card_${cntr}_EMPTY_add_collateral_button`).click();
    cy.addCollateral("3", "DFI");
    cy.getByTestID(`vault_card_${cntr}`).click();
    cy.getByTestID("action_add").click();
    cy.addCollateral("6", "dBTC");
    cy.getByTestID(`vault_card_${cntr}_status`).contains("Ready");
    cy.getByTestID(`vault_card_${cntr}_collateral_token_group_DFI`).should(
      "exist",
    );
    cy.getByTestID(`vault_card_${cntr}_collateral_token_group_dBTC`).should(
      "exist",
    );
    cy.getByTestID(`vault_card_${cntr}_total_collateral_amount`).contains(
      "$600.00",
    );
    cy.getByTestID(`vault_card_${cntr}_borrow_button`).should("exist").click();
    cy.getByTestID("select_DUSD").click();
    cy.getByTestID("text_input_borrow_amount").type("3").blur();
    cy.getByTestID("borrow_button_submit").click();
    cy.getByTestID("confirm_title").contains("You are borrowing");
    cy.getByTestID("text_borrow_amount").contains("3.00000000");
    cy.getByTestID("transaction_fee_value").should("exist");
    cy.getByTestID("vault_id_value").should("exist");
    cy.getByTestID("col_ratio_value")
      .invoke("text")
      .then((text) => {
        checkValueWithinRange("19,999.98", text, 0.1);
      });
    cy.getByTestID("tokens_to_borrow").contains("3 DUSD");
    cy.getByTestID("button_confirm_borrow_loan").click().wait(3000);
    cy.getByTestID("txn_authorization_title").contains(
      "Borrowing 3.00000000 DUSD",
    );

    cy.closeOceanInterface();
    cy.wait(3000);
    cy.getByTestID(`vault_card_${cntr}`).should("exist").click();
    cy.getByTestID("loan_card_DUSD_amount")
      .should("contain", "3.00")
      .and("contain", "DUSD");
  });

  it("should not allow user to take a DUSD Loan when vault has 0% DFI + other tokens as collateral", () => {
    cy.getByTestID(`vault_card_${cntr}_borrow_button`).should("not.exist");
    cy.getByTestID(`vault_card_${cntr}_EMPTY_add_collateral_button`).click();
    cy.addCollateral("3", "dETH");
    cy.getByTestID(`vault_card_${cntr}_status`).contains("Ready");
    cy.getByTestID(`vault_card_${cntr}_collateral_token_group_dETH`).should(
      "exist",
    );
    cy.getByTestID(`vault_card_${cntr}_total_collateral_amount`).contains(
      "$21.00",
    );
    cy.getByTestID(`vault_card_${cntr}_borrow_button`).should("exist").click();
    cy.getByTestID("select_DUSD").click();
    cy.getByTestID("text_input_borrow_amount").type("5").blur();
    cy.getByTestID("borrow_button_submit").should("have.attr", "aria-disabled");
    cy.getByTestID("validation_message").should(
      "have.text",
      "Insufficient DFI and/or DUSD in vault. Add more to start minting dTokens.",
    );
  });

  it("should not allow user to take a DUSD Loan when vault has <50% DFI + other tokens as collateral", () => {
    cy.getByTestID(`vault_card_${cntr}_borrow_button`).should("not.exist");
    cy.getByTestID(`vault_card_${cntr}_EMPTY_add_collateral_button`).click();
    cy.addCollateral("0.005", "DFI");
    cy.getByTestID(`vault_card_${cntr}`).click();
    cy.getByTestID("action_add").click();
    cy.addCollateral("2", "dBTC");
    cy.getByTestID(`vault_card_${cntr}_status`).contains("Ready");
    cy.getByTestID(`vault_card_${cntr}_collateral_token_group_DFI`).should(
      "exist",
    );
    cy.getByTestID(`vault_card_${cntr}_collateral_token_group_dBTC`).should(
      "exist",
    );
    cy.getByTestID(`vault_card_${cntr}_total_collateral_amount`).contains(
      "$100.50",
    );
    cy.getByTestID(`vault_card_${cntr}_borrow_button`).should("exist").click();
    cy.getByTestID("select_DUSD").click();
    cy.getByTestID("text_input_borrow_amount").type("5").blur();
    cy.getByTestID("borrow_button_submit").should("have.attr", "aria-disabled");
    cy.getByTestID("validation_message").should(
      "have.text",
      "Insufficient DFI and/or DUSD in vault. Add more to borrow DUSD.",
    );
  });
});
