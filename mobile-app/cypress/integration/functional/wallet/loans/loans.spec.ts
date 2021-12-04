import { LoanToken } from '@defichain/whale-api-client/dist/api/loan'
import { EnvironmentNetwork } from '../../../../../../shared/environment'

context('Wallet - Loans', () => {
  before(function () {
    cy.allowLoanFeature()
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().wait(6000)
  })

  it('should display correct loans from API', function () {
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('button_create_vault').click()
    cy.getByTestID('loan_scheme_option_0').click()
    cy.getByTestID('create_vault_submit_button').click()
    cy.getByTestID('button_confirm_create_vault').click().wait(4000)
    cy.closeOceanInterface()
    cy.intercept('**/loans/tokens?size=200').as('loans')
    cy.wait(['@loans']).then((intercept: any) => {
      const data: any[] = intercept.response.body.data
      cy.getByTestID('loans_tabs_BROWSE_LOANS').click()
      data.forEach((loan: LoanToken, i) => {
        // const price = loan.activePrice?.active?.amount ?? 0
        cy.getByTestID(`loan_card_${i}_display_symbol`).contains(loan.token.displaySymbol)
        cy.getByTestID(`loan_card_${i}_interest_rate`).contains(`${loan.interest}%`)
        // TODO update to fix volatility
        /* cy.getByTestID(`loan_card_${i}_loan_amount`)
          .contains(price > 0 ? `$${Number(new BigNumber(price).toFixed(2)).toLocaleString()}` : '-') */
      })
    })
  })
})

context('Wallet - Loans Feature Gated', () => {
  it('should not have loans tab if loan feature is blocked', function () {
    cy.intercept('**/settings/flags', {
      body: []
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_loans').should('not.exist')
  })

  it('should not have loans tab if feature flag api does not contains loan', function () {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'foo',
          name: 'bar',
          stage: 'alpha',
          version: '>=0.0.0',
          description: 'foo',
          networks: [EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
          platforms: ['ios', 'android', 'web']
        }
      ]
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_loans').should('not.exist')
  })

  it('should not have loans tab if feature flag api failed', function () {
    cy.intercept('**/settings/flags', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_loans').should('not.exist')
  })

  it('should not have loans tab if loan feature is beta and not activated by user', function () {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'loan',
          name: 'Loan',
          stage: 'beta',
          version: '>=0.0.0',
          description: 'Loan',
          networks: [EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
          platforms: ['ios', 'android', 'web']
        }
      ]
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_loans').should('not.exist')
  })

  it('should have loans tab if loan feature is beta is activated by user', function () {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'loan',
          name: 'Loan',
          stage: 'beta',
          version: '>=0.0.0',
          description: 'Loan',
          networks: [EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
          platforms: ['ios', 'android', 'web']
        }
      ]
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_balances').click()
    cy.getByTestID('header_settings').click()
    cy.getByTestID('setting_navigate_About').click()
    cy.getByTestID('try_beta_features').click()
    cy.getByTestID('feature_loan_row').should('exist')
    cy.getByTestID('feature_loan_switch').click().should(() => {
      expect(localStorage.getItem('WALLET.ENABLED_FEATURES')).to.eq('["loan"]')
    })
    cy.getByTestID('bottom_tab_loans').should('exist')
    cy.getByTestID('feature_loan_switch').click().should(() => {
      expect(localStorage.getItem('WALLET.ENABLED_FEATURES')).to.eq('[]')
    })
  })

  it('should have loans tab if loan feature is public', function () {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'loan',
          name: 'Loan',
          stage: 'public',
          version: '>=0.0.0',
          description: 'Loan',
          networks: [EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
          platforms: ['ios', 'android', 'web']
        }
      ]
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_loans').should('exist')
  })
})
