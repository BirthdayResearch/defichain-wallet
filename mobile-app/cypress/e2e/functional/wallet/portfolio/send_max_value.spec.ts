import { WhaleApiClient } from "@defichain/whale-api-client";
import BigNumber from "bignumber.js";

BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

context("Wallet - Send - Max Values", { testIsolation: false }, () => {
  let whale: WhaleApiClient;

  before(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  const addresses = [
    "bcrt1q6np0fh47ykhznjhrtfvduh73cgjg32yac8t07d",
    "bcrt1qyynghf6xv66c7zewd6aansn9j9hy3q2hsl7ms7",
  ];
  const prevBalances: { [key: string]: string } = {};
  beforeEach(() => {
    const network = localStorage.getItem("Development.NETWORK");
    whale = new WhaleApiClient({
      url:
        network === "Playground"
          ? "https://playground.jellyfishsdk.com"
          : "http://localhost:19553",
      network: "regtest",
      version: "v0",
    });
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet();
    cy.wait(6000);
    cy.getByTestID("bottom_tab_portfolio").click();
  });

  addresses.forEach((address: string) => {
    describe(`check for address ${address}`, () => {
      it(`should be able to send to address ${address}`, () => {
        cy.wrap(whale.address.getBalance(address)).then((response: any) => {
          prevBalances[address] = response;
        });
        cy.getByTestID("bottom_tab_portfolio").click();
        cy.getByTestID("portfolio_list").should("exist");
        cy.getByTestID("dfi_total_balance_amount").contains("10.00000000");
        cy.getByTestID("dfi_balance_card").should("exist");
        cy.getByTestID("action_button_group").should("exist");
        cy.getByTestID("send_balance_button").click().wait(3000);
        cy.getByTestID("select_DFI").click().wait(3000);
        cy.getByTestID("address_input").clear().type(address);
        cy.getByTestID("MAX_amount_button").click();
        cy.getByTestID("button_confirm_send_continue").should(
          "not.have.attr",
          "disabled",
        );
        cy.getByTestID("button_confirm_send_continue").click();
        cy.getByTestID("confirm_title").contains("You are sending");
        cy.getByTestID("text_send_amount").contains("9.90000000");
        cy.getByTestID("text_amount").contains("9.90000000 DFI");
        const usdValueWithThousandSep = Number(
          new BigNumber(9.9).multipliedBy(10000).toFixed(2),
        ).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        cy.getByTestID("text_amount_rhsUsdAmount").should(
          "have.text",
          `$${usdValueWithThousandSep}`,
        );
        cy.getByTestID("button_confirm_send").click().wait(3000);
        cy.closeOceanInterface();
        cy.getByTestID("bottom_tab_portfolio").click();
        cy.getByTestID("dfi_total_balance_amount").contains("0.09");
      });

      it(`should check if exist on other side ${address}`, () => {
        cy.wrap(whale.address.getBalance(address)).then((response) => {
          const updatedBalance = new BigNumber(response as string).minus(
            prevBalances[address],
          );
          expect(updatedBalance.toString()).contains("9.9");
        });
      });
    });
  });
});
