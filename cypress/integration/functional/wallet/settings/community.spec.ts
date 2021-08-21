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

context('Wallet - Settings - Community', () => {
  beforeEach(function () {
    cy.createEmptyWallet()
    cy.getByTestID('bottom_tab_settings').click()
    cy.getByTestID('settings_community_button').click()
  })

  it('should display all community links', function () {
    const flatList = cy.getByTestID('community_flat_list')

    communityLinks.forEach((item) => {
      flatList.getByTestID(item.id).should('exist').contains(item.title)
    })
  })
})
