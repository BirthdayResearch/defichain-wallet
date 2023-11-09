context("Wallet - Send issue", () => {
  before(() => {
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet().wait(4000);
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("switch_account_button").click();
    cy.getByTestID("create_new_address").click();
    cy.wait(1000);
    cy.getByTestID("switch_account_button").click();
    cy.getByTestID("active_address")
      .invoke("text")
      .then((address2) => {
        cy.getByTestID("address_row_0").click();
        cy.wait(1000);
        cy.wrap(Array.from(Array(10))).each(() => {
          send("0.0001", address2);
        });
        send("0.1", address2);
      });
  });

  it("should send amount to diff address", () => {
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("switch_account_button").click();
    cy.wait(1000);
    cy.getByTestID("address_row_1").click();
    cy.wait(1000);
    cy.getByTestID("bottom_tab_portfolio").click();
    send("0.0001", "bcrt1q8rfsfny80jx78cmk4rsa069e2ckp6rn83u6ut9");
  });
});

const send = (balance: string, address: string) => {
  cy.getByTestID("send_balance_button").click().wait(1000);
  cy.getByTestID("select_DFI").click().wait(1000);
  cy.getByTestID("amount_input").clear().type(balance);
  cy.getByTestID("address_input").clear().type(address).wait(1000);
  cy.getByTestID("button_confirm_send_continue").click();
  cy.getByTestID("button_confirm_send").click().wait(1000);
  cy.closeOceanInterface();
};
