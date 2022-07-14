const communityLinks = [
  {
    id: 'gh',
    title: 'Report an issue on Github',
    url: 'https://github.com/DeFiCh/wallet/issues'
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    url: 'https://defichain.com/learn/#faq'
  },
  {
    id: 'tg_en',
    title: 'Telegram (EN)',
    url: 'https://t.me/defiblockchain'
  },
  {
    id: 'tg_de',
    title: 'Telegram (DE)',
    url: 'https://t.me/defiblockchain_DE'
  },
  {
    id: 'announcements',
    title: 'Announcements',
    url: 'https://t.me/defichain_announcements'
  },
  {
    id: 'wechat',
    title: 'WeChat',
    url: 'http://weixin.qq.com/r/0xz07DzEdmEJrXiP90nB'
  }
]

context('Wallet - Settings - Community', () => {
  beforeEach(function () {
    cy.createEmptyWallet()
    cy.getByTestID('header_settings').click()
    cy.getByTestID('setting_navigate_About').click()
    cy.getByTestID('community_link').click()
  })

  it('should display all community links', function () {
    communityLinks.forEach((item) => {
      cy.getByTestID('community_flat_list').getByTestID(item.id).should('exist').contains(item.title)
    })
  })
})
