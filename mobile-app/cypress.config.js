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
  },
  video: false,
  // screenshotOnRunFailure: false
});
