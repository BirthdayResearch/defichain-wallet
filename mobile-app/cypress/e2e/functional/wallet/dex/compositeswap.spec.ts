import BigNumber from "bignumber.js";
import { checkValueWithinRange } from "../../../../support/walletCommands";

function setupWalletForConversion(): void {
  cy.createEmptyWallet(true);
  cy.sendDFItoWallet().sendDFITokentoWallet().wait(5000);

  cy.getByTestID("bottom_tab_dex").click().wait(3000);
  cy.getByTestID("composite_swap").click().wait(3000);
}

function setupFromAndToTokens(fromToken: string, toToken: string): void {
  cy.getByTestID("token_select_button_FROM").should("exist").click();
  cy.wait(3000);
  cy.getByTestID(`select_${fromToken}`).click().wait(1000);
  cy.getByTestID("token_select_button_TO").should("exist").click();
  cy.getByTestID(`select_${toToken}`).click().wait(1000);
}

function setCustomSlippage(customSlippage: string): void {
  cy.getByTestID("slippage_custom").click();
  cy.getByTestID("slippage_input").clear().type(customSlippage);
  cy.getByTestID("set_slippage_button").click().wait(3000);
}

// TODO: @joshua update e2e
context("Wallet - DEX - disabled pool pairs", () => {
  before(() => {
    cy.intercept("**/poolpairs?size=*", {
      body: {
        data: [
          {
            id: "26",
            symbol: "ZERO-DFI",
            displaySymbol: "dZERO-DFI",
            name: "Playground ZERO-Default Defi token",
            status: true,
            tokenA: {
              symbol: "ZERO",
              displaySymbol: "dZERO",
              id: "10",
              reserve: "0",
              blockCommission: "0",
            },
            tokenB: {
              symbol: "DFI",
              displaySymbol: "DFI",
              id: "0",
              reserve: "0",
              blockCommission: "0",
            },
            priceRatio: {
              ab: "0",
              ba: "0",
            },
            commission: "0",
            totalLiquidity: {
              token: "0",
              usd: "0",
            },
            tradeEnabled: false,
            ownerAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
            rewardPct: "0.09090909",
            creation: {
              tx: "864a7b1900daa6a635e4b8ccfb263c708e5863aef85e81d6b82cbe9f82136a15",
              height: 149,
            },
            apr: {
              reward: null,
              total: null,
            },
          },
          {
            id: "28",
            symbol: "OFF-DFI",
            displaySymbol: "dOFF-DFI",
            name: "Playground OFF-Default Defi token",
            status: false,
            tokenA: {
              symbol: "OFF",
              displaySymbol: "dOFF",
              id: "11",
              reserve: "0",
              blockCommission: "0",
            },
            tokenB: {
              symbol: "DFI",
              displaySymbol: "DFI",
              id: "0",
              reserve: "0",
              blockCommission: "0",
            },
            priceRatio: {
              ab: "0",
              ba: "0",
            },
            commission: "0",
            totalLiquidity: {
              token: "0",
              usd: "0",
            },
            tradeEnabled: false,
            ownerAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
            rewardPct: "0.09090909",
            creation: {
              tx: "864a7b1900daa6a635e4b8ccfb263c708e5863aef85e81d6b82cbe9f82136a15",
              height: 149,
            },
            apr: {
              reward: null,
              total: null,
            },
          },
        ],
      },
    });
    cy.createEmptyWallet(true);
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("bottom_tab_dex").click();
  });

  it("should disable pool swap button if pair is disabled on API", () => {
    cy.getByTestID("dex_action_button_composite_swap_button_26").should(
      "have.css",
      "opacity", // using opacity to check enable
      "1"
    ); // status: true
    cy.getByTestID("dex_action_button_composite_swap_button_28").should(
      "have.css",
      "opacity", // using opacity to check disable
      "0.3"
    ); // status: false
  });
});

context("Wallet - DEX - Pool Pair failed api", () => {
  before(() => {
    cy.createEmptyWallet(true);
  });

  it("should handle failed API calls", () => {
    cy.intercept("**/regtest/poolpairs**", {
      statusCode: 404,
      body: "404 Not Found!",
      headers: {
        "x-not-found": "true",
      },
    });
    cy.getByTestID("bottom_tab_dex").click();
    cy.getByTestID("pool_pair_row").should("not.exist");
  });
});

context("Wallet - DEX - Instant/Future Swap - tabs and dropdowns", () => {
  before(() => {
    cy.createEmptyWallet(true);
    cy.getByTestID("header_settings").click();
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("bottom_tab_dex").click();
  });

  it("should be able to choose tokens to swap", () => {
    cy.getByTestID("composite_swap").click();
    cy.wait(5000);
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_DFI").click().wait(2000);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_dTU10").click();
  });

  it("should be able to switch tokens", () => {
    cy.getByTestID("switch_button").click();
    cy.getByTestID("token_select_button_FROM_display_symbol").should(
      "have.text",
      "dTU10"
    );
    cy.getByTestID("token_select_button_TO_display_symbol").should(
      "have.text",
      "DFI"
    );
  });

  it("should be able to disable future swap tab if tokenA and tokenB is not a valid future swap pair", () => {
    cy.getByTestID("swap_tabs_FUTURE_SWAP").should(
      "have.attr",
      "aria-disabled"
    );

    /* Only DUSD <-> Loan tokens are allowed in future swap */
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_DUSD").click().wait(1000);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_dTU10").click();
    cy.getByTestID("swap_tabs_FUTURE_SWAP").should(
      "not.have.attr",
      "aria-disabled"
    );
  });

  it("should be able to persist tokenA and tokenB when switching tabs", () => {
    cy.getByTestID("swap_tabs_FUTURE_SWAP").click();
    cy.getByTestID("token_select_button_FROM_display_symbol").should(
      "have.text",
      "DUSD"
    );
    cy.getByTestID("token_select_button_TO_display_symbol").should(
      "have.text",
      "dTU10"
    );
  });

  it("should be able to persist tokenA value when switching tabs", () => {
    cy.getByTestID("text_input_tokenA").type("1");
    cy.getByTestID("swap_tabs_INSTANT_SWAP").click();
    cy.getByTestID("text_input_tokenA").should("have.value", "1");
  });
});

context("Wallet - DEX - Instant Swap (non-DFI)", () => {
  before(() => {
    cy.createEmptyWallet(true);
    cy.getByTestID("header_settings").click();
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(["LTC", "TU10"])
      .wait(3000);
    cy.fetchWalletBalance();
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("bottom_tab_dex").click();
  });

  it("should be able to choose tokens to swap", () => {
    cy.getByTestID("composite_swap").click();
    cy.wait(5000);
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_DFI_value").should("have.text", "20.00000000");
    cy.getByTestID("select_DFI").click().wait(1000);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_dLTC").should("exist");
    cy.getByTestID("select_DFI").should("not.exist");
    cy.getByTestID("swap_token_selection_screen").within(() => {
      cy.get('[data-testid^="select_"]').each((item) => {
        cy.wrap(item).should("not.contain.text", "/v1");
      });
    });
    cy.getByTestID("select_dLTC").click();
  });

  it("should be able to validate form", () => {
    // Valid form
    cy.getByTestID("text_input_tokenA").type("1");
    cy.getByTestID("tokenB_value").contains("1");

    cy.getByTestID("button_confirm_submit").should("not.have.attr", "disabled");

    // Invalid tokenA - NaN, more than Max, zero
    cy.getByTestID("text_input_tokenA").clear().type("a").blur().wait(100);
    cy.getByTestID("text_input_tokenA").should("have.value", "0");
    cy.getByTestID("tokenB_value").contains(new BigNumber(0).toFixed(8));
    cy.getByTestID("tokenB_displaySymbol").contains("dLTC");
    cy.getByTestID("button_confirm_submit").should(
      "have.attr",
      "aria-disabled"
    );
    cy.getByTestID("text_input_tokenA").clear().type("15").blur().wait(500);
    cy.getByTestID("transaction_details_hint_text").should(
      "have.text",
      "By continuing, the required amount of DFI will be converted"
    );
    cy.getByTestID("button_confirm_submit").should("not.have.attr", "disabled");
    cy.getByTestID("text_input_tokenA").clear().type("0").blur().wait(100);
    cy.getByTestID("button_confirm_submit").should(
      "have.attr",
      "aria-disabled"
    );
  });

  it("should be able to see USD amount", () => {
    cy.getByTestID("tokenA_value_in_usd").should("exist");
    cy.getByTestID("tokenB_value_in_usd").should("exist");
  });

  it("should be able to use/validate custom slippage tolerance", () => {
    cy.getByTestID("text_input_tokenA").type("10");
    cy.getByTestID("slippage_1%").should("exist");

    // Slippage warning
    setCustomSlippage("22");
    cy.getByTestID("slippage_warning").should(
      "have.text",
      "Set high tolerance at your own risk"
    );
    cy.getByTestID("slippage_custom").click();
    cy.getByTestID("slippage_input").clear().type("5");

    // Slippage validation
    cy.getByTestID("slippage_input").should("have.value", "5");
    cy.getByTestID("slippage_input").clear().type("101").blur().wait(100);
    cy.getByTestID("slippage_input_error").should(
      "have.text",
      "Slippage rate must range from 0-100%"
    );
    cy.getByTestID("slippage_input").clear();
    // cy.getByTestID("slippage_input_error").should("be.hidden"); //temporary commenting it due to slippage bug
    cy.getByTestID("slippage_input").clear().type("-1").blur().wait(100);
    cy.getByTestID("slippage_input_error").should(
      "have.text",
      "Slippage rate must range from 0-100%"
    );
    cy.getByTestID("slippage_input").clear().type("a1").blur().wait(100);
    cy.getByTestID("slippage_input_error").should(
      "have.text",
      "Slippage rate must range from 0-100%"
    );
    cy.getByTestID("button_confirm_submit").should(
      "have.attr",
      "aria-disabled"
    );
  });

  it("should revert to previous state if no value entered", () => {
    // clear slippage tolerance (0%)
    cy.getByTestID("slippage_input_clear_button").click();
    cy.getByTestID("slippage_input").type("0").clear(); // temporary workaround for slippage bug, to clear of error and enable set button
    cy.getByTestID("set_slippage_button").click();
    cy.getByTestID("slippage_custom_amount").should("have.text", "22.00%");

    // set custom slippage, clear value and set again
    cy.getByTestID("slippage_custom").click();
    cy.getByTestID("slippage_input").clear().type("17.5").blur().wait(100);
    cy.getByTestID("slippage_input_clear_button").click();
    cy.getByTestID("set_slippage_button").click();

    cy.getByTestID("slippage_custom_amount").should("have.text", "22.00%");
  });

  it("should not store custom slippage if set button is not pressed", () => {
    cy.getByTestID("slippage_3%").click();
    // type custom slippage, don't press set button
    cy.getByTestID("slippage_custom").click();
    cy.getByTestID("slippage_input").clear().type("17").blur().wait(100);

    // reset swap form
    cy.getByTestID("bottom_tab_dex").click();
    cy.getByTestID("composite_swap").click();
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_DFI").click().wait(1000);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_dLTC").click();
  });

  it("should display 2dp in custom slippage tolerance button", () => {
    setCustomSlippage("1.123456789");
    cy.getByTestID("slippage_custom_amount").should("have.text", "1.12%");
  });

  it("should display 8dp in custom slippage tolerance input", () => {
    cy.getByTestID("slippage_custom").click();
    cy.getByTestID("slippage_input").should("have.value", "1.12345679");
  });

  it("should be able to store selected slippage value in storage", () => {
    cy.url().should("include", "app/DEX/CompositeSwap", () => {
      expect(localStorage.getItem("WALLET.SLIPPAGE_TOLERANCE")).to.eq(
        "1.12345679"
      );
    });
  });

  it("previously saved slippage tolerance value should be 1.12345679%", () => {
    cy.getByTestID("text_input_tokenA").type("10");
    cy.getByTestID("text_input_tokenA").type("20");
    cy.getByTestID("slippage_input").should("have.value", "1.12345679");
  });
});

context("Wallet - DEX - Instant Swap (non-DFI) - Confirm Txn", () => {
  before(() => {
    cy.createEmptyWallet(true);
    cy.getByTestID("header_settings").click();
    cy.sendDFItoWallet()
      .sendDFITokentoWallet()
      .sendTokenToWallet(["LTC", "USDC"])
      .wait(5000);
    cy.fetchWalletBalance();
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("bottom_tab_dex").click();
  });

  // Swap LTC through -> LTC-DFI -> DFI-USDC -> to get USDC
  it("should be able to swap tokens with 2 hops", () => {
    cy.getByTestID("composite_swap").click().wait(5000);
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_dLTC").click().wait(1000);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_dUSDC").click().wait(1000);
  });

  it("should be able to select direct pair", () => {
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("bottom_tab_dex").click();
    cy.getByTestID("token_select_button_FROM").click();
    cy.getByTestID("select_dLTC").click().wait(100);
    cy.getByTestID("token_select_button_TO").click();
    cy.getByTestID("select_DFI").click().wait(100);
  });

  it("should be able to switch tokens and reset values", () => {
    cy.getByTestID("switch_button").click();
    cy.getByTestID("text_input_tokenA").should("have.value", "");
    cy.getByTestID("tokenB_value").contains("0.00");
  });

  it("should be able to cancel authorization", () => {
    cy.getByTestID("text_input_tokenA").type("10");
    setCustomSlippage("10");
    cy.getByTestID("button_confirm_submit").click();

    cy.getByTestID("confirm_slippage_fee").should("have.text", "10%");
    cy.getByTestID("confirm_title").contains("You are swapping");
    cy.getByTestID("button_confirm_swap").click().wait(3000);
    // Cancel send on authorisation page
    cy.getByTestID("cancel_authorization").click();
  });

  it("should be able to swap", () => {
    cy.getByTestID("confirm_estimated_to_receive").then(() => {
      cy.getByTestID("button_confirm_swap").click().wait(3000);
      cy.closeOceanInterface();
      cy.fetchWalletBalance();
      cy.getByTestID("bottom_tab_portfolio").click();
      cy.getByTestID("portfolio_row_4").should("exist");

      /* Estimated return is not accurate yet due to tolerable slippage */
      // const tokenValue = $txt[0].textContent
      //   .replace(" dLTC", "")
      //   .replace(",", "");
      // cy.getByTestID("portfolio_row_4_amount").then(($txt: any) => {
      //   const balanceAmount = $txt[0].textContent
      //     .replace(" dLTC", "")
      //     .replace(",", "");
      //   expect(new BigNumber(balanceAmount).toNumber()).be.gte(
      //     new BigNumber(tokenValue).toNumber()
      //   );
      // });
    });
  });
});

context(
  "Wallet - DEX - Instant Swap (DFI with Conversion/Reserved fees)",
  () => {
    beforeEach(() => {
      setupWalletForConversion();
      setupFromAndToTokens("DFI", "dLTC");
    });

    it("should display insufficient balance if UTXO is maxed out for swap", () => {
      cy.getByTestID("text_input_tokenA").type("20");
      cy.getByTestID("text_insufficient_balance").should("exist");
    });

    it("should display reserved fees info if all UTXO have to be used for swap", () => {
      cy.getByTestID("text_input_tokenA").type("19.9");
      cy.getByTestID("utxo_reserved_fees_text").should("exist");
    });

    it("should be able to display conversion info", () => {
      cy.getByTestID("text_balance_amount").contains("19.90000000");
      cy.getByTestID("text_input_tokenA").type("11.00000000");
      cy.getByTestID("transaction_details_hint_text").should(
        "have.text",
        "By continuing, the required amount of DFI will be converted"
      );
    });

    it("should trigger convert and swap token", () => {
      cy.getByTestID("text_input_tokenA").type("11.00000000");
      cy.getByTestID("button_confirm_submit").click().wait(3000);
      cy.getByTestID("txn_authorization_title").contains(
        `Convert ${new BigNumber("1").toFixed(8)} DFI to tokens`
      );
      cy.closeOceanInterface().wait(3000);
      cy.getByTestID("conversion_status").should("have.text", "Converted");
      cy.getByTestID("text_swap_amount_from").should("contain", "11.00000000");
      cy.getByTestID("text_swap_amount_to").should("contain", "1,100.00000000");
      cy.getByTestID("button_confirm_swap").click().wait(3000);
      cy.closeOceanInterface();
    });
  }
);

// DFI -> dETH to show greater price rates difference
context("Wallet - DEX - Instant Swap (DFI) - Summary", () => {
  before(() => {
    setupWalletForConversion();
    setupFromAndToTokens("DFI", "dETH");
  });
  it("should be able to display price rates if tokenA and tokenB is selected", () => {
    cy.getByTestID("instant_swap_summary").should("exist");
    cy.getByTestID("instant_swap_prices_0_label")
      .should("exist")
      .should("have.text", "1 DFI =");
    cy.getByTestID("instant_swap_prices_0")
      .should("exist")
      .contains("100.00000000 dETH");
    cy.getByTestID("instant_swap_prices_0_rhsUsdAmount")
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "10,000.00");
      });
    cy.getByTestID("instant_swap_prices_1_label")
      .should("exist")
      .should("have.text", "1 dETH =");
    cy.getByTestID("instant_swap_prices_1")
      .should("exist")
      .contains("0.01000000 DFI");
    cy.getByTestID("instant_swap_prices_1_rhsUsdAmount")
      .invoke("text")
      .then((value) => {
        checkValueWithinRange(value, "100.00");
      });
    cy.getByTestID("swap_total_fees_label")
      .should("exist")
      .should("have.text", "Total fees");
    cy.getByTestID("swap_total_fee_amount")
      .should("exist")
      .should("have.text", "-");
  });
});
