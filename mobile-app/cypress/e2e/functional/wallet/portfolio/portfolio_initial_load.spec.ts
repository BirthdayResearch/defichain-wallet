context("Wallet - Portfolio page", { testIsolation: false }, () => {
  before(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  beforeEach(() => {
    cy.createEmptyWallet(true);
  });

  it("should load portfolio page when flags API is delayed", () => {
    cy.intercept({ url: "**/settings/flags", middleware: true }, (req) => {
      req.on("response", (res) => {
        res.setDelay(5000);
      });
    }).as("flags");
    cy.wait("@flags").then(() => {
      cy.getByTestID("portfolio_list").should("exist");
    });
  });

  it("should not load portfolio page when flags API failed", () => {
    cy.intercept("**/settings/flags", {
      statusCode: 404,
      body: "404 Not Found!",
      headers: {
        "x-not-found": "true",
      },
    }).as("flags");
    cy.wait("@flags").then(() => {
      cy.getByTestID("portfolio_list").should("not.exist");
    });
  });

  it("should load portfolio page when flags API succeed after failed API attempt", () => {
    cy.intercept({ url: "**/settings/flags", middleware: true }, (req) => {
      req.on("response", (res) => {
        res.setDelay(5000);
      });
    }).as("flags");
    cy.wait("@flags").then(() => {
      cy.getByTestID("portfolio_list").should("exist");
    });
  });

  it("should display EmptyBalances component when there are no DFI and other tokens", () => {
    cy.intercept("**/poolpairs?size=*", {
      body: {
        data: [],
      },
    });
    cy.getByTestID("empty_portfolio").should("exist");
    cy.getByTestID("empty_tokens_title").should("have.text", "Empty portfolio");
    cy.getByTestID("empty_tokens_subtitle").should(
      "have.text",
      "Add DFI and other tokens to get started",
    );
  });

  it("should display skeleton loader when API has yet to return", () => {
    cy.intercept("**/address/**/tokens?size=*", {
      body: {
        data: [{}],
      },
      delay: 3000,
    });
    cy.getByTestID("total_portfolio_skeleton_loader").should("exist");
    cy.getByTestID("portfolio_skeleton_loader").should("exist");
    cy.getByTestID("dfi_balance_skeleton_loader").should("exist");
    cy.getByTestID("dfi_USD_balance_skeleton_loader").should("exist");
  });

  it("should not display skeleton loader when API has return", () => {
    cy.intercept("**/address/**/tokens?size=*").as("getTokens");
    cy.wait("@getTokens").then(() => {
      cy.getByTestID("total_portfolio_skeleton_loader").should("not.exist");
      cy.getByTestID("dfi_balance_skeleton_loader").should("not.exist");
      cy.getByTestID("dfi_USD_balance_skeleton_loader").should("not.exist");
      cy.getByTestID("portfolio_skeleton_loader").should("not.exist");
    });
  });
});
