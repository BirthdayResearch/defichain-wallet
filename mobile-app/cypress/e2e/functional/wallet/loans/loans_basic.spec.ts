import { LoanToken } from "@defichain/whale-api-client/dist/api/loan";
import BigNumber from "bignumber.js";

BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

function checkTokensSortingOrder(
  sortedType: string,
  firstToken: string,
  lastToken: string,
): void {
  const containerTestID = '[data-testid="loan_screen_token_lists"]';
  const sortButtonTestID = "loans_tokens_sort_toggle";

  cy.getByTestID(sortButtonTestID).click();
  cy.getByTestID(`select_sort_${sortedType}`).click();
  cy.wait(3000);
  cy.getByTestID(sortButtonTestID).contains(sortedType);
  cy.get(containerTestID).children().first().contains(firstToken);
  cy.get(containerTestID).children().last().contains(lastToken);

  switch (sortedType) {
    case "Lowest interest":
      cy.getByTestID("loan_card_0_interest_rate")
        .invoke("text")
        .then((text) => {
          const firstVal = text.split("% Interest")[0];
          cy.getByTestID("loan_card_4_interest_rate")
            .invoke("text")
            .then((text) => {
              const secondVal = text.split("% Interest")[0];
              expect(Number(firstVal)).to.be.lessThan(Number(secondVal));
            });
        });
      break;
    case "Highest interest":
      cy.getByTestID("loan_card_0_interest_rate")
        .invoke("text")
        .then((text) => {
          const firstVal = text.split("% Interest")[0];
          cy.getByTestID("loan_card_4_interest_rate")
            .invoke("text")
            .then((text) => {
              const secondVal = text.split("% Interest")[0];
              expect(Number(firstVal)).to.be.greaterThan(Number(secondVal));
            });
        });
      break;
    case "Lowest oracle price":
      cy.getByTestID("loan_card_0_oracle_price")
        .invoke("text")
        .then((text) => {
          const value = text.split("$")[1];
          const firstVal = value.replace(/,/g, "");
          cy.getByTestID("loan_card_4_oracle_price")
            .invoke("text")
            .then((text) => {
              const value = text.split("$")[1];
              const secondVal = value.replace(/,/g, "");
              expect(Number(firstVal)).to.be.lessThan(Number(secondVal));
            });
        });
      break;
    case "Highest oracle price":
      cy.getByTestID("loan_card_0_oracle_price")
        .invoke("text")
        .then((text) => {
          const value = text.split("$")[1];
          const firstVal = value.replace(/,/g, "");
          cy.getByTestID("loan_card_4_oracle_price")
            .invoke("text")
            .then((text) => {
              const value = text.split("$")[1];
              const secondVal = value.replace(/,/g, "");
              expect(Number(firstVal)).to.be.greaterThan(Number(secondVal));
            });
        });
      break;

    default:
  }
}

context("Wallet - Loans - Create Loans page", { testIsolation: false }, () => {
  before(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.createEmptyWallet(true);
  });

  it("should display correct loans tokens from API", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.intercept("**/loans/tokens?size=200").as("loans");
    cy.wait(["@loans"]).then((intercept: any) => {
      const { data } = intercept.response.body;
      cy.wrap(data).each((loan: LoanToken, i: number) => {
        // const price = loan.activePrice?.active?.amount ?? 0
        cy.getByTestID(`loan_card_${i}_display_symbol`).contains(
          loan.token.displaySymbol,
        );
        cy.getByTestID(`loan_card_${i}_interest_rate`).contains(
          `${BigNumber(loan.interest).toFixed(2)}%`,
        );
        // TODO update to fix volatility
        /* cy.getByTestID(`loan_card_${i}_loan_amount`)
          .contains(price > 0 ? `$${Number(new BigNumber(price).toFixed(2)).toLocaleString()}` : '-') */
      });
    });
  });

  it("should display empty loans state", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click(); // landing page is on BORROW tab
    cy.getByTestID("empty_vault_title").contains("No vaults");
    cy.getByTestID("empty_vault_description").contains(
      "Get started with loans. Create a vault for your collaterals.",
    );
  });

  // TODO (Harsh) uncomment when testcase stop crashing chrome
  it.skip("should display learn more bottom sheet", () => {
    cy.getByTestID("empty_vault_learn_more").click();
    cy.wait(2000);
    cy.getByTestID("loans_carousel").should("exist");
    cy.getByTestID("close_bottom_sheet_button").click();
  });
});

context("Wallet - Loans", { testIsolation: false }, () => {
  before(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet().sendDFITokentoWallet().wait(6000);
  });

  it("should create vaults and add collaterals", () => {
    cy.getByTestID("bottom_tab_loans").click();
    cy.getByTestID("loans_tabs_YOUR_VAULTS").click();
    cy.createVault(0);
    cy.getByTestID("vault_card_0_EMPTY_add_collateral_button").click();
    cy.addCollateral("10", "DFI");
    cy.getByTestID("loans_tabs_BORROW").click();
    cy.getByTestID("loans_tokens_sort_row").should("exist");
  });

  it("should sort tokens based on Lowest interest", () => {
    checkTokensSortingOrder("Lowest interest", "DUSD", "dTR50");
  });

  it("should sort tokens based on Highest interest", () => {
    checkTokensSortingOrder("Highest interest", "dTR50", "DUSD");
  });

  it("should sort tokens based on A to Z", () => {
    checkTokensSortingOrder("A to Z", "dTD10", "DUSD");
  });

  it("should sort tokens based on Z to A", () => {
    checkTokensSortingOrder("Z to A", "DUSD", "dTD10");
  });

  it("should sort tokens based on Lowest oracle price", () => {
    checkTokensSortingOrder("Lowest oracle price", "DUSD", "dTD10");
  });

  it("should sort tokens based on Highest oracle price", () => {
    checkTokensSortingOrder("Highest oracle price", "dTD10", "DUSD");
  });
});
