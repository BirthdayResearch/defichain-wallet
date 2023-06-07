const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "oqk3fk",
  fixturesFolder: false,
  viewportWidth: 1500,
  viewportHeight: 900,
  orientation: "portrait",
  retries: {
    runMode: 1,
    openMode: 0,
  },
  numTestsKeptInMemory: 0,
  chromeWebSecurity: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    // setupNodeEvents(on, config) {
    //   return require("./cypress/plugins/index.js")(on, config);
    // },
    baseUrl: "http://localhost:19006",
    specPattern: "mobile-app/cypress/e2e/**/*.{js,jsx,ts,tsx}",
    supportFile: "mobile-app/cypress/support/e2e.ts",
    excludeSpecPattern:[
      //Functional/Wallet/Auctions
      "mobile-app/cypress/e2e/functional/wallet/auctions/auctions.spec.ts",
      "mobile-app/cypress/e2e/functional/wallet/auctions/auctions_bid_with_multiple_wallet.spec.ts",
      //Functional/Wallet/Authorization
      "mobile-app/cypress/e2e/functional/wallet/authorization/transactionAuthorization.spec.ts",
      //Functional/Wallet/Dex
      "mobile-app/cypress/e2e/functional/wallet/dex/add_liquidity.spec.ts",
      "mobile-app/cypress/e2e/functional/wallet/dex/dex_poolpairs.spec.ts",
      //Functional/Wallet/Dex/Swap
      "mobile-app/cypress/e2e/functional/wallet/dex/swap/swap_future.spec.ts",
      "mobile-app/cypress/e2e/functional/wallet/dex/swap/swap_future_withdraw.spec.ts",
      //Functional/Wallet/Loans
      "mobile-app/cypress/e2e/functional/wallet/loans/loans_payback.spec.ts",
      "mobile-app/cypress/e2e/functional/wallet/loans/vault_detail.spec.ts",
      //Functional/Wallet/Portfolio
      "mobile-app/cypress/e2e/functional/wallet/portfolio/addresses.spec.ts",
      "mobile-app/cypress/e2e/functional/wallet/portfolio/cfp_dfip.specs.ts",
      "mobile-app/cypress/e2e/functional/wallet/portfolio/send.spec.ts",
      // Functional/Wallet/Settings
      "mobile-app/cypress/e2e/functional/wallet/settings/serviceProvider.spec.ts",
      //Functional/Wallet/Transaction
      "mobile-app/cypress/e2e/functional/wallet/transaction/list_empty.spec.spec.ts"
      


    ]
  },
});