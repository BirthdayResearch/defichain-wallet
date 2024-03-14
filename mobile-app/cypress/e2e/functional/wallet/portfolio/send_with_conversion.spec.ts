import { WhaleApiClient } from "@defichain/whale-api-client";
import BigNumber from "bignumber.js";

BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

context("Wallet - Send - with Conversion", { testIsolation: false }, () => {
  let whale: WhaleApiClient;
  before(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  const addresses = [
    "bcrt1qh5callw3zuxtnks96ejtekwue04jtnm84f04fn",
    "bcrt1q6ey8k3w0ll3cn5sg628nxthymd3une2my04j4n",
  ];
  const prevBalances: { [key: string]: string } = {};

  beforeEach(() => {
    cy.createEmptyWallet(true);
    cy.sendDFItoWallet().sendDFITokentoWallet().sendDFITokentoWallet();
    cy.wait(6000);
    cy.getByTestID("dfi_total_balance_amount").contains("30.00000000");

    const network = localStorage.getItem("Development.NETWORK");
    whale = new WhaleApiClient({
      url:
        network === "Playground"
          ? "https://playground.jellyfishsdk.com"
          : "http://localhost:19553",
      network: "regtest",
      version: "v0",
    });
  });

  addresses.forEach((address) => {
    describe(`check for address ${address}`, () => {
      it(`should be able to send to address ${address}`, () => {
        cy.getByTestID("bottom_tab_portfolio").click();
        cy.wrap(whale.address.getBalance(address)).then((response: any) => {
          prevBalances[address] = response;
        });
        cy.getByTestID("bottom_tab_portfolio").click();
        cy.getByTestID("portfolio_list").should("exist");
        cy.getByTestID("dfi_balance_card").should("exist");
        cy.getByTestID("action_button_group").should("exist");
        cy.getByTestID("send_balance_button").click().wait(3000);
        cy.getByTestID("select_DFI").click().wait(3000);
        cy.getByTestID("address_input").clear().type(address);
        cy.getByTestID("amount_input").type("12");
        cy.getByTestID("transaction_details_info_text").should(
          "contain",
          "By continuing, the required amount of DFI will be converted",
        );

        cy.getByTestID("button_confirm_send_continue").click();
        cy.getByTestID("txn_authorization_title").contains(
          `Convert ${new BigNumber("2.1").toFixed(8)} DFI to UTXO`,
        );
        cy.closeOceanInterface().wait(3000);

        cy.getByTestID("amount_to_convert_label").should(
          "have.text",
          "Amount to convert",
        );
        cy.getByTestID("amount_to_convert_value").should(
          "contain",
          "2.10000000 DFI",
        );
        cy.getByTestID("conversion_status").should("have.text", "Converted");
        cy.getByTestID("transaction_fee_label").should(
          "have.text",
          "Transaction fee",
        );
        cy.getByTestID("transaction_fee_value").should("exist");

        cy.getByTestID("text_amount").should("have.text", "12.00000000 DFI");
        const usdValueWithThousandSep = Number(
          new BigNumber(12).multipliedBy(10000).toFixed(2),
        ).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        cy.getByTestID("text_amount_rhsUsdAmount").should(
          "have.text",
          `$${usdValueWithThousandSep}`,
        );

        cy.getByTestID("text_send_amount").should("contain", "12.00000000");
        cy.getByTestID("button_confirm_send").click().wait(3000);
        cy.closeOceanInterface();
      });

      it(`should check if exist on other side ${address}`, () => {
        cy.wrap(whale.address.getBalance(address)).then((response) => {
          const updatedBalance = new BigNumber(response as string).minus(
            prevBalances[address],
          );
          expect(updatedBalance.toString()).contains("12");
        });
      });
    });
  });
});
