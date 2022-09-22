// context("Wallet - Portfolio -> Pending Future Swap Display", () => {
//   beforeEach(() => {
//     cy.intercept(
//       {
//         pathname: "**/rpc",
//       },
//       (req) => {
//         if (JSON.stringify(req.body).includes("getpendingfutureswap")) {
//           req.alias = "getpendingfutureswap";
//           req.continue((res) => {
//             res.send({
//               body: {
//                 result: {
//                   values: [
//                     {
//                       source: "1.123@DUSD",
//                       destination: "TU10",
//                     },
//                     {
//                       source: "1.234@DUSD",
//                       destination: "TU10",
//                     },
//                     {
//                       source: "321.987654@TU10",
//                       destination: "DUSD",
//                     },
//                     {
//                       source: "1.345@DUSD",
//                       destination: "TS25",
//                     },
//                   ],
//                 },
//               },
//             });
//           });
//         }
//       }
//     );
//     cy.createEmptyWallet(true);
//     cy.getByTestID("bottom_tab_portfolio").click();
//   });
//
//   it("should display the pending future swaps", () => {
//     cy.getByTestID("future_swap_button").should("exist");
//   });
//
//   it("should navigate to and back to pending future swaps", () => {
//     cy.getByTestID("future_swap_button").click();
//     cy.go("back");
//     cy.getByTestID("future_swap_button").click();
//   });
//
//   it("should display swap amount and symbol", () => {
//     cy.getByTestID("future_swap_button").click();
//
//     cy.getByTestID("dTU10-DUSD_amount").should(
//       "have.text",
//       "321.98765400 dTU10"
//     );
//     cy.getByTestID("dTU10-DUSD_destination_symbol").should(
//       "have.text",
//       "to DUSD"
//     );
//
//     cy.getByTestID("DUSD-dTS25_amount").should("have.text", "1.34500000 DUSD");
//     cy.getByTestID("DUSD-dTS25_destination_symbol").should(
//       "have.text",
//       "to dTS25"
//     );
//   });
//
//   it("should sum out amount of same source and destination swaps", () => {
//     cy.getByTestID("future_swap_button").click();
//     cy.getByTestID("DUSD-dTU10_amount").should("have.text", "2.35700000 DUSD");
//     cy.getByTestID("DUSD-dTU10_destination_symbol").should(
//       "have.text",
//       "to dTU10"
//     );
//   });
//
//   it("should display +5% if DUSD -> loan token", () => {
//     cy.getByTestID("future_swap_button").click();
//     cy.getByTestID("DUSD-dTU10_oracle_price").should(
//       "have.text",
//       "Settlement value (+5%)"
//     );
//   });
//
//   it("should display -5% if loan token -> DUSD", () => {
//     cy.getByTestID("future_swap_button").click();
//     cy.getByTestID("dTU10-DUSD_oracle_price").should(
//       "have.text",
//       "Settlement value (-5%)"
//     );
//   });
// });
