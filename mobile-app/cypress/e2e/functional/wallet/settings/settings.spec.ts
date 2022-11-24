context("Wallet - Settings", () => {
  beforeEach(() => {
    cy.createEmptyWallet(true);
    cy.getByTestID("header_settings").click();
  });

  it("should be able to display top up screen when click on playground on playground network", () => {
    cy.getByTestID("header_network_icon").filter(":visible").click();
    cy.getByTestID("button_network_Playground").click();
    cy.on("window:confirm", () => {});
    cy.createEmptyWallet(true);
    cy.getByTestID("header_settings").click();
    cy.getByTestID("header_network_icon").filter(":visible").click();
    cy.getByTestID("button_network_Playground").click();
    cy.url().should("include", "playground");
  });

  it("should be able to change language in language selection screen", () => {
    cy.getByTestID("setting_navigate_language_selection").click();
    cy.getByTestID("language_option").contains("Deutsch");
    cy.getByTestID("language_option_description").contains("German");
    cy.getByTestID("button_language_German").click();
    cy.on("window:confirm", (message: string) => {
      expect(message).to.include("German");
    });
  });

  it("should exit wallet when clicked on positive action", () => {
    cy.getByTestID("setting_exit_wallet").click();
    cy.on("window:confirm", () => {});
    cy.getByTestID("get_started_button").should("exist");
    cy.getByTestID("restore_wallet_button").should("exist");
  });

  it("should stay in setting screen when clicked on negative action", () => {
    cy.getByTestID("setting_exit_wallet").click();
    cy.on("window:confirm", () => false);
    cy.getByTestID("setting_screen").should("exist");
  });

  it("should navigate to about page", () => {
    cy.getByTestID("setting_navigate_About").click();
    cy.url().should("include", "app/Settings/AboutScreen");
    cy.getByTestID("app_logo").should("exist");
  });

  it("should display app version tag", () => {
    cy.getByTestID("setting_navigate_About").click();
    cy.getByTestID("version_tag").should("exist");
  });

  it("should activate light mode by default (localstorage and activated sun icon)", () => {
    cy.url().should("include", "app/Settings/SettingsScreen", () => {
      expect(localStorage.getItem("WALLET.THEME")).to.eq("light");
    });
    cy.getByTestID("light_mode_icon").should(
      "have.css",
      "color",
      "rgb(217, 123, 1)"
    );
    cy.getByTestID("dark_mode_icon").should("not.exist");
  });

  it("should switch and activate moon icon from light to dark mode", () => {
    cy.getByTestID("dark_mode_icon").should("not.exist");
    cy.getByTestID("light_mode_icon").should(
      "have.css",
      "color",
      "rgb(217, 123, 1)"
    );
    cy.getByTestID("theme_switch").click();
    cy.getByTestID("light_mode_icon").should("not.exist");
    cy.getByTestID("dark_mode_icon").should(
      "have.css",
      "color",
      "rgb(217, 123, 1)"
    );
  });

  it("should update local storage from light to dark theme", () => {
    cy.getByTestID("dark_mode_icon").should("not.exist");
    cy.getByTestID("light_mode_icon").should(
      "have.css",
      "color",
      "rgb(217, 123, 1)"
    );
    cy.getByTestID("theme_switch")
      .click()
      .should(() => {
        expect(localStorage.getItem("WALLET.THEME")).to.eq("dark");
      });
    cy.getByTestID("light_mode_icon").should("not.exist");
    cy.getByTestID("dark_mode_icon").should(
      "have.css",
      "color",
      "rgb(217, 123, 1)"
    );
  });
});
