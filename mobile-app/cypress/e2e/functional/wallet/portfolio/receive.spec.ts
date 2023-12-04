context("Wallet - Receive", () => {
  before(() => {
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet().wait(3000);
    cy.getByTestID("bottom_tab_portfolio").click();
  });

  it("should display valid address when clicked", () => {
    cy.getByTestID("portfolio_list").should("exist");
    cy.getByTestID("receive_balance_button").click();
  });

  it("should copy DVM address to clipboard when copy is clicked", () => {
    cy.getByTestID("address_text").then(($txt: any) => {
      const address = $txt[0].textContent;
      cy.getByTestID("copy_button").should("exist").click();
      cy.window().then((win) => {
        win.navigator.clipboard.readText().then((text) => {
          cy.log(`From clipboard: ${text}`);
          expect(text).to.eq(address);
        });
      });
    });
  });

  it("should get address value and validate", () => {
    cy.getByTestID("qr_code_container").should("exist");
    cy.getByTestID("copy_button").should("exist");
    cy.getByTestID("copy_button").click();
    cy.getByTestID("address_text").then(($txt: any) => {
      const address = $txt[0].textContent;
      cy.go("back");
      cy.getByTestID("dfi_total_balance_amount").contains("10.00000000");
      cy.getByTestID("dfi_balance_card").should("exist").click();
      cy.getByTestID("send_button").click();
      cy.getByTestID("amount_input").clear().type("1");
      cy.getByTestID("address_input").type(address);
      cy.getByTestID("button_confirm_send_continue").should(
        "not.have.attr",
        "disabled",
      );
    });
  });
});

context("Wallet - EVM Receive", () => {
  it("should display valid address when clicked", () => {
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("domain_switch").click();
    cy.getByTestID("receive_balance_button").click();
    cy.getByTestID("qr_code_container").should("exist");
    cy.getByTestID("address_text").should("exist");
    cy.getByTestID("copy_button").should("exist");
    cy.getByTestID("share_button").should("exist");
  });

  it("should copy EVM address to clipboard when copy is clicked", () => {
    cy.getByTestID("address_text").then(($txt: any) => {
      const address = $txt[0].textContent;
      cy.getByTestID("copy_button").should("exist").click();
      cy.window().then((win) => {
        win.navigator.clipboard.readText().then((text) => {
          cy.log(`From clipboard: ${text}`);
          expect(text).to.eq(address);
        });
      });
    });
  });

  it("should get address value and validate", () => {
    cy.getByTestID("address_text").then(($txt: any) => {
      const address = $txt[0].textContent;
      cy.go("back");
      cy.getByTestID("domain_switch").click();
      cy.getByTestID("dfi_total_balance_amount").contains("10.00000000");
      cy.getByTestID("dfi_balance_card").should("exist").click();
      cy.getByTestID("send_button").click();
      cy.getByTestID("amount_input").clear().type("1");
      cy.getByTestID("address_input").type(address);
      cy.getByTestID("button_confirm_send_continue").should(
        "not.have.attr",
        "disabled",
      );
    });
  });
});

context("Wallet - Receive - QR Code - Check", () => {
  before(() => {
    cy.createEmptyWallet();
    cy.getByTestID("portfolio_list").should("exist");
    cy.getByTestID("receive_balance_button").click();
  });

  it("should match QR code", () => {
    cy.getByTestID("qr_code_container").compareSnapshot("qr-code-container");
  });
});
