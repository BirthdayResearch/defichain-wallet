context('Wallet - Portfolio - Announcements', () => {
  const sampleAnnouncements = [{
    lang: {
      en: 'Guidelines',
      de: 'Richtlinien',
      'zh-Hans': '指导方针',
      'zh-Hant': '指導方針'
    },
    version: '0.0.0 - 0.12.0',
    url: {
      ios: '',
      android: '',
      macos: '',
      windows: '',
      web: ''
    }
  }, {
    lang: {
      en: 'Refresh',
      de: 'Erneuern',
      'zh-Hans': '刷新',
      'zh-Hant': '刷新'
    },
    version: '>=0.12.1',
    url: {
      ios: 'https://foo.ios',
      android: 'https://foo.android',
      macos: 'https://foo.macos',
      windows: 'https://foo.windows',
      web: 'https://foo.web'
    }
  }]

  const sampleAnnouncementsWithID = [{
    lang: {
      en: 'Guidelines',
      de: 'Richtlinien',
      'zh-Hans': '指导方针',
      'zh-Hant': '指導方針'
    },
    version: '0.0.0 - 0.12.0',
    url: {
      ios: '',
      android: '',
      macos: '',
      windows: '',
      web: ''
    },
    id: '1'
  }]

  beforeEach(function () {
    cy.createEmptyWallet(true)
  })

  it('should handle failed API announcement calls', function () {
    cy.intercept('**/announcements', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.getByTestID('announcements_banner').should('not.exist')
  })

  it('should handle empty announcements', function () {
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: []
    })
    cy.getByTestID('announcements_banner').should('not.exist')
  })

  it('should display announcement message', function () {
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: sampleAnnouncements
    })
    cy.getByTestID('announcements_banner').should('exist')
    cy.getByTestID('announcements_text').should('contain', 'Guidelines')
  })

  it('should display announcement message - translated', function () {
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: sampleAnnouncements
    })
    cy.changeLanguage('German')
    cy.getByTestID('announcements_banner').should('exist')
    cy.getByTestID('announcements_text').should('contain', 'Richtlinien')
  })

  it('should be able to close announcement for newer app version', function () {
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: sampleAnnouncementsWithID
    })
    cy.wait(3000)
    cy.getByTestID('close_announcement').click().then(() => {
      cy.wait(3000)
      expect(localStorage.getItem('WALLET.HIDDEN_ANNOUNCEMENTS')).to.eq('["1"]')
    })
    cy.getByTestID('announcements_banner').should('not.exist')
    cy.reload()
    cy.getByTestID('announcements_banner').should('not.exist')
  })
})

context('Wallet - Portfolio - Announcements - Blockchain warning messages', () => {
  const sampleAnnouncements = [{
    lang: {
      en: 'Guidelines',
      de: 'Richtlinien',
      'zh-Hans': '指导方针',
      'zh-Hant': '指導方針'
    },
    version: '0.0.0 - 0.12.0',
    url: {
      ios: '',
      android: '',
      macos: '',
      windows: '',
      web: ''
    }
  }, {
    lang: {
      en: 'Refresh',
      de: 'Erneuern',
      'zh-Hans': '刷新',
      'zh-Hant': '刷新'
    },
    version: '>=0.12.1',
    url: {
      ios: 'https://foo.ios',
      android: 'https://foo.android',
      macos: 'https://foo.macos',
      windows: 'https://foo.windows',
      web: 'https://foo.web'
    }
  }]

  const sampleAnnouncementsWithID = [{
    lang: {
      en: 'Guidelines',
      de: 'Richtlinien',
      'zh-Hans': '指导方针',
      'zh-Hant': '指導方針'
    },
    version: '0.0.0 - 0.12.0',
    url: {
      ios: '',
      android: '',
      macos: '',
      windows: '',
      web: ''
    },
    id: '1'
  }]

  beforeEach(function () {
    cy.createEmptyWallet(true)
  })
  it('should be able to display announcement with ID not within hidden list', function () {
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: sampleAnnouncementsWithID
    })
    localStorage.setItem('WALLET.HIDDEN_ANNOUNCEMENTS', '["2"]')
    cy.getByTestID('announcements_banner').should('exist')
    cy.getByTestID('announcements_text').should('contain', 'Guidelines')
  })

  it('should display blockchain is down warning message with no existing announcement', () => {
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: []
    })
    cy.getByTestID('announcements_banner').should('not.exist')
    cy.intercept('**/regtest/stats', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.wait(5000)
    cy.getByTestID('announcements_banner').should('exist')
    cy.getByTestID('announcements_text').should('contain', 'We are currently investigating a syncing issue on the blockchain. View more details on the DeFiChain Status Page.')
  })

  it('should replace existing announcement with blockchain is down warning message', () => {
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: sampleAnnouncements
    })
    cy.getByTestID('announcements_banner').should('exist')
    cy.getByTestID('announcements_text').should('contain', 'Guidelines')
    cy.intercept('**/regtest/stats', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.wait(5000)
    cy.getByTestID('announcements_text').should('not.contain', 'Guidelines')
    cy.getByTestID('announcements_text').should('contain', 'We are currently investigating a syncing issue on the blockchain. View more details on the DeFiChain Status Page.')
  })

  it('should display warning message even if announcements are closed', () => {
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: sampleAnnouncementsWithID
    })
    cy.getByTestID('close_announcement').click().should(() => {
      expect(localStorage.getItem('WALLET.HIDDEN_ANNOUNCEMENTS')).to.eq('["1"]')
    })
    cy.getByTestID('announcements_banner').should('not.exist')
    cy.intercept('**/regtest/stats', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.wait(5000)
    cy.getByTestID('announcements_banner').should('exist')
    cy.getByTestID('announcements_text').should('contain', 'We are currently investigating a syncing issue on the blockchain. View more details on the DeFiChain Status Page.')
  })

  it('should not display warning msg if blockchain is not down and display existing announcements', () => {
    cy.intercept('**/regtest/stats', {
      statusCode: 200,
      body: {
        data: {
          count: {
            lastSync: new Date().toString(),
            lastSuccessfulSync: new Date().toString()
          }
        }
      }
    })
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: sampleAnnouncements
    })
    cy.changeLanguage('German')
    cy.getByTestID('announcements_text').should('contain', 'Richtlinien')
  })

  it('should not display any announcement when blockchain is not down and no existing announcements', () => {
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: []
    })
    cy.intercept('**/regtest/stats', {
      statusCode: 200,
      body: {
        data: {
          count: {
            lastSync: new Date().toString(),
            lastSuccessfulSync: new Date().toString()
          }
        }
      }
    })
    cy.getByTestID('announcements_banner').should('not.exist')
  })

  it('should not display any announcement if announcement is closed and blockchain is not down', () => {
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: sampleAnnouncementsWithID
    })
    cy.intercept('**/regtest/stats', {
      statusCode: 200,
      body: {
        data: {
          count: {
            lastSync: new Date().toString(),
            lastSuccessfulSync: new Date().toString()
          }
        }
      }
    })
    cy.getByTestID('close_announcement').click().should(() => {
      expect(localStorage.getItem('WALLET.HIDDEN_ANNOUNCEMENTS')).to.eq('["1"]')
    })
    cy.getByTestID('announcements_banner').should('not.exist')
    cy.reload()
    cy.getByTestID('announcements_banner').should('not.exist')
  })

  it('should display warning msg when blockchain is down after certain time on start of the app', () => {
    cy.reload()
    cy.createEmptyWallet(true)
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: []
    })
    cy.intercept('**/regtest/stats', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.wait(6000)
    cy.getByTestID('announcements_banner').should('exist')
    cy.getByTestID('announcements_text').should('contain', 'We are currently investigating a syncing issue on the blockchain. View more details on the DeFiChain Status Page.')
  })
})

context('Wallet - portfolio - Announcements - Outages and Maintenances', () => {
  const sampleAnnouncementsWithID = [{
    lang: {
      en: 'Guidelines',
      de: 'Richtlinien',
      'zh-Hans': '指导方针',
      'zh-Hant': '指導方針'
    },
    version: '0.0.0 - 0.12.0',
    url: {
      ios: '',
      android: '',
      macos: '',
      windows: '',
      web: ''
    },
    id: '1'
  }]

  const operational = {
    status: {
      description: 'operational'
    }
  }
  const outage = {
    status: {
      description: 'outage'
    }
  }

  before(function () {
    localStorage.setItem('WALLET.HIDDEN_ANNOUNCEMENTS', '[]')
  })

  beforeEach(function () {
    cy.createEmptyWallet(true)
  })

  it('should handle failed blockchain API status calls', function () {
    cy.intercept('GET', '**/blockchain', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.getByTestID('announcements_banner').should('not.exist')
  })
  it('should handle failed overall (ocean) API status calls', function () {
    cy.intercept('GET', '**/overall', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.getByTestID('announcements_banner').should('not.exist')
  })

  it('should not display banner if no outage', function () {
    cy.intercept('**/blockchain', {
      statusCode: 200,
      body: operational
    })
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: []
    }).as('getAnnouncements')
    cy.wait('@getAnnouncements').then(() => {
      cy.wait(2000)
      cy.getByTestID('announcements_banner').should('not.exist')
      cy.getByTestID('announcements_text').should('not.exist')
    })
  })

  it('should be able to display announcement if no blockchain outage', function () {
    cy.intercept('**/blockchain', {
      statusCode: 200,
      body: operational
    })
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: sampleAnnouncementsWithID
    }).as('getAnnouncements')
    cy.wait('@getAnnouncements').then(() => {
      cy.wait(2000)
      cy.getByTestID('announcements_banner').should('exist')
      cy.getByTestID('announcements_text').should('contain', 'Guidelines')
      cy.getByTestID('announcements_text').should('not.contain', 'We are currently investigating a syncing issue on the blockchain. View more details on the DeFiChain Status Page.')
    })
  })

  it('should be able to display blockchain status down over any announcement', function () {
    cy.intercept('**/blockchain', {
      statusCode: 200,
      body: outage
    })
    cy.intercept('GET', '**/overall', {
      statusCode: 200,
      body: operational
    })
    cy.intercept('**/regtest/stats', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    }).as('stats')
    cy.wait('@stats').then(() => {
      cy.getByTestID('announcements_banner').should('exist')
      cy.getByTestID('announcements_text').should('contain', 'We are currently investigating a syncing issue on the blockchain. View more details on the DeFiChain Status Page.')
    })
  })
  it('should be able to display overall (ocean) status down over any announcement', function () {
    cy.intercept('GET', '**/overall', {
      statusCode: 200,
      body: outage
    })
    cy.intercept('**/blockchain', {
      statusCode: 200,
      body: operational
    })
    cy.intercept('**/regtest/stats', {
      statusCode: 200,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    }).as('stats')
    cy.wait('@stats').then(() => {
      cy.getByTestID('announcements_banner').should('exist')
      cy.getByTestID('announcements_text').should('contain', 'We are currently investigating connection issues on Ocean API. View more details on the DeFiChain Status Page.')
    })
  })
})
