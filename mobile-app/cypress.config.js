// eslint-disable-next-line import/no-extraneous-dependencies
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "oqk3fk",
  fixturesFolder: false,
  viewportWidth: 1500,
  viewportHeight: 900,
  orientation: "portrait",
  retries: {
    runMode: 1,
    openMode: 1,
  },
  numTestsKeptInMemory: 0,
  chromeWebSecurity: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      // eslint-disable-next-line global-require
      return require("./cypress/plugins/index")(on, config);
    },
    baseUrl: "http://localhost:19000",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    excludeSpecPattern:[

      // Functional/Wallet/Portfolio
      "cypress/e2e/functional/wallet/portfolio/portfolio.spec.ts",
      "cypress/e2e/functional/wallet/portfolio/tokenDetail.spec.ts",
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
      "cypress/e2e/functional/wallet/dex/swap/swap_future_transaction.spec.ts",
      "cypress/e2e/functional/wallet/dex/swap/swap_instant_dfi.spec.ts",
      "cypress/e2e/functional/wallet/dex/swap/swap_instant_non_dfi_confirmation.spec.ts",
      // Functional/Wallet/Loans
      "cypress/e2e/functional/wallet/loans/loans_payback.spec.ts",
      "cypress/e2e/functional/wallet/loans/vault_detail.spec.ts",
      "cypress/e2e/functional/wallet/loans/collateral.spec.ts",
      "cypress/e2e/functional/wallet/loans/create_vault.spec.ts",
      "cypress/e2e/functional/wallet/loans/loans_unloop_dusd.spec.ts",
      "cypress/e2e/functional/wallet/loans/loans_with_dfi_dusd_vault_share.spec.ts",
      // Functional/Wallet/Portfolio
      "cypress/e2e/functional/wallet/portfolio/addresses.spec.ts",
      "cypress/e2e/functional/wallet/portfolio/cfp_dfip.spec.ts",
      "cypress/e2e/functional/wallet/portfolio/send.spec.ts",
      "cypress/e2e/functional/wallet/portfolio/convert/convert.spec.ts",
      "cypress/e2e/functional/wallet/portfolio/poolpairRewards.spec.ts",
      // Functional/Wallet/Settings
      "cypress/e2e/functional/wallet/settings/addressBook.spec.ts",
     // "cypress/e2e/functional/wallet/settings/serviceProvider.spec.ts",
      // Functional/Wallet/Transaction
      "cypress/e2e/functional/wallet/transaction/list_empty.spec.ts",
      // Smoke
      "cypress/e2e/smoke/smoke.spec.ts"
    ]

  },
});
