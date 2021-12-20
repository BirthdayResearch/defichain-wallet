context('Wallet - Balances - Announcements', () => {
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

  beforeEach(function () {
    cy.createEmptyWallet(true)
  })

  it('should handle failed API calls', function () {
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
    localStorage.setItem('WALLET.LANGUAGE', 'de')
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: sampleAnnouncements
    })
    cy.reload()
    cy.getByTestID('playground_wallet_random').click()
    cy.getByTestID('announcements_banner').should('exist')
    cy.getByTestID('announcements_text').should('contain', 'Richtlinien')
  })
})
