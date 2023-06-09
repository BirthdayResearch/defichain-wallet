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
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.ts")(on, config);
    },
    baseUrl: "http://localhost:19006",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    excludeSpecPattern:[
      // Functional/Wallet/Auctions
      "cypress/e2e/functional/wallet/auctions/auctions.spec.ts",
      "cypress/e2e/functional/wallet/auctions/auctions_bid_with_multiple_wallet.spec.ts",
      // Functional/Wallet/Authorization
      "cypress/e2e/functional/wallet/authorization/transactionAuthorization.spec.ts",
      // Functional/Wallet/Dex
      "cypress/e2e/functional/wallet/dex/add_liquidity.spec.ts",
      "cypress/e2e/functional/wallet/dex/dex_poolpairs.spec.ts",
      "cypress/e2e/functional/wallet/dex/dex_features.spec.ts",
      // Functional/Wallet/Dex/Swap
      "cypress/e2e/functional/wallet/dex/swap/swap_future.spec.ts",
      "cypress/e2e/functional/wallet/dex/swap/swap_future_withdraw.spec.ts",
      // Functional/Wallet/Loans
      "cypress/e2e/functional/wallet/loans/loans_payback.spec.ts",
      "cypress/e2e/functional/wallet/loans/vault_detail.spec.ts",
      // Functional/Wallet/Portfolio
      "cypress/e2e/functional/wallet/portfolio/addresses.spec.ts",
      "cypress/e2e/functional/wallet/portfolio/cfp_dfip.spec.ts",
      "cypress/e2e/functional/wallet/portfolio/send.spec.ts",
      // Functional/Wallet/Settings
      "cypress/e2e/functional/wallet/settings/serviceProvider.spec.ts",
      // Functional/Wallet/Transaction
      "cypress/e2e/functional/wallet/transaction/list_empty.spec.ts"
    ]

  },
});
