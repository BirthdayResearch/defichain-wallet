import { checkVaultDetailCollateralAmounts, checkVaultDetailValues } from '../../../../support/loanCommands'
import BigNumber from 'bignumber.js'

context('Wallet - Loans - Vault Details', () => {
  let vaultId = ''

  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['BTC']).wait(6000)
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('empty_vault').should('exist')
    cy.createVault(0)
    cy.getByTestID('vault_card_0_manage_loans_button').should('not.exist')
    cy.getByTestID('vault_card_0_vault_id').then(($txt: any) => {
      vaultId = $txt[0].textContent
    })
  })

  it('should check empty state', function () {
    cy.getByTestID('vault_card_0').click()
    cy.getByTestID('vault_detail_tabs_COLLATERAL').click()
    cy.getByTestID('vault_detail_tabs_LOANS').should('have.attr', 'aria-disabled')
    cy.getByTestID('button_add_collateral').click()
    cy.addCollateral('10', 'DFI')
    cy.addCollateral('10', 'dBTC')
    cy.go('back')
    cy.wait(2000)
    cy.getByTestID('bottom_tab_loans').click()
  })

  it('should add loan', function () {
    cy.getByTestID('vault_card_0_manage_loans_button').click()
    cy.getByTestID('button_browse_loans').click()
    cy.getByTestID('loan_card_DUSD').click()
    cy.getByTestID('form_input_borrow').clear().type('100').blur()
    cy.wait(3000)
    cy.getByTestID('text_input_usd_value').should('have.value', '100.00')
    cy.getByTestID('borrow_loan_submit_button').click()
    cy.getByTestID('button_confirm_borrow_loan').click().wait(3000)
    cy.closeOceanInterface()
  })

  it('should verify vault details page', function () {
    cy.getByTestID('vault_card_0').click()
    checkVaultDetailValues('ACTIVE', vaultId, '$1,500.00', '$100', '5')
    cy.getByTestID('vault_id_section_col_ratio').contains('1,500%')
    cy.getByTestID('vault_id_section_min_ratio').contains('150%')
  })

  it('should verify collaterals tab', function () {
    checkVaultDetailCollateralAmounts('10.00000000', 'DFI', '66.67%')
    checkVaultDetailCollateralAmounts('10.00000000', 'dBTC', '33.33%')
  })

  it('should verify vault details tab', function () {
    cy.getByTestID('vault_detail_tabs_DETAILS').click()
    cy.getByTestID('text_min_col_ratio').contains('150')
    cy.getByTestID('text_vault_interest_ratio').contains('5.00')
    cy.getByTestID('text_col_ratio').contains('1,500.00%')
    cy.getByTestID('text_collateral_value').contains('$1,500.00')
    cy.getByTestID('text_active_loans').contains('1')
    cy.getByTestID('text_total_loan_value').contains('$100')
  })

  it('should verify loan tab', function () {
    cy.getByTestID('vault_detail_tabs_LOANS').click()
    cy.getByTestID('loan_card_DUSD').contains('DUSD')
    cy.getByTestID('loan_card_DUSD_outstanding_balance').contains('100')
    cy.getByTestID('loan_card_DUSD_payback_loan').should('exist')
  })

  it('should edit loan scheme', function () {
    // Vault should not be able to close if there are existing loans
    cy.getByTestID('vault_detail_close_vault').should('have.attr', 'aria-disabled')
    cy.getByTestID('vault_detail_edit_collateral').click()
    cy.url().should('include', 'Loans/EditCollateralScreen')
    cy.go('back')
    cy.wait(2000)
    cy.getByTestID('vault_detail_edit_loan_scheme').click()
  })

  it('should be able to edit loan scheme', function () {
    cy.getByTestID('loan_scheme_option_1').click()
    cy.getByTestID('edit_loan_scheme_submit_button').click()
    cy.getByTestID('edit_loan_scheme_title').contains('You are editing scheme of vault')
    cy.getByTestID('edit_loan_scheme_vault_id').contains(vaultId)
    cy.getByTestID('text_transaction_type').contains('Edit loan scheme')
    cy.getByTestID('prev_min_col_ratio').contains('150.00')
    cy.getByTestID('prev_vault_interest').contains('5.00')
    cy.getByTestID('new_min_col_ratio').contains('175.00')
    cy.getByTestID('new_vault_interest').contains('3.00')
    cy.getByTestID('button_confirm_edit_loan_scheme').click()
    cy.getByTestID('txn_authorization_description').contains('Updating vault to min. collateralization ratio of 175% and interest rate of 3%')
    cy.closeOceanInterface()
    cy.getByTestID('vault_card_0_min_ratio').contains('175%')
    cy.getByTestID('vault_card_0').click()
    cy.getByTestID('vault_id_section_min_ratio').contains('175%')
    cy.getByTestID('text_vault_interest').contains('3')
    cy.getByTestID('vault_detail_tabs_DETAILS').click()
    cy.getByTestID('text_min_col_ratio').contains('175.00')
    cy.getByTestID('text_vault_interest_ratio').contains('3.00')
  })
})

context('Wallet - Loans - Close Vault', () => {
  let vaultId = ''

  before(function () {
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendDFITokentoWallet().sendDFITokentoWallet().sendTokenToWallet(['BTC']).wait(6000)
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('empty_vault').should('exist')
    cy.createVault(0)
    cy.getByTestID('vault_card_0_manage_loans_button').should('not.exist')
    cy.getByTestID('vault_card_0_vault_id').then(($txt: any) => {
      vaultId = $txt[0].textContent
    })
    cy.getByTestID('vault_card_0_edit_collaterals_button').click()
    cy.addCollateral('10', 'DFI')
    cy.addCollateral('10', 'dBTC')
    cy.go('back')
    cy.wait(2000)
  })

  it('should add loan', function () {
    cy.getByTestID('vault_card_0_manage_loans_button').click()
    cy.getByTestID('button_browse_loans').click()
    cy.getByTestID('loan_card_DUSD').click()
    cy.getByTestID('form_input_borrow').clear().type('100').blur()
    cy.wait(3000)
    cy.getByTestID('text_input_usd_value').should('have.value', '100.00')
    cy.getByTestID('borrow_loan_submit_button').click()
    cy.getByTestID('button_confirm_borrow_loan').click().wait(3000)
    cy.closeOceanInterface()
  })

  it('should be able to close vault', function () {
    cy.sendTokenToWallet(['DUSD'])
    cy.wait(3000)
    cy.getByTestID('vault_card_0').click()
    cy.getByTestID('vault_detail_tabs_LOANS').click()
    cy.getByTestID('loan_card_DUSD_payback_loan').click()
    cy.getByTestID('payback_input_text').clear().type('102').blur()
    cy.getByTestID('button_confirm_payback_loan_continue').click().wait(3000)
    cy.getByTestID('button_confirm_payback_loan').click().wait(4000)
    cy.closeOceanInterface()
    cy.getByTestID('vault_card_0').click()
    cy.getByTestID('vault_detail_close_vault').click()
    cy.getByTestID('button_confirm_create_vault').click().wait(4000)
    cy.getByTestID('txn_authorization_description').contains(`You are about to close vault ${vaultId}`)
    cy.closeOceanInterface()
    cy.getByTestID('button_create_vault').should('exist')
  })
})

context('Wallet - Loans - Health Bar', () => {
  before(function () {
    cy.createEmptyWallet(true)
    cy.intercept('**/address/**/vaults?size=*', {
      statusCode: 200,
      body: {
        data: [
          {
            vaultId: '85a5fbbb7a73ed0586b43d3fb2eb75e06d44c043692e9090bf316a7ff18c5ecc',
            loanScheme: {
              id: 'MIN150',
              minColRatio: '150',
              interestRate: '5'
            },
            ownerAddress: 'bcrt1qvlu82whrzgayss7x2t6jmjp70eu78ls7r54grj',
            state: 'ACTIVE',
            informativeRatio: '993.92181328',
            collateralRatio: '994',
            collateralValue: '100',
            loanValue: '10.06115357',
            interestValue: '0.00097623',
            collateralAmounts: [
              {
                id: '0',
                amount: '1.00000000',
                symbol: 'DFI',
                symbolKey: 'DFI',
                name: 'Default Defi token',
                displaySymbol: 'DFI',
                activePrice: {
                  id: 'DFI-USD-258',
                  key: 'DFI-USD',
                  isLive: true,
                  block: {
                    hash: 'f7cd0948080cc9c6bd1c05fdc387bd99db9f95b890b9b6d28e3688a24be4c55e',
                    height: 258,
                    medianTime: 1644834131,
                    time: 1644834137
                  },
                  active: {
                    amount: '100.00000000',
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3
                    }
                  },
                  next: {
                    amount: '150.00000000',
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3
                    }
                  },
                  sort: '00000102'
                }
              }
            ],
            loanAmounts: [
              {
                id: '11',
                amount: '1.00000000',
                symbol: 'TU10',
                symbolKey: 'TU10',
                name: 'Decentralized TU10',
                displaySymbol: 'dTU10',
                activePrice: {
                  id: 'TU10-USD-258',
                  key: 'TU10-USD',
                  isLive: true,
                  block: {
                    hash: 'f7cd0948080cc9c6bd1c05fdc387bd99db9f95b890b9b6d28e3688a24be4c55e',
                    height: 258,
                    medianTime: 1644834131,
                    time: 1644834137
                  },
                  active: {
                    amount: '10',
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3
                    }
                  },
                  next: {
                    amount: '20',
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3
                    }
                  },
                  sort: '00000102'
                }
              }
            ],
            interestAmounts: [
              {
                id: '11',
                amount: '0.00009704',
                symbol: 'TU10',
                symbolKey: 'TU10',
                name: 'Decentralized TU10',
                displaySymbol: 'dTU10',
                activePrice: {
                  id: 'TU10-USD-258',
                  key: 'TU10-USD',
                  isLive: true,
                  block: {
                    hash: 'f7cd0948080cc9c6bd1c05fdc387bd99db9f95b890b9b6d28e3688a24be4c55e',
                    height: 258,
                    medianTime: 1644834131,
                    time: 1644834137
                  },
                  active: {
                    amount: '10.06017734',
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3
                    }
                  },
                  next: {
                    amount: '10.06319570',
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3
                    }
                  },
                  sort: '00000102'
                }
              }
            ]
          }
        ]
      }
    })
    cy.getByTestID('bottom_tab_loans').click()
  })

  it('should display col ratio from vault API', function () {
    cy.getByTestID('vault_card_0_col_ratio').contains('994')
  })

  it('should calculate next ratio using next price from oracle', function () {
    const loanInNextPrice = new BigNumber(1.00000000).multipliedBy(20)
    const nextRatioValue = new BigNumber(150.00000000).dividedBy(loanInNextPrice).multipliedBy(100).toFixed(2)
    cy.getByTestID('vault_card_0_next_ratio').invoke('text').then(function (nextRatio: string) {
      expect(nextRatio).to.equal(`~${nextRatioValue}%`)
    })
    cy.getByTestID('vault_card_0_col_ratio').invoke('text').then(function (colRatio: string) {
      const colRatioValue = new BigNumber(colRatio.replace('%', ''))
      expect(colRatioValue.isGreaterThan(nextRatioValue)).equal(true)
    })
  })
})
