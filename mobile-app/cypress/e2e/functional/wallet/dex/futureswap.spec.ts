import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import { checkValueWithinRange } from "../../../../support/walletCommands";

/*
  Future swap settles every 20 blocks. To ensure that there"s ample time (20 blocks) to:
    Future Swap -> Withdraw Future Swap -> Do checks
  the flow must start to a block divisible by 20 + 1
*/
function waitUntilFutureSwapSettles(): void {
  cy.getByTestID("current_block_count_value")
    .invoke("text")
    .then((text: string) => {
      const currentBlockCount = new BigNumber(text);
      if (!currentBlockCount.modulo(20).isEqualTo(1)) {
        cy.wait(2000);
        waitUntilFutureSwapSettles();
      }
    });
}

function validatePriceSection(testID: string, isHidden: boolean): void {
  if (isHidden) {
    cy.getByTestID(`${testID}_0`).should("not.exist");
    cy.getByTestID(`${testID}_0_label`).should("not.exist");
    cy.getByTestID(`${testID}_1`).should("not.exist");
    cy.getByTestID(`${testID}_1_label`).should("not.exist");
  } else {
    cy.getByTestID(`${testID}_0`)
      .invoke("text")
      .then((text) => {
        const value = text.split(" ")[0];
        checkValueWithinRange(value, "1", 0.2);
      });
    cy.getByTestID(`${testID}_0_label`).contains("1 DUSD");
    cy.getByTestID(`${testID}_0`).contains("dTU10");

    cy.getByTestID(`${testID}_1`)
      .invoke("text")
      .then((text) => {
        const value = text.split(" ")[0];
        checkValueWithinRange(value, "1", 0.2);
      });
    cy.getByTestID(`${testID}_1_label`).contains("1 dTU10");
    cy.getByTestID(`${testID}_1`).contains("DUSD");
  }
}

function validateFutureSwapDisabled(
  fromToken: string | undefined,
  toToken: string
): void {
  if (fromToken !== undefined) {
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID(`select_${fromToken}`).click().wait(1000);
  }
  cy.getByTestID("token_select_button_TO").click();
  cy.getByTestID(`select_${toToken}`).click();
  cy.getByTestID("50%_amount_button").click().wait(500);
  cy.getByTestID("swap_tabs_FUTURE_SWAP").should("have.attr", "aria-disabled");
  cy.getByTestID("button_confirm_submit").click();
  cy.getByTestID("settlement_block_label").should("not.exist");
  cy.go("back");
}

context("Wallet - DEX - Future Swap", () => {
  before(() => {
    cy.createEmptyWallet(true);
    cy.sendDFITokentoWallet()
      .sendDFItoWallet()
      .sendTokenToWallet(["DUSD", "TU10", "BTC", "ETH"])
      .wait(4000);
    cy.fetchWalletBalance();
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("bottom_tab_dex").click();
    cy.getByTestID("composite_swap").click();
  });

  it("should have no swap option on crypto -> loan combination", () => {
    // crypto to loan token
    validateFutureSwapDisabled("dBTC", "dTU10");
  });

  it("should  have no swap option on crypto -> crpyto combination", () => {
    // crypto to crypto
    validateFutureSwapDisabled(undefined, "dETH");
  });

  it("should have both swap options on loan -> loan combination", () => {
    // loan (DUSD) to loan token
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_DUSD").click().wait(1000);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_dTU10").click();
    cy.getByTestID("50%_amount_button").click().wait(500);
    cy.getByTestID("swap_tabs_FUTURE_SWAP").should(
      "not.have.attr",
      "aria-disabled"
    );
    cy.getByTestID("button_confirm_submit").click().wait(1500);
    cy.getByTestID("settlement_block_label").should("not.exist");
    cy.go("back");
    cy.getByTestID("swap_tabs_FUTURE_SWAP").click();
    cy.getByTestID("button_confirm_submit").click().wait(1500);
    cy.getByTestID("settlement_block_label").should("exist");
    cy.go("back");
  });

  it("should have no swap option on loan -> crypto combination", () => {
    // loan to crypto token
    cy.getByTestID("swap_tabs_INSTANT_SWAP").click();
    validateFutureSwapDisabled("dTU10", "dBTC");
  });

  it("should have no swap option on dfi -> crypto combination", () => {
    // dfi to crypto token
    validateFutureSwapDisabled("DFI", "dBTC");
  });

  it("should display future swap option if Loan token -> DUSD selected", () => {
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_dTU10").click().wait(1000);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_DUSD").click();
    cy.getByTestID("swap_tabs_FUTURE_SWAP").should(
      "not.have.attr",
      "aria-disabled"
    );
  });

  it("should display oracle price -5% if Loan token -> DUSD selected", () => {
    cy.getByTestID("swap_tabs_FUTURE_SWAP").click();
    cy.getByTestID("MAX_amount_button").click();
    cy.getByTestID("settlement_value_percentage").should(
      "have.text",
      "Settlement Value -5%"
    );
    cy.getByTestID("oracle_announcements_banner").contains(
      "You are selling your"
    );
    cy.getByTestID("oracle_announcements_banner").contains("dTU10 at 5% less");
    cy.getByTestID("oracle_announcements_banner").contains(
      "than the oracle price at settlement block"
    );
  });

  it("should display future swap option if DUSD -> Loan token selected", () => {
    cy.wait(4000);
    cy.getByTestID("swap_tabs_INSTANT_SWAP").click();
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_DUSD").click().wait(1000);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_dTU10").click();
    cy.getByTestID("swap_tabs_FUTURE_SWAP").should(
      "not.have.attr",
      "aria-disabled"
    );
    cy.getByTestID("MAX_amount_button").click();
  });

  it("should display price rates on instant swap", () => {
    validatePriceSection("instant_swap_prices", false);
    cy.getByTestID("button_confirm_submit").click();
    validatePriceSection("instant_swap_summary", false);
    cy.go("back");
  });

  it("should not display price rates on future swap", () => {
    cy.getByTestID("swap_tabs_FUTURE_SWAP").click();
    validatePriceSection("instant_swap_prices", true);
    cy.getByTestID("button_confirm_submit").click();
    validatePriceSection("instant_swap_summary", true);
    cy.go("back");
  });

  it("should display oracle price +5% if DUSD to Loan token", () => {
    cy.getByTestID("settlement_value_percentage").should(
      "have.text",
      "Settlement Value +5%"
    );
    cy.getByTestID("oracle_announcements_banner").contains("You are buying");
    cy.getByTestID("oracle_announcements_banner").contains("dTU10 at 5% more");
    cy.getByTestID("oracle_announcements_banner").contains(
      "than the oracle price at settlement block"
    );
  });

  it("should disable continue button if amount is >available/zero/NaN/", () => {
    cy.getByTestID("text_input_tokenA").clear().type("a");
    cy.getByTestID("button_confirm_submit").should(
      "have.attr",
      "aria-disabled"
    );

    cy.getByTestID("text_input_tokenA").clear().type("0");
    cy.getByTestID("button_confirm_submit").should(
      "have.attr",
      "aria-disabled"
    );

    cy.getByTestID("text_input_tokenA").clear().type("1000");
    cy.getByTestID("button_confirm_submit").should(
      "have.attr",
      "aria-disabled"
    );
  });

  it("should display correct transaction details", () => {
    cy.getByTestID("swap_total_fee_amount").should("exist");
    cy.getByTestID("execution_block").should("exist");
    cy.getByTestID("execution_time_remaining").should("exist");
  });

  it("should display correct confirmation details", () => {
    cy.getByTestID("MAX_amount_button").click();
    cy.getByTestID("button_confirm_submit").click();
    cy.getByTestID("text_swap_amount_from").should("have.text", "10.00000000");
    cy.getByTestID("text_swap_amount_to_unit").should("have.text", "dTU10");
    cy.getByTestID("confirm_text_fee").should("exist");
    cy.getByTestID("confirm_text_settlement_block").should("exist");
    cy.getByTestID("confirm_text_transaction_date").should(
      "have.text",
      dayjs().add(30, "second").format("MMM D, YYYY, h:mm a")
    ); // blocksSeconds = 30
    cy.getByTestID("confirm_text_receive_unit").should("have.text", "dTU10");
    cy.getByTestID("confirm_settlement_value").should(
      "have.text",
      "Settlement value +5%"
    );
    cy.wait(3000);
    cy.getByTestID("button_confirm_swap").click().wait(3500);
    cy.getByTestID("txn_authorization_title").contains(
      "Swapping 10.00000000 DUSD to dTU10 on settlement block"
    );
    cy.closeOceanInterface().wait(5000);
  });
});

context("Wallet - Portfolio -> Pending Future Swap Display", () => {
  beforeEach(() => {
    cy.intercept(
      {
        pathname: "**/rpc",
      },
      (req) => {
        if (JSON.stringify(req.body).includes("getpendingfutureswap")) {
          req.alias = "getpendingfutureswap";
          req.continue((res) => {
            res.send({
              body: {
                result: {
                  values: [
                    {
                      source: "1.123@DUSD",
                      destination: "TU10",
                    },
                    {
                      source: "1.234@DUSD",
                      destination: "TU10",
                    },
                    {
                      source: "321.987654@TU10",
                      destination: "DUSD",
                    },
                    {
                      source: "1.345@DUSD",
                      destination: "TS25",
                    },
                  ],
                },
              },
            });
          });
        }
      }
    );
    cy.createEmptyWallet(true);
    cy.getByTestID("bottom_tab_portfolio").click();
  });

  it("should display the pending future swaps", () => {
    cy.getByTestID("future_swap_button").should("exist");
  });

  it("should navigate to and back to pending future swaps", () => {
    cy.getByTestID("future_swap_button").click();
    cy.go("back");
    cy.getByTestID("future_swap_button").click();
  });

  it("should display swap amount and symbol", () => {
    cy.getByTestID("future_swap_button").click();

    cy.getByTestID("dTU10-DUSD_amount").should(
      "have.text",
      "321.98765400 dTU10"
    );
    cy.getByTestID("dTU10-DUSD_destination_symbol").should(
      "have.text",
      "to DUSD"
    );

    cy.getByTestID("DUSD-dTS25_amount").should("have.text", "1.34500000 DUSD");
    cy.getByTestID("DUSD-dTS25_destination_symbol").should(
      "have.text",
      "to dTS25"
    );
  });

  it("should sum out amount of same source and destination swaps", () => {
    cy.getByTestID("future_swap_button").click();
    cy.getByTestID("DUSD-dTU10_amount").should("have.text", "2.35700000 DUSD");
    cy.getByTestID("DUSD-dTU10_destination_symbol").should(
      "have.text",
      "to dTU10"
    );
  });

  it("should display +5% if DUSD -> loan token", () => {
    cy.getByTestID("future_swap_button").click();
    cy.getByTestID("DUSD-dTU10_oracle_price").should(
      "have.text",
      "Settlement value (+5%)"
    );
  });

  it("should display -5% if loan token -> DUSD", () => {
    cy.getByTestID("future_swap_button").click();
    cy.getByTestID("dTU10-DUSD_oracle_price").should(
      "have.text",
      "Settlement value (-5%)"
    );
  });
});

context("Wallet - Future Swap -> Display -> Withdraw flow", () => {
  before(() => {
    cy.createEmptyWallet(true);
    cy.sendDFITokentoWallet()
      .sendDFItoWallet()
      .sendTokenToWallet(["TU10", "DUSD", "BTC"])
      .wait(3000);
    cy.fetchWalletBalance();
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("bottom_tab_dex").click();
    cy.getByTestID("composite_swap").click();
    cy.wait(5000);
  });

  it("should future swap DUSD -> dTU10", () => {
    waitUntilFutureSwapSettles();
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_DUSD").click().wait(1000);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_dTU10").click();
    cy.getByTestID("swap_tabs_FUTURE_SWAP").click();

    cy.getByTestID("MAX_amount_button").click();
    cy.getByTestID("button_confirm_submit").click();
    cy.wait(3000);
    cy.getByTestID("button_confirm_swap").click().wait(3000);
    cy.closeOceanInterface();
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("future_swap_button").click();
  });

  it("should display correct withdraw transaction details", () => {
    cy.getByTestID("DUSD-dTU10").click();
    cy.getByTestID("text_input_percentage").clear().type("6");
    cy.getByTestID("text_fee").should("exist");
    cy.getByTestID("button_continue_withdraw").click();
  });

  it("should display correct confirmation withdraw transaction details", () => {
    cy.getByTestID("confirm_title").should("have.text", "You are withdrawing");
    cy.getByTestID("title_tx_detail").should("have.text", "6.00000000");
    cy.getByTestID("text_fee").should("exist");
    cy.getByTestID("receive_value").should("have.text", "6.00000000 DUSD");
    cy.getByTestID("button_confirm_withdraw_future_swap").click().wait(3000);
    cy.getByTestID("txn_authorization_title").should(
      "have.text",
      "Withdrawing 6.00000000 DUSD from DUSD-dTU10 swap"
    );
    cy.closeOceanInterface();
  });

  it("should display partial withdrawal amount", () => {
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("future_swap_button").click();
    cy.getByTestID("DUSD-dTU10_amount").should("have.text", "4.00000000 DUSD");
  });

  it("should settle the future swap on next settlement block", () => {
    waitUntilFutureSwapSettles();
    cy.getByTestID("DUSD-dTU10_amount").should("not.exist");
  });
});
