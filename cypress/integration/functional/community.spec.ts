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
    id: 'wechat',
    title: 'WeChat',
    url: 'http://weixin.qq.com/r/0xz07DzEdmEJrXiP90nB'
  },
  {
    id: 'reddit',
    title: 'Reddit Community',
    url: 'https://www.reddit.com/r/defiblockchain/'
  },
  {
    id: 'website',
    title: 'Official Website',
    url: 'https://defichain.com/'
  }
]

context('wallet/settings/community', () => {
  beforeEach(function () {
    cy.createEmptyWallet()
    cy.getByTestID('bottom_tab_settings').click()
    cy.getByTestID('settings_community_button').click()
  })

  it('should display community links with correct number of items', function () {
    cy.getByTestID('help_items_list').should('exist').children().children().should('have.length', communityLinks.length)
  })

  it('should be able to display correct labels', function () {
    communityLinks.forEach((item) => {
      cy.getByTestID(item.id).should('exist').contains(item.title)
    })
  })
})
