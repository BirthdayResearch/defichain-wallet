// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
): any => {
  on(
    "before:browser:launch",
    (browserDetails: Cypress.Browser, launchOptions) => {
      if (browserDetails?.family === "chromium") {
        launchOptions.args.push(
          '--js-flags="--max_old_space_size=1024 --max_semi_space_size=1024"',
        );
      }
      return launchOptions;
    },
  );
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("@cypress/code-coverage/task")(on, config);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("cypress-image-diff-js/dist/plugin")(on, config);

  return config;
};
