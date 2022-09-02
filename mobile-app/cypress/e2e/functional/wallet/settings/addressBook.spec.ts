context("Wallet - Settings - Address Book", () => {
  before(() => {
    cy.createEmptyWallet(true);
    cy.getByTestID("header_settings").click();
    cy.getByTestID("address_book_title").click();
  });
  const labels = ["Light", "Wallet", "🪨"];
  const addresses = [
    "bcrt1q8rfsfny80jx78cmk4rsa069e2ckp6rn83u6ut9",
    "2MxnNb1MYSZvS3c26d4gC7gXsNMkB83UoXB",
    "n1xjm9oekw98Rfb3Mv4ApyhwxC5kMuHnCo",
  ];

  const modifiedLabels = ["Dark", "Wallet", "🪨"];

  function populateAddressBook(): void {
    cy.createEmptyWallet(true);
    cy.getByTestID("header_settings").click();
    cy.getByTestID("address_book_title").click();
    cy.wrap(labels).each((_v, index: number) => {
      if (index === 0) {
        cy.getByTestID("button_add_address").click();
      } else {
        cy.getByTestID("add_new_address").click();
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
      cy.getByTestID(`address_row_label_${index}_WHITELISTED`).contains(
        labels[index]
      );
      cy.getByTestID(`address_row_text_${index}_WHITELISTED`).contains(
        addresses[index]
      );
    });
  }

  it("should be able to access address book from setting screen", () => {
    cy.url().should("include", "Settings/AddressBookScreen");
    cy.getByTestID("empty_address_book").should("exist");
  });

  it("should have Your Addresses tab with one wallet address", () => {
    cy.getByTestID("address_button_group_YOUR_ADDRESS").click();
    cy.getByTestID("address_row_text_0_YOUR_ADDRESS").should("exist");
  });

  it("should have refresh button in Your address tab", () => {
    cy.getByTestID("discover_wallet_addresses").should("exist");
  });

  it("should block wallet address during add new whitelisted address", () => {
    cy.getByTestID("address_row_text_0_YOUR_ADDRESS")
      .invoke("text")
      .then((walletAddress) => {
        cy.getByTestID("address_button_group_WHITELISTED").click();
        cy.getByTestID("add_new_address").click();
        cy.getByTestID("address_book_address_input")
          .clear()
          .type(walletAddress)
          .blur();
        cy.getByTestID("address_book_address_input_error").contains(
          "This address already exists in your address book, please enter a different address"
        );
      });
  });

  it("should be able to create address in whitelisted tab", () => {
    populateAddressBook();
  });

  it("should be able to search for address by label", () => {
    cy.wrap(labels).each((label: string, index: number) => {
      cy.getByTestID("address_search_input").type(label).blur().wait(1000);
      cy.getByTestID("search_title").contains(`Search results for “${label}`);
      cy.getByTestID("address_row_label_0_WHITELISTED").contains(label);
      cy.getByTestID("address_row_text_0_WHITELISTED").contains(
        addresses[index]
      );
      cy.getByTestID("address_search_input").clear();
      cy.getByTestID("search_title").contains("Search with label or address");
    });
  });

  it("should be able to sort whitelisted address by favourite", () => {
    cy.getByTestID("address_search_input").blur();
    cy.getByTestID("address_row_2_not_favourite_WHITELISTED").click().wait(500);
    cy.getByTestID("address_row_0_is_favourite_WHITELISTED").should("exist");
    cy.getByTestID("address_row_text_0_WHITELISTED").contains(addresses[2]); // 3rd became 1st
    cy.getByTestID("address_row_2_not_favourite_WHITELISTED").click().wait(500);
    cy.getByTestID("address_row_1_is_favourite_WHITELISTED").should("exist");
    cy.getByTestID("address_row_text_1_WHITELISTED").contains(addresses[1]); // 2nd maintain 2nd
    cy.getByTestID("address_row_text_2_WHITELISTED").contains(addresses[0]); // 1st became 3rd
    cy.getByTestID("address_row_0_is_favourite_WHITELISTED").click().wait(500); // remove from favorite
    cy.getByTestID("address_row_2_not_favourite_WHITELISTED").should("exist");
    cy.getByTestID("address_row_text_2_WHITELISTED").contains(addresses[2]); // 3rd back to 3rd
    cy.getByTestID("address_row_0_is_favourite_WHITELISTED").click().wait(500); // remove from favorite
    cy.getByTestID("address_row_1_not_favourite_WHITELISTED").should("exist");
  });

  it("should be able to edit address label", () => {
    populateAddressBook();
    const newLabel = "Dark";
    const address = addresses[0];
    cy.getByTestID(`address_action_${address}`).click();
    cy.getByTestID("address_book_edit_label").click();
    cy.getByTestID("address_book_label_input").clear().type(newLabel).blur();
    cy.getByTestID("address_book_address_input_error").should("not.exist");
    cy.getByTestID("save_address_label").click().wait(1000);
    cy.getByTestID("pin_authorize").type("000000").wait(2000);
    cy.wrap(modifiedLabels).each((_v, index: number) => {
      cy.getByTestID(`address_row_label_${index}_WHITELISTED`).contains(
        modifiedLabels[index]
      );
      cy.getByTestID(`address_row_text_${index}_WHITELISTED`).contains(
        addresses[index]
      );
    });
  });

  it("should delete an address", () => {
    const deletedAddress = addresses[0];
    populateAddressBook();
    cy.getByTestID(`address_action_${deletedAddress}`).click();
    cy.getByTestID("delete_address").click();
    cy.getByTestID("pin_authorize").type("000000").wait(2000);
    cy.getByTestID("address_row_text_0_WHITELISTED")
      .invoke("text")
      .then((address) => {
        expect(address).not.eq(deletedAddress);
      });
  });
});
