// import BigNumber from "bignumber.js";
//
// function setupWalletForConversion(): void {
//   cy.createEmptyWallet(true);
//   cy.sendDFItoWallet().sendDFITokentoWallet().wait(5000);
//
//   cy.getByTestID("bottom_tab_dex").click().wait(3000);
//   cy.getByTestID("composite_swap").click().wait(3000);
// }
//
// function setupFromAndToTokens(fromToken: string, toToken: string): void {
//   cy.getByTestID("token_select_button_FROM").should("exist").click();
//   cy.wait(3000);
//   cy.getByTestID(`select_${fromToken}`).click().wait(1000);
//   cy.getByTestID("token_select_button_TO").should("exist").click();
//   cy.getByTestID(`select_${toToken}`).click().wait(1000);
// }
//
// context(
//   "Wallet - DEX - Instant Swap (DFI with Conversion/Reserved fees)",
//   () => {
//     beforeEach(() => {
//       setupWalletForConversion();
//       setupFromAndToTokens("DFI", "dLTC");
//     });
//
//     it("should display insufficient balance if UTXO is maxed out for swap", () => {
//       cy.getByTestID("text_input_tokenA").type("20");
//       cy.getByTestID("text_insufficient_balance").should("exist");
//     });
//
//     it("should display reserved fees info if all UTXO have to be used for swap", () => {
//       cy.getByTestID("text_input_tokenA").type("19.9");
//       cy.getByTestID("utxo_reserved_fees_text").should("exist");
//     });
//
//     it("should be able to display conversion info", () => {
//       cy.getByTestID("text_balance_amount").contains("19.90000000");
//       cy.getByTestID("text_input_tokenA").type("11.00000000");
//       cy.getByTestID("transaction_details_hint_text").should(
//         "have.text",
//         "By continuing, the required amount of DFI will be converted"
//       );
//     });
//
//     it("should trigger convert and swap token", () => {
//       cy.getByTestID("text_input_tokenA").type("11.00000000");
//       cy.getByTestID("button_confirm_submit").click().wait(3000);
//       cy.getByTestID("txn_authorization_title").contains(
//         `Convert ${new BigNumber("1").toFixed(8)} DFI to tokens`
//       );
//       cy.closeOceanInterface().wait(3000);
//       cy.getByTestID("conversion_status").should("have.text", "Converted");
//       cy.getByTestID("text_swap_amount_from").should("contain", "11.00000000");
//       cy.getByTestID("text_swap_amount_to").should("contain", "1,100.00000000");
//       cy.getByTestID("button_confirm_swap").click().wait(3000);
//       cy.closeOceanInterface();
//     });
//   }
// );
