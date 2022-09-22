// context("Wallet - DEX - disabled pool pairs", () => {
//   before(() => {
//     cy.intercept("**/poolpairs?size=*", {
//       body: {
//         data: [
//           {
//             id: "26",
//             symbol: "ZERO-DFI",
//             displaySymbol: "dZERO-DFI",
//             name: "Playground ZERO-Default Defi token",
//             status: true,
//             tokenA: {
//               symbol: "ZERO",
//               displaySymbol: "dZERO",
//               id: "10",
//               reserve: "0",
//               blockCommission: "0",
//             },
//             tokenB: {
//               symbol: "DFI",
//               displaySymbol: "DFI",
//               id: "0",
//               reserve: "0",
//               blockCommission: "0",
//             },
//             priceRatio: {
//               ab: "0",
//               ba: "0",
//             },
//             commission: "0",
//             totalLiquidity: {
//               token: "0",
//               usd: "0",
//             },
//             tradeEnabled: false,
//             ownerAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
//             rewardPct: "0.09090909",
//             creation: {
//               tx: "864a7b1900daa6a635e4b8ccfb263c708e5863aef85e81d6b82cbe9f82136a15",
//               height: 149,
//             },
//             apr: {
//               reward: null,
//               total: null,
//             },
//           },
//           {
//             id: "28",
//             symbol: "OFF-DFI",
//             displaySymbol: "dOFF-DFI",
//             name: "Playground OFF-Default Defi token",
//             status: false,
//             tokenA: {
//               symbol: "OFF",
//               displaySymbol: "dOFF",
//               id: "11",
//               reserve: "0",
//               blockCommission: "0",
//             },
//             tokenB: {
//               symbol: "DFI",
//               displaySymbol: "DFI",
//               id: "0",
//               reserve: "0",
//               blockCommission: "0",
//             },
//             priceRatio: {
//               ab: "0",
//               ba: "0",
//             },
//             commission: "0",
//             totalLiquidity: {
//               token: "0",
//               usd: "0",
//             },
//             tradeEnabled: false,
//             ownerAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
//             rewardPct: "0.09090909",
//             creation: {
//               tx: "864a7b1900daa6a635e4b8ccfb263c708e5863aef85e81d6b82cbe9f82136a15",
//               height: 149,
//             },
//             apr: {
//               reward: null,
//               total: null,
//             },
//           },
//         ],
//       },
//     });
//     cy.createEmptyWallet(true);
//     cy.getByTestID("bottom_tab_portfolio").click();
//     cy.getByTestID("bottom_tab_dex").click();
//   });
//
//   it("should disable pool swap button if pair is disabled on API", () => {
//     cy.getByTestID("dex_action_button_composite_swap_button_26").should(
//       "have.css",
//       "opacity", // using opacity to check enable
//       "1"
//     ); // status: true
//     cy.getByTestID("dex_action_button_composite_swap_button_28").should(
//       "have.css",
//       "opacity", // using opacity to check disable
//       "0.3"
//     ); // status: false
//   });
// });
//
// context("Wallet - DEX - Pool Pair failed api", () => {
//   before(() => {
//     cy.createEmptyWallet(true);
//   });
//
//   it("should handle failed API calls", () => {
//     cy.intercept("**/regtest/poolpairs**", {
//       statusCode: 404,
//       body: "404 Not Found!",
//       headers: {
//         "x-not-found": "true",
//       },
//     });
//     cy.getByTestID("bottom_tab_dex").click();
//     cy.getByTestID("pool_pair_row").should("not.exist");
//   });
// });
//
// context("Wallet - DEX - Instant/Future Swap - tabs and dropdowns", () => {
//   before(() => {
//     cy.createEmptyWallet(true);
//     cy.getByTestID("header_settings").click();
//     cy.getByTestID("bottom_tab_portfolio").click();
//     cy.getByTestID("bottom_tab_dex").click();
//   });
//
//   it("should be able to choose tokens to swap", () => {
//     cy.getByTestID("composite_swap").click();
//     cy.wait(5000);
//     cy.getByTestID("token_select_button_FROM").click();
//     cy.getByTestID("select_DFI").click().wait(2000);
//     cy.getByTestID("token_select_button_TO").click();
//     cy.getByTestID("select_dTU10").click();
//   });
//
//   it("should be able to switch tokens", () => {
//     cy.getByTestID("switch_button").click();
//     cy.getByTestID("token_select_button_FROM_display_symbol").should(
//       "have.text",
//       "dTU10"
//     );
//     cy.getByTestID("token_select_button_TO_display_symbol").should(
//       "have.text",
//       "DFI"
//     );
//   });
//
//   it("should be able to disable future swap tab if tokenA and tokenB is not a valid future swap pair", () => {
//     cy.getByTestID("swap_tabs_FUTURE_SWAP").should(
//       "have.attr",
//       "aria-disabled"
//     );
//
//     /* Only DUSD <-> Loan tokens are allowed in future swap */
//     cy.getByTestID("token_select_button_FROM").click();
//     cy.getByTestID("select_DUSD").click().wait(1000);
//     cy.getByTestID("token_select_button_TO").click();
//     cy.getByTestID("select_dTU10").click();
//     cy.getByTestID("swap_tabs_FUTURE_SWAP").should(
//       "not.have.attr",
//       "aria-disabled"
//     );
//   });
//
//   it("should be able to persist tokenA and tokenB when switching tabs", () => {
//     cy.getByTestID("swap_tabs_FUTURE_SWAP").click();
//     cy.getByTestID("token_select_button_FROM_display_symbol").should(
//       "have.text",
//       "DUSD"
//     );
//     cy.getByTestID("token_select_button_TO_display_symbol").should(
//       "have.text",
//       "dTU10"
//     );
//   });
//
//   it("should be able to persist tokenA value when switching tabs", () => {
//     cy.getByTestID("text_input_tokenA").type("1");
//     cy.getByTestID("swap_tabs_INSTANT_SWAP").click();
//     cy.getByTestID("text_input_tokenA").should("have.value", "1");
//   });
// });
