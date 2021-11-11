context('Wallet - Feature Gate', () => {
  const flags = [{
    id: 'loan',
    name: 'Decentralized Loans',
    stage: 'beta',
    version: '>=0.12.0',
    description: 'Browse loan tokens provided by DeFiChain'
  }, {
    id: 'foo',
    name: 'foo',
    stage: 'public',
    version: '>=0.12.0',
    description: 'foo'
  }]

  beforeEach(() => {
    cy.createEmptyWallet(true)
    cy.intercept('**/settings/flags', {
      statusCode: 200,
      body: flags
    })
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('header_settings').click()
    cy.getByTestID('setting_navigate_About').click()
    cy.getByTestID('try_beta_features').click()
  })

  flags.forEach(function (item) {
    it(`should be able to check ${item.name} features`, function () {
      if (item.stage === 'beta') {
        cy.getByTestID(`feature_${item.id}_row`).should('exist')
        cy.getByTestID(`feature_${item.id}_switch`).click().should(() => {
          expect(localStorage.getItem('WALLET.ENABLED_FEATURES')).to.eq(`["${item.id}"]`)
        })

        cy.getByTestID(`feature_${item.id}_switch`).click().should(() => {
          expect(localStorage.getItem('WALLET.ENABLED_FEATURES')).to.eq('[]')
        })
      } else {
        cy.getByTestID(`feature_${item.id}_row`).should('not.exist')
      }
    })
  })
})
