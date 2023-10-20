context("Portfolio - Send - Address Book", () => {
  const labels = ["DVMAddress", "EVMAddress"];
  const addresses = [
    "bcrt1q8rfsfny80jx78cmk4rsa069e2ckp6rn83u6ut9",
    "0x2DeC425BF3c289C9B7452aD54E2F9877F21e0316",
  ];

  // Addresses that shows up under the 'Your address' tab in address book
  function populateYourAddresses(): void {
    // Create new wallet address - only available if there is DFI UTXO
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("wallet_address").should("exist").click();
    cy.getByTestID("create_new_address").should("exist").click(); // Generate Address 2 wallet address

    // Go back to previous Address 1
    cy.getByTestID("wallet_address").should("exist").click();
    cy.getByTestID("address_row_0").click();
    cy.getByTestID("wallet_address").should("have.text", "Address 1");
  }

  // Whitelisted addresses
  function populateAddressBook(hasExistingAddress?: boolean): void {
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("action_button_group").should("exist");
    cy.getByTestID("send_balance_button").click().wait(3000);
    cy.getByTestID("select_DFI").click().wait(3000);
    cy.getByTestID("address_book_button").click();
    cy.wrap(labels).each((_v, index: number) => {
      cy.getByTestID("add_new_address").click();

      if (hasExistingAddress) {
        // Reselect DVM address type
        cy.getByTestID("address_book_address_type_DVM").click();
      }

      // Select EVM address type
      if (index === 1) {
        cy.getByTestID("address_book_address_type_EVM").click();
      }
      cy.getByTestID("address_book_label_input").type(labels[index]);
      cy.getByTestID("address_book_label_input_error").should("not.exist");
      cy.getByTestID("address_book_address_input")
        .clear()
        .type(addresses[index])
        .blur();
      cy.getByTestID("address_book_address_input_error").should("not.exist");
      cy.getByTestID("save_address_label").click().wait(1000);
      cy.getByTestID("pin_authorize").type("000000").wait(2000);
      cy.wait(1000);
      cy.getByTestID("address_book_button").click();
      cy.getByTestID(`address_row_label_${index}_WHITELISTED`).contains(
        labels[index],
      );
      cy.getByTestID(`address_row_text_${index}_WHITELISTED`).contains(
        addresses[index],
      );
    });
  }

  function verifyYourAddressRowItems(index: number) {
    // Generated wallet label
    cy.getByTestID(`address_row_label_${index}_YOUR_ADDRESS`).should(
      "have.text",
      `Address ${index + 1}`,
    );
    // dvm address
    cy.getByTestID(`address_row_text_${index}_YOUR_ADDRESS`).should("exist");

    // evm address
    cy.getByTestID(`address_row_text_${index}_YOUR_ADDRESS_EVM`).should(
      "exist",
    );
  }

  // Send DFI tokens dvm -> evm
  function topUpDfiInEvmDomain() {
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("action_button_group").should("exist");
    cy.getByTestID("send_balance_button").click();
    cy.getByTestID("select_DFI").click();
    cy.getByTestID("25%_amount_button").click();
    cy.getByTestID("address_book_button").click();
    cy.getByTestID("address_button_group_YOUR_ADDRESS").click();
    cy.getByTestID("address_row_text_0_YOUR_ADDRESS_EVM").click();
    cy.getByTestID("button_confirm_send_continue").click();

    // Send confirmation screen
    cy.getByTestID("button_confirm_send").click();
    cy.getByTestID("pin_authorize").type("000000").wait(4000);
    cy.getByTestID("oceanInterface_close").click(); // Close ocean interface popup
  }

  describe("Whitelisted and Your Addresses tab", () => {
    before(() => {
      cy.createEmptyWallet(true);
      cy.sendDFItoWallet().sendDFITokentoWallet().wait(4000);
      topUpDfiInEvmDomain();
      populateYourAddresses(); // Generate new wallet Address 2
      populateAddressBook(); // Add whitelist addresses
    });

    it("(dvm) Whitelisted - should not display evm tag for dvm addresses", () => {
      cy.getByTestID("bottom_tab_portfolio").click();
      cy.getByTestID("header_settings").click();
      cy.getByTestID("address_book_title").click();
      cy.getByTestID("address_row_label_0_WHITELISTED").should(
        "have.text",
        labels[0],
      );
      cy.getByTestID("address_row_text_0_WHITELISTED").should(
        "have.text",
        addresses[0],
      );
      cy.getByTestID("address_row_0_WHITELISTED_caret").should("exist");

      cy.getByTestID("address_row_label_0_WHITELISTED_EVM_tag").should(
        "not.exist",
      );
    });

    it("(dvm) Whitelisted - should display evm tag for evm addresses", () => {
      cy.getByTestID("address_row_label_1_WHITELISTED").should(
        "have.text",
        labels[1],
      );
      cy.getByTestID("address_row_text_1_WHITELISTED").should(
        "have.text",
        addresses[1],
      );
      cy.getByTestID("address_row_1_WHITELISTED_caret").should("exist");
      cy.getByTestID("address_row_label_1_WHITELISTED_EVM_tag").should("exist");
    });

    it("(dvm) Your Addresses - should display not evm tag for dvm addresses", () => {
      cy.getByTestID("bottom_tab_portfolio").click();
      cy.getByTestID("header_settings").click();
      cy.getByTestID("address_book_title").click();
      cy.getByTestID("address_button_group_YOUR_ADDRESS").click();
      verifyYourAddressRowItems(0);
    });

    it("(dvm) Your Addresses - should display evm tag for evm addresses", () => {
      verifyYourAddressRowItems(1);
    });

    // Switch to evm domain
    it("(evm) Whitelisted - should disable evm addresses in evm domain", () => {
      // Go back to portfolio page to switch domain
      cy.getByTestID("bottom_tab_portfolio").click();
      cy.getByTestID("domain_switch").click();
      cy.getByTestID("action_button_group").should("exist");
      cy.getByTestID("send_balance_button").click().wait(3000);
      cy.getByTestID("select_DFI").click().wait(3000);
      cy.getByTestID("address_book_button").click();

      cy.getByTestID("address_row_0_WHITELISTED").should(
        "have.attr",
        "aria-disabled",
        "true",
      );
      cy.getByTestID("address_row_1_WHITELISTED").should("not.be.disabled");
    });

    // Switch to your address tab
    it("(evm) Your Address - should disable evm addresses in evm domain", () => {
      cy.getByTestID("address_button_group_YOUR_ADDRESS").click();
      verifyYourAddressItemEvm();
    });
  });
});

// Check if evm address is disabled in evm domain for generated Address 1 and 2 cards
function verifyYourAddressItemEvm() {
  cy.wrap([0, 1]).each((index: number) => {
    // dvm address
    cy.getByTestID(`address_row_text_${index}_YOUR_ADDRESS`).should(
      "not.be.disabled",
    );
    // evm address
    cy.getByTestID(`address_row_text_${index}_YOUR_ADDRESS_EVM`).should(
      "have.attr",
      "aria-disabled",
      "true",
    );
  });
}

context("Portfolio", () => {
  before(() => {
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet().sendTokenToWallet(["BTC", "BTC-DFI"]).wait(4000);
    cy.getByTestID("bottom_tab_portfolio").click();
  });

  describe("Wallet label (& address book bottom sheet)", () => {
    it('should display generated address label "Address 1" as first wallet label', () => {
      cy.getByTestID("wallet_address")
        .should("exist")
        .should("have.text", "Address 1");
    });
    it("should display new wallet label after modifying wallet label", () => {
      cy.getByTestID("wallet_address").should("exist").click();

      // Go to edit address book bottom sheet
      cy.getByTestID("address_edit_icon_address_row_0").click();
      cy.getByTestID("address_book_label_input")
        .click()
        .type("New Wallet Label")
        .blur()
        .wait(1000);
      cy.getByTestID("button_confirm_save_address_label").click().wait(1000);

      // Go back to address book bottom sheet
      cy.getByTestID("list_header_address_label").should("exist");
      cy.getByTestID("close_bottom_sheet_button").click();

      // Go back to portfolio page
      cy.getByTestID("wallet_address").should("have.text", "New Wallet Label");
    });

    // Generate new wallet address
    it("should display generated Address 2 label as second wallet label", () => {
      cy.getByTestID("bottom_tab_portfolio").click();
      cy.getByTestID("wallet_address").should("exist").click();

      cy.getByTestID("create_new_address").should("exist").click(); // Generate Address 2 wallet address
      cy.getByTestID("wallet_address").should("have.text", "Address 2");
    });
  });
});

// Ensure that the blockchain container in Docker returns 'Block minted' to know that it's connected to Local env, else restart container
// If values are taking too long to load or for flaky tests, restart Cypress
