import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import { checkValueWithinRange } from "../../../../support/walletCommands";

function setupFeatureFlag() {
  // mock feature flag to make cfip/dfip action button appear
  const flags = [
    {
      id: "ocg_cfp_dfip",
      name: "CFP/DFIP proposal(s)",
      stage: "alpha",
      version: ">2.14.0",
      description: "Allows the submission of CFP/DFIP proposals",
      networks: [
        EnvironmentNetwork.MainNet,
        EnvironmentNetwork.TestNet,
        EnvironmentNetwork.RemotePlayground,
        EnvironmentNetwork.LocalPlayground,
      ],
      platforms: ["ios", "android", "web"],
      app: ["MOBILE_LW"],
    },
  ];

  cy.intercept("**/settings/flags", {
    statusCode: 200,
    body: flags,
  });
}

function setupWalletForConversion(): void {
  cy.getByTestID("bottom_tab_portfolio").click();
  cy.getByTestID("portfolio_list").should("exist");
  cy.getByTestID("dfi_balance_card").should("exist").click();
  cy.getByTestID("convert_button").click();
  cy.getByTestID("button_convert_mode_toggle").click();
  cy.getByTestID("MAX_amount_button").click();
  cy.getByTestID("button_continue_convert").click().wait(3000);
  cy.getByTestID("button_confirm_convert").click().wait(3000);
  cy.closeOceanInterface();
}

function selectOwnAddress() {
  cy.getByTestID("address_book_button").click().wait(1000);
  cy.getByTestID("address_button_group_YOUR_ADDRESS").click();
  cy.getByTestID("address_row_0_YOUR_ADDRESS").click();
}

function verifyDefaultInputState(isDfip: boolean) {
  const type = isDfip ? "dfip" : "cfp";
  cy.getByTestID("url_status_text").contains("Add URL here to get started");
  cy.getByTestID("detail_container").should("not.exist");
  cy.getByTestID(`${type}_continue_button`).should("not.be.enabled");
}

function verifyConfirmScreen(
  isDfip: boolean,
  title: string,
  githubUrl: string,
  proposalFee: string,
  requestedAmount?: string,
  cycle?: number
) {
  cy.getByTestID("proposal_title").contains(title);
  cy.getByTestID("proposal_type_value").contains(isDfip ? "DFIP" : "CFP");
  cy.getByTestID("github_value").contains(githubUrl);
  cy.getByTestID("proposal_fee_value").contains(proposalFee);
  cy.getByTestID("transaction_fee_value").should("exist");
  if (requestedAmount !== undefined) {
    cy.getByTestID("amount_requested_value").contains(requestedAmount);
  }
  if (cycle !== undefined) {
    cy.getByTestID("cycle_value").contains(`${cycle} Cycle(s)`);
  }
}

const CfpData = {
  githubUrl: "https://github.com/DeFiCh/dfips/issues/233",
  title:
    "CFP-2211-10: WalletWatcher - A mobile app to monitor all wallets which are important to you (15 000 DFI)",
  amount: "0.12345678",
};

const DfipData = {
  githubUrl: "https://github.com/DeFiCh/dfips/issues/238",
  title: "Limit FutureSwap volume #238",
  amount: "0.12345678",
};

context("QA-780-2: Wallet - Submit CFP", () => {
  before(() => {
    cy.createEmptyWallet(true);
    setupFeatureFlag();
    cy.sendDFItoWallet().sendDFItoWallet().wait(6000);
    cy.getByTestID("bottom_tab_portfolio").click();
    cy.getByTestID("cfp_dfip_button").click();
    cy.url().should("include", "app/OCGProposalsScreen");
  });

  it("should display active discussion banner and navigate", () => {
    cy.getByTestID("ocg_proposal_banner").should("exist");
    cy.getByTestID("ocg_proposal_banner_url_button")
      .invoke("text")
      .then(() => {
        cy.getByTestID("ocg_proposal_banner_url_button")
          .filter(":visible")
          .click();
      });
  });

  it("should verify github url and title", () => {
    cy.getByTestID("proposal_continue_button").click();
    verifyDefaultInputState(false);
    cy.getByTestID("input_url").type("s:").wait(1000);
    cy.getByTestID("url_status_text").contains(
      "URL should be a valid Github URL"
    );
    cy.getByTestID("input_url_clear_button").click().wait(1000);
    cy.getByTestID("input_url").type(CfpData.githubUrl).wait(1000);
    cy.getByTestID("url_valid_text").should("exist");
    cy.getByTestID("detail_container").should("exist");
    cy.getByTestID("input_title_error").contains(
      "Make sure this matches the title from Github."
    );
    cy.getByTestID("input_title").type(CfpData.title);
  });

  it("should be able to key in amount", () => {
    cy.getByTestID("input_amount").type(CfpData.amount);
  });

  it("should be able to key in cycles", () => {
    cy.getByTestID("collateral_add_cycle").click().wait(1000);
    cy.getByTestID("collateral_remove_cycle").click().wait(1000);
    cy.getByTestID("input_cycle").clear().type("0.123").wait(1000);
    cy.getByTestID("input_cycle_error").should("exist");
    cy.getByTestID("input_cycle_error").contains(
      "Cycle(s) should be 1-100 only"
    );
    cy.getByTestID("input_cycle").clear().type("1200").wait(1000);
    cy.getByTestID("input_cycle_error").should("exist");
    cy.getByTestID("input_cycle").clear().type("2");
    cy.getByTestID("input_cycle_error").should("not.exist");
  });

  it("should be able to check invalid receiving address", () => {
    cy.getByTestID("address_input").type("000xek").wait(1000);
    cy.getByTestID("address_error_text").should("exist");
    cy.getByTestID("address_error_text").contains(
      "Invalid address. Make sure the address is correct to avoid irrecoverable losses"
    );
    cy.getByTestID("address_input_clear_button").click();
  });

  it("should verify confirm screen", () => {
    selectOwnAddress();
    cy.getByTestID("cfp_continue_button").should("not.have.attr", "disabled");
    cy.getByTestID("cfp_continue_button").click();

    verifyConfirmScreen(
      false,
      CfpData.title,
      CfpData.githubUrl,
      "10.00000000 DFI",
      `${CfpData.amount} DFI`,
      2
    );
    cy.getByTestID("button_ack_proposal").click().wait(1000);
    cy.getByTestID("button_confirm_submit").should("not.have.attr", "disabled");
  });

  it("should submit proposal success", () => {
    cy.getByTestID("button_confirm_submit").click();
    cy.getByTestID("txn_authorization_title").contains("Submitting proposal");
    cy.closeOceanInterface();
  });
});

context("QA-780-3: Wallet - Submit CFP - Convert", () => {
  before(() => {
    cy.createEmptyWallet(true);
    setupFeatureFlag();
    cy.sendDFItoWallet().sendDFITokentoWallet().wait(6000);
    setupWalletForConversion();
    cy.getByTestID("cfp_dfip_button").click();
    cy.url().should("include", "app/OCGProposalsScreen");
    cy.getByTestID("proposal_continue_button").click();
  });

  it("should fill up all fields", () => {
    verifyDefaultInputState(false);
    cy.getByTestID("input_url").type(CfpData.githubUrl).wait(1000);
    cy.getByTestID("url_valid_text").should("exist");
    cy.getByTestID("detail_container").should("exist");
    cy.getByTestID("input_title").type(CfpData.title);
    cy.getByTestID("input_amount").type("0.12345678");
    selectOwnAddress();
  });

  it("should display convert message", () => {
    cy.getByTestID("cfp_continue_button").click();
    cy.getByTestID("txn_authorization_title")
      .invoke("text")
      .then((text: string) => {
        const value = text.replace(/[^\d.]/g, ""); // use regex to retrieve number value only
        checkValueWithinRange(value, "10.0000", 0.001);
      });
    cy.closeOceanInterface().wait(6000);
  });

  it("should verify convert in confirm screen", () => {
    cy.getByTestID("amount_to_convert_value")
      .invoke("text")
      .then((text: string) => {
        const value = text.replace(/[^\d.]/g, ""); // use regex to retrieve number value only
        checkValueWithinRange(value, "10.0000", 0.001);
      });
    verifyConfirmScreen(
      false,
      CfpData.title,
      CfpData.githubUrl,
      "10.00000000 DFI",
      "0.12345678",
      1
    );
  });

  it("should submit proposal success", () => {
    cy.getByTestID("button_ack_proposal").click();
    cy.getByTestID("button_confirm_submit").click();
    cy.getByTestID("txn_authorization_title").contains("Submitting proposal");
    cy.closeOceanInterface();
  });
});

context("QA-780-4: Wallet - Submit DFIP", () => {
  before(() => {
    cy.createEmptyWallet(true);
    setupFeatureFlag();
    cy.sendDFItoWallet().wait(6000);
    cy.getByTestID("cfp_dfip_button").click();
    cy.url().should("include", "app/OCGProposalsScreen");
    cy.getByTestID("DFIP_button").click();
    cy.getByTestID("proposal_continue_button").click();
  });

  it("should verify github url and title", () => {
    verifyDefaultInputState(true);
    cy.getByTestID("input_url").type("s:").wait(1000);
    cy.getByTestID("url_status_text").contains(
      "URL should be a valid Github URL"
    );
    cy.getByTestID("input_url_clear_button").click().wait(1000);
    cy.getByTestID("input_url").type(DfipData.githubUrl).wait(1000);
    cy.getByTestID("url_valid_text").should("exist");
    cy.getByTestID("detail_container").should("exist");
    cy.getByTestID("input_title_error").contains(
      "Make sure this matches the title from Github."
    );
    cy.getByTestID("input_title").type(DfipData.title);
  });

  it("should verify confirm screen", () => {
    cy.getByTestID("dfip_continue_button").click();
    cy.getByTestID("cfp_section").should("not.exist");
    verifyConfirmScreen(
      true,
      DfipData.title,
      DfipData.githubUrl,
      "5.00000000 DFI"
    );
  });

  it("should submit proposal success", () => {
    cy.getByTestID("button_ack_proposal").click();
    cy.getByTestID("button_confirm_submit").click();
    cy.getByTestID("txn_authorization_title").contains("Submitting proposal");
    cy.closeOceanInterface();
  });
});
