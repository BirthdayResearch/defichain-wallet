context("Wallet - Settings", () => {
  before(() => {
    cy.createEmptyWallet(true);
    cy.getByTestID("header_settings").click();
    cy.getByTestID("setting_navigate_About").click();
    cy.getByTestID("knowledge_base_link").should("exist").click();
  });

  it("should navigate to knowledge base page", () => {
    cy.url().should("include", "app/Settings/KnowledgeBaseScreen");
    cy.getByTestID("knowledge_base_screen").should("exist");
  });

  it("should navigate to Auctions faq from knowledge base page", () => {
    cy.getByTestID("auctions_faq").should("exist").click();
    cy.url().should("include", "app/Settings/AuctionsFaq");
    cy.go("back");
    cy.url().should("include", "app/Settings/KnowledgeBaseScreen");
  });

  it("should navigate to DEX faq from knowledge base page", () => {
    cy.getByTestID("dex_faq").should("exist").click();
    cy.url().should("include", "app/Settings/DexFaq");
    cy.go("back");
    cy.url().should("include", "app/Settings/KnowledgeBaseScreen");
  });

  it("should navigate to Liquidity Mining faq from knowledge base page", () => {
    cy.getByTestID("liquidity_mining_faq").should("exist").click();
    cy.url().should("include", "app/Settings/LiquidityMiningFaq");
    cy.go("back");
    cy.url().should("include", "app/Settings/KnowledgeBaseScreen");
  });

  it("should navigate to Loans faq from knowledge base page", () => {
    cy.getByTestID("loans_faq").should("exist").click();
    cy.url().should("include", "app/Settings/LoansFaq");
    cy.go("back");
    cy.url().should("include", "app/Settings/KnowledgeBaseScreen");
  });

  it("should navigate to passcode faq from knowledge base page", () => {
    cy.getByTestID("passcode_faq").should("exist").click();
    cy.url().should("include", "app/Settings/PasscodeFaq");
    cy.go("back");
    cy.url().should("include", "app/Settings/KnowledgeBaseScreen");
  });

  it("should navigate to recovery words faq from knowledge base page", () => {
    cy.getByTestID("recovery_words_faq").should("exist").click();
    cy.url().should("include", "app/Settings/RecoveryWordsFaq");
    cy.go("back");
    cy.url().should("include", "app/Settings/KnowledgeBaseScreen");
  });

  it("should navigate to UTXO and Token faq from knowledge base page", () => {
    cy.getByTestID("utxo_and_token_faq").should("exist").click();
    cy.url().should("include", "app/Settings/TokensVsUtxo");
    cy.go("back");
    cy.url().should("include", "app/Settings/KnowledgeBaseScreen");
  });
});
