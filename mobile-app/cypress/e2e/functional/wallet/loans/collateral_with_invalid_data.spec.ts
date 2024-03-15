import BigNumber from "bignumber.js";

BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

const getVault = (loanValue: string): any => ({
  vaultId: "vaultidhere",
  loanScheme: {
    id: "MIN150",
    minColRatio: "150",
    interestRate: "5",
  },
  ownerAddress: "bcrt1qjk6p9kc28wdj84c500lh2h5zlzf5ce3r8r0y92",
  state: "ACTIVE",
  informativeRatio: "-1",
  collateralRatio: "100", // must be positive
  collateralValue: "0",
  loanValue,
  interestValue: "0",
  collateralAmounts: [],
  loanAmounts: [],
  interestAmounts: [],
});

// TODO (Harsh) uncomment when testcase stop crashing chrome
context.skip("Wallet - Loans - Add/Remove Collateral - Invalid data", () => {
  beforeEach(() => {
    // TODO remove intercept wile removing vault share functionality
    cy.intercept("**/settings/flags", {
      body: [],
    });
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet().sendDFITokentoWallet();
    cy.wait(6000);
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.getByTestID("empty_vault").should("exist");
    cy.createVault(0);
  });

  it("should display Ready if resulting collateralization is NaN", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.intercept("**/vaults?size=200", {
      statusCode: 200,
      body: { data: getVault("0") },
    }).as("getVaults");
    cy.wait("@getVaults").then(() => {
      /* (collateralValueInUSD / vault.loanValue) * 100
       (any number / '') = NaN
    */
      cy.wait(3000);
      cy.getByTestID("vault_card_0_EMPTY").click();
      cy.getByTestID("action_add").click();
      cy.getByTestID("select_DFI").click();
      cy.getByTestID("MAX_amount_button").click();
      cy.getByTestID("resulting_collateralization").should(
        "have.text",
        "Ready",
      );
    });
  });

  it("should display Ready if resulting collateralization is negative", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.intercept("**/vaults?size=200", {
      statusCode: 200,
      body: { data: getVault("-10") },
    }).as("getVaults");
    cy.wait("@getVaults").then(() => {
      /* (collateralValueInUSD / vault.loanValue) * 100
       (any number / -10) = -number
    */
      cy.wait(3000);
      cy.getByTestID("vault_card_0_EMPTY").click();
      cy.getByTestID("action_add").click();
      cy.getByTestID("select_DFI").click();
      cy.getByTestID("MAX_amount_button").click();
      cy.getByTestID("resulting_collateralization").should(
        "have.text",
        "Ready",
      );
    });
  });
});
