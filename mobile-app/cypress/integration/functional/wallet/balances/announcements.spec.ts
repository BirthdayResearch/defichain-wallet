import dayjs from 'dayjs'

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

context('Wallet - Balances - Announcements - Blockchain warning messages', () => {
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

context('Wallet - balances - Announcements - Outages and Maintenances', () => {
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
  const scheduledDate23rdHr = dayjs(new Date()).subtract(23, 'hour')
  const scheduledDate25thHr = dayjs(new Date()).subtract(25, 'hour')
  const getMaintenance = (scheduledDate: dayjs.Dayjs = scheduledDate23rdHr, isInProgress: boolean = false): any[] => {
    const currentDate = new Date().toUTCString()
    const schedDate = new Date(scheduledDate.toString()).toUTCString()
    return [{
      created_at: '2014-05-14T14:24:40.430-06:00',
      id: 'w1zdr745wmfy',
      impact: 'none',
      incident_updates: [
        {
          body: '',
          created_at: currentDate,
          display_at: currentDate,
          id: 'qq0vx910b3qj',
          incident_id: 'w1zdr745wmfy',
          status: 'scheduled',
          updated_at: currentDate
        }
      ],
      monitoring_at: null,
      name: isInProgress ? 'In progress maintenance' : 'Upcoming maintenance',
      page_id: 'y2j98763l56x',
      resolved_at: null,
      scheduled_for: schedDate,
      scheduled_until: dayjs(schedDate).add(24, 'hour'),
      shortlink: 'http://stspg.co:5000/Q0F',
      status: isInProgress ? 'In Progress' : 'Scheduled',
      updated_at: currentDate
    }]
  }

  const summaryWithPartialOutageOnly = {
    status: {
      description: 'Partial System Outage',
      indicator: 'minor'
    },
    scheduled_maintenances: []
  }

  const summaryWithMajorOutageOnly = {
    status: {
      description: 'Major Service Outage',
      indicator: 'major'
    },
    scheduled_maintenances: []
  }
  const summaryWithMajorOutageAndMaintenance = {
    status: {
      description: 'Major Service Outage',
      indicator: 'major'
    },
    scheduled_maintenances: getMaintenance()
  }

  const summaryAllOperational = {
    status: {
      description: 'All Systems Operational',
      indicator: 'none'
    },
    scheduled_maintenances: []
  }

  before(function () {
    localStorage.setItem('WALLET.HIDDEN_ANNOUNCEMENTS', '[]')
  })

  beforeEach(function () {
    cy.createEmptyWallet(true)
  })

  it('should handle failed API status calls', function () {
    cy.intercept('**/summary.json', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.getByTestID('announcements_banner').should('not.exist')
  })

  it('should not display banner if no outage or maintenance', function () {
    cy.intercept('**/summary.json', {
      statusCode: 200,
      body: summaryAllOperational
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

  it('should be able to display announcement if no outage or maintenance', function () {
    cy.intercept('**/summary.json', {
      statusCode: 200,
      body: summaryAllOperational
    })
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: sampleAnnouncementsWithID
    }).as('getAnnouncements')
    cy.wait('@getAnnouncements').then(() => {
      cy.wait(2000)
      cy.getByTestID('announcements_banner').should('exist')
      cy.getByTestID('announcements_text').should('contain', 'Guidelines')
      cy.getByTestID('announcements_text').should('not.contain', 'There will be a scheduled maintenance')
      cy.getByTestID('announcements_text').should('not.contain', 'We are currently investigating an unexpected interruption of service.')
    })
  })

  it('should be able to display upcoming maintenance if schedule <24 hrs', function () {
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: sampleAnnouncementsWithID
    })

    cy.intercept('**/summary.json', {
      statusCode: 200,
      body: {
        status: {
          description: 'All Systems Operational',
          indicator: 'none'
        },
        scheduled_maintenances: getMaintenance(scheduledDate23rdHr, false)
      }
    })

    cy.getByTestID('announcements_banner').should('exist')
    cy.getByTestID('announcements_text').should('contain', 'There will be a scheduled maintenance')
  })

  it('should be able to hide upcoming maintenance if schedule >24 hrs', function () {
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: sampleAnnouncementsWithID
    })
    cy.intercept('**/summary.json', {
      statusCode: 200,
      body: {
        status: {
          description: 'All Systems Operational',
          indicator: 'none'
        },
        scheduled_maintenances: getMaintenance(scheduledDate25thHr, false)
      }
    })

    cy.getByTestID('announcements_banner').should('not.exist')
    cy.getByTestID('announcements_text').should('contain', 'Guidelines')
  })

  it('should be able to display in progress maintenance', function () {
    cy.intercept('**/announcements', {
      statusCode: 200,
      body: sampleAnnouncementsWithID
    })
    cy.intercept('**/summary.json', {
      statusCode: 200,
      body: {
        status: {
          description: 'All Systems Operational',
          indicator: 'none'
        },
        scheduled_maintenances: getMaintenance(dayjs(new Date()), true)
      }
    })

    cy.getByTestID('announcements_banner').should('not.exist')
    cy.getByTestID('announcements_text').should('contain', 'Scheduled maintenance is currently ongoing.')
  })

  it('should be able to display major outage over maintenance', function () {
    cy.intercept('**/summary.json', {
      statusCode: 200,
      body: summaryWithMajorOutageAndMaintenance
    })

    cy.getByTestID('announcements_banner').should('exist')
    cy.getByTestID('announcements_text').should('contain', 'We are currently investigating an unexpected interruption of service.')
  })

  it('should be able to display emergency over any announcement', function () {
    cy.intercept('**/summary.json', {
      statusCode: 200,
      body: summaryWithMajorOutageAndMaintenance
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

  it('should be able to display in event of major outage', function () {
    cy.intercept('**/summary.json', {
      statusCode: 200,
      body: summaryWithMajorOutageOnly
    })
    cy.getByTestID('announcements_banner').should('exist')
    cy.getByTestID('announcements_text').should('contain', 'We are currently investigating an unexpected interruption of service.')
  })

  it('should not display banner in event of partial outage', function () {
    cy.intercept('**/summary.json', {
      statusCode: 200,
      body: summaryWithPartialOutageOnly
    })
    cy.getByTestID('announcements_banner').should('exist')
    cy.getByTestID('announcements_text').should('not.contain', 'We are currently investigating an unexpected interruption of service.')
  })
})
