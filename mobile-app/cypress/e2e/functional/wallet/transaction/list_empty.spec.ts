context("Wallet - Transaction - Empty", () => {
  describe("new wallet", { testIsolation: false }, () => {
    before(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.createEmptyWallet(true);
      cy.getByTestID("bottom_tab_portfolio").click();
      cy.getByTestID("transaction_button").click();
    });

    it("should display 0 row", () => {
      cy.getByTestID("transactions_screen_list").should("not.exist");
      cy.getByTestID("transaction_row_0").should("not.exist");
    });

    it("LOAD MORE should not exist", () => {
      cy.getByTestID("transactions_list_loadmore").should("not.exist");
    });

    it("should display empty transaction text", () => {
      cy.getByTestID("empty_transaction").should("exist");
    });
  });
});
