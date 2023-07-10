import BigNumber from "bignumber.js";
import "@testing-library/cypress/add-commands";
import "./onboardingCommands";
import "./walletCommands";
import "./loanCommands";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";

/* eslint-disable @typescript-eslint/no-var-requires */
const compareSnapshotCommand = require("cypress-image-diff-js/dist/command");
compareSnapshotCommand();

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * @description Custom command to select DOM element by data-testid attribute.
       * @example cy.getByTestID('settings')
       */
      getByTestID: (value: string, opts?: any) => Chainable<Element>;

      /**
       * @description Redirects to main page and creates an empty wallet for testing. Useful on starts of tests.
       * @param {boolean} [isRandom=false] default = false, creates randomly generated mnemonic seed or abandon x23
       * @example cy.createEmptyWallet(isRandom?: boolean)
       */
      createEmptyWallet: (isRandom?: boolean) => Chainable<Element>;

      /**
       * @description Sends UTXO DFI to wallet.
       * @example cy.sendDFItoWallet().wait(4000)
       */
      sendDFItoWallet: () => Chainable<Element>;

      /**
       * @description Sends DFI Token to wallet.
       * @example cy.sendDFITokentoWallet().wait(4000)
       */
      sendDFITokentoWallet: () => Chainable<Element>;

      /**
       * @description Sends token to wallet. Accepts a list of token symbols to be sent.
       * @param {string[]} tokens to be sent
       * @example cy.sendTokenToWallet(['BTC', 'ETH']).wait(4000)
       */
      sendTokenToWallet: (tokens: string[]) => Chainable<Element>;

      /**
       * @description Wait for the ocean interface to be confirmed then close the drawer
       * @param {string} pin - accepts optional pin
       * @example cy.closeOceanInterface('000000')
       */
      closeOceanInterface: (pin?: string) => Chainable<Element>;

      /**
       * @description Exit current wallet
       * @example cy.exitWallet()
       */
      exitWallet: () => Chainable<Element>;

      /**
       * @description Fetch wallet balance
       * @example cy.fetchWalletBalance()
       */
      fetchWalletBalance: () => Chainable<Element>;

      /**
       * @description Switch networks via app
       * @param {string} network to be used
       * @example cy.switchToMainnet('MainNet')
       */
      switchNetwork: (network: string) => Chainable<Element>;

      /**
       * @description Stores local storage for dependent tests
       */
      saveLocalStorage: () => Chainable<Element>;

      /**
       * @description Restores local storage for dependent tests
       */
      restoreLocalStorage: () => Chainable<Element>;

      /**
       * @description Compare snapshot from image
       */
      compareSnapshot: (element?: string) => Chainable<Element>;

      /**
       * @description Set wallet theme
       * @param {any} walletTheme
       */
      setWalletTheme: (walletTheme: any) => Chainable<Element>;

      /**
       * @description Return empty array of feature flag
       */
      blockAllFeatureFlag: () => Chainable<Element>;
      /**
       * @description Set feature flags
       * @param {string[]} flags to be set
       * @example cy.setFeatureFlags(['feature_a', 'feature_b'], 'beta')
       */
      setFeatureFlags: (flags: string[], stage?: string) => Chainable<Element>;

      /**
       * @description
        Future swap settles every 20 blocks. To ensure that there"s ample time (20 blocks) to:
          Future Swap -> Withdraw Future Swap -> Do checks
        the flow must start to a block divisible by 20 + 1
       */
      waitUntilFutureSwapSettles: () => Chainable<Element>;
    }
  }
}

Cypress.Commands.add("getByTestID", (selector: string, opts?: any) => {
  /* eslint-disable @typescript-eslint/restrict-template-expressions */
  const args = opts != null ? opts : { timeout: 10000 };
  return cy.get(`[data-testid=${Cypress.$.escapeSelector(selector)}]`, args);
});

Cypress.Commands.add("createEmptyWallet", (isRandom: boolean = false) => {
  cy.intercept("**").as("requests");
  cy.visit("/", { timeout: 300000 });
  cy.get("@requests.all", { timeout: 300000 });
  cy.getByTestID(
    isRandom ? "playground_wallet_random" : "playground_wallet_abandon"
  ).click();
});

Cypress.Commands.add("sendDFItoWallet", () => {
  cy.intercept("/v0/playground/rpc/sendtoaddress").as("sendToAddress");
  cy.getByTestID("playground_wallet_top_up", { timeout: 300000 }).click();
  cy.wait(["@sendToAddress"]);
});

Cypress.Commands.add("sendDFITokentoWallet", () => {
  cy.intercept("/v0/playground/wallet/tokens/0/send").as("sendToAddress");
  cy.getByTestID("playground_token_DFI").click();
  cy.wait(["@sendToAddress"]);
});

Cypress.Commands.add("sendTokenToWallet", (tokens: string[]) => {
  cy.wrap(tokens).each((t: string) => {
    const alias = `send${t}ToAddress`;
    cy.intercept("/v0/playground/rpc/sendtokenstoaddress").as(alias);
    cy.getByTestID(`playground_token_${t}`).click();
    cy.wait([`@${alias}`]);
  });
});

Cypress.Commands.add("closeOceanInterface", (pin?: string) => {
  const inputPin = pin !== undefined ? pin : "000000";
  cy.getByTestID("pin_authorize").type(inputPin);
  cy.wait(7000)
    .getByTestID("oceanInterface_close")
    .should("exist")
    .click()
    .wait(2000);
});

Cypress.Commands.add("exitWallet", () => {
  cy.wait(4000);
  cy.getByTestID("playground_wallet_clear").click();
});

Cypress.Commands.add("fetchWalletBalance", () => {
  cy.getByTestID("playground_wallet_fetch_balances").click();
});

Cypress.Commands.add("switchNetwork", (network: string) => {
  cy.getByTestID("bottom_tab_portfolio").click();
  cy.getByTestID("header_settings").click();
  cy.getByTestID("header_change_network").click();
  cy.getByTestID(`button_network_${network}`).click();
  cy.on("window:confirm", () => {});
});

const LOCAL_STORAGE_MEMORY = {};

Cypress.Commands.add("saveLocalStorage", () => {
  Object.keys(localStorage).forEach((key) => {
    LOCAL_STORAGE_MEMORY[key] = localStorage[key];
  });
});

Cypress.Commands.add("restoreLocalStorage", () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach((key) => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
  });
});

Cypress.Commands.add("setWalletTheme", (walletTheme: any) => {
  cy.getByTestID("bottom_tab_portfolio").click();
  cy.getByTestID("header_settings").click();
  cy.getByTestID("light_mode_icon").then(($txt: any) => {
    walletTheme.isDark = $txt[0].style.color === "rgb(212, 212, 212)";
  });
});

Cypress.Commands.add("blockAllFeatureFlag", () => {
  cy.intercept("**/settings/flags", {
    statusCode: 200,
    body: [],
  });
});

Cypress.Commands.add("setFeatureFlags", (flags: string[], stage?: string) => {
  const body = flags.map((flag) => ({
    id: flag,
    name: flag,
    stage: stage ? stage : "public",
    version: ">0.0.0",
    description: `Display ${flag} features`,
    networks: [
      EnvironmentNetwork.RemotePlayground,
      EnvironmentNetwork.LocalPlayground,
      EnvironmentNetwork.MainNet,
      EnvironmentNetwork.TestNet,
    ],
    platforms: ["ios", "android", "web"],
    app: ["MOBILE_LW"],
  }));
  cy.intercept("**/settings/flags", {
    statusCode: 200,
    body: body,
  });
});

Cypress.Commands.add("waitUntilFutureSwapSettles", () => {
  waitUntilFutureSwapSettles();
});

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
