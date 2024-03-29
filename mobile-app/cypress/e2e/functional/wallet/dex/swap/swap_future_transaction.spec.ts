import BigNumber from "bignumber.js";
import dayjs from "dayjs";

context(
  "Wallet - DEX - Future Swap -> Transaction",
  { testIsolation: false },
  () => {
    before(() => {
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.createEmptyWallet(true);
      cy.sendDFITokentoWallet()
        .sendDFItoWallet()
        .sendTokenToWallet(["DUSD", "TU10", "BTC", "ETH"])
        .wait(4000);
      cy.fetchWalletBalance();
      cy.getByTestID("bottom_tab_portfolio").click();
      cy.getByTestID("bottom_tab_dex").click();
      cy.getByTestID("composite_swap").click();
      cy.getByTestID("token_select_button_FROM").click();
      cy.getByTestID("select_DUSD").click().wait(1000);
      cy.getByTestID("token_select_button_TO").click();
      cy.getByTestID("select_dTU10").click();
    });

    it("should display correct transaction details", () => {
      cy.getByTestID("swap_tabs_FUTURE_SWAP").click();
      cy.getByTestID("swap_total_fee_amount").should("exist");
      cy.getByTestID("execution_block").should("exist");
      cy.getByTestID("execution_time_remaining").should("exist");
    });

    it("should display correct confirmation details", () => {
      cy.wait(1000);
      cy.getByTestID("MAX_amount_button").should("exist").click();
      cy.getByTestID("button_confirm_submit").click().wait(3000);
      cy.getByTestID("text_swap_amount_from").should(
        "have.text",
        "10.00000000",
      );
      cy.getByTestID("text_swap_amount_to_unit").should("have.text", "dTU10");
      cy.getByTestID("confirm_text_fee").should("exist");
      cy.getByTestID("confirm_text_settlement_block")
        .should("exist")
        .invoke("text")
        .then((settlementBlockNumber) => {
          cy.getByTestID("current_block_count_value")
            .invoke("text")
            .then((block: string) => {
              const settlementBlock = new BigNumber(settlementBlockNumber);
              const currentBlockCount = new BigNumber(block);
              const seconds = settlementBlock
                .minus(currentBlockCount)
                .multipliedBy(3)
                .toNumber();
              cy.getByTestID("confirm_text_transaction_date").should(
                "have.text",
                dayjs().add(seconds, "second").format("MMM D, YYYY, h:mm a"),
              );
            });
        });
      cy.getByTestID("confirm_text_receive_unit").should("have.text", "dTU10");
      cy.getByTestID("confirm_settlement_value").should(
        "have.text",
        "Settlement value +5%",
      );
      cy.wait(3000);
      cy.getByTestID("button_confirm_swap").should("exist").click();
      cy.wait(4000);
      cy.getByTestID("txn_authorization_title").contains(
        "Swapping 10.00000000 DUSD to dTU10 on settlement block",
      );
      cy.closeOceanInterface().wait(5000);
    });
  },
);
