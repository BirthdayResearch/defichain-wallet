const communityLinks = [
  {
    id: "announcements",
    title: "Announcements",
    url: "https://t.me/defichain_announcements",
  },
  {
    id: "faq",
    title: "Frequently asked questions",
    url: "https://defichain.com/learn/#faq",
  },
  {
    id: "gh",
    title: "Report issue on GitHub",
    url: "https://github.com/DeFiCh/wallet/issues",
  },
  {
    id: "tg_en",
    title: "Telegram (EN)",
    url: "https://t.me/defiblockchain",
  },
  {
    id: "tg_de",
    title: "Telegram (DE)",
    url: "https://t.me/defiblockchain_DE",
  },
  {
    id: "wechat",
    title: "WeChat",
    url: "http://weixin.qq.com/r/0xz07DzEdmEJrXiP90nB",
  },
];

context("Wallet - Settings - Community", () => {
  before(() => {
    cy.createEmptyWallet();
    cy.getByTestID("header_settings").click();
    cy.getByTestID("setting_navigate_About").click();
    cy.getByTestID("community_link").click();
  });

  communityLinks.forEach((item) => {
    it(`should display ${item.title} community links`, () => {
      cy.getByTestID("community_flat_list")
        .getByTestID(item.id)
        .should("exist")
        .contains(item.title);
    });
  });
});
