import { EnvironmentNetwork } from '../../../../../../shared/environment'
import { VaultStatus } from '../../../../../app/screens/AppNavigator/screens/Loans/VaultStatusTypes'
import BigNumber from 'bignumber.js'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { LoanVaultActive, LoanVaultLiquidated, LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { checkValueWithinRange } from '../../../../support/walletCommands'

function generateBlockUntilLiquidate (): void {
  cy.getByTestID('playground_generate_blocks').click()
  cy.wait(3000)
  cy.getByTestID('vault_card_0_status').invoke('text').then((status: string) => {
    if (status !== 'IN LIQUIDATION') {
      generateBlockUntilLiquidate()
    }
  })
}

function getLoanTokenToPlaceBid (): void {
  // Loan dTU10 for placing bid
  cy.createVault(0, true)
  cy.getByTestID('vault_card_1_edit_collaterals_button').click()
  cy.addCollateral('0.60000000', 'DFI')
  cy.getByTestID('bottom_tab_loans').click()
  cy.getByTestID('vault_card_1_manage_loans_button').click()
  cy.getByTestID('button_browse_loans').click()
  cy.getByTestID('loan_card_dTU10').click()
  cy.getByTestID('max_loan_amount_text').invoke('text').then((text: string) => {
    const maxLoanAmount = new BigNumber(text).minus(1).toFixed(2, 1) // use 2dp and round down
    cy.getByTestID('form_input_borrow').clear().type(maxLoanAmount).blur()
  })
  cy.getByTestID('borrow_loan_submit_button').click()
  cy.getByTestID('button_confirm_borrow_loan').click()
  cy.closeOceanInterface()
}

context('Wallet - Auctions', () => {
  let whale: WhaleApiClient
  let retries = 0
  const walletTheme = { isDark: false }
  const network = localStorage.getItem('Development.NETWORK')
  before(function () {
    whale = new WhaleApiClient({
      url: network === 'Playground' ? 'https://playground.jellyfishsdk.com' : 'http://localhost:19553',
      network: 'regtest',
      version: 'v0'
    })
  })

  function runIfAuctionsIsAvailable (callback: any): void {
    cy.wrap<LoanVaultLiquidated[]>(whale.loan.listAuction(200), { timeout: 20000 }).then(async (response) => {
      const stats = await whale.stats.get()
      const blockCount = stats.count.blocks
      const hasSufficientBlocksRemaining = response.length > 0 ? BigNumber.max(response[0].liquidationHeight - blockCount, 0).toNumber() >= 15 : false
      if (hasSufficientBlocksRemaining || retries > 8) {
        retries = 0
        callback()
        return
      }

      retries += 1
      cy.wait(5000)
      runIfAuctionsIsAvailable(callback)
    })
  }

  // TODO: to prepare portfolio for Bidder #2 to place bid
  // const recoveryWords: string[] = []
  // before(function () {
  // cy.intercept('**/settings/flags', flags)
  // cy.visit('/')
  // Bidder 2
  // cy.startCreateMnemonicWallet(recoveryWords)
  // cy.selectMnemonicWords(recoveryWords)
  // cy.setupPinCode()
  // cy.sendDFItoWallet().sendDFItoWallet().sendDFITokentoWallet()
  // cy.wait(6000)
  // cy.getByTestID('dfi_token_amount').contains('10.00000000')
  // cy.getByTestID('dfi_utxo_amount').contains('20.00000000')
  // cy.getByTestID('total_dfi_amount').contains('30.00000000')
  // cy.getByTestID('bottom_tab_loans').click()
  // cy.createVault(0)
  // cy.getByTestID('vault_card_0_edit_collaterals_button').click()
  // cy.addCollateral('0.60000000', 'DFI')
  // cy.getByTestID('bottom_tab_loans').click()
  // cy.getByTestID('vault_card_0_manage_loans_button').click()
  // cy.getByTestID('button_browse_loans').click()
  // cy.getByTestID('loan_card_dTU10').click()
  // cy.getByTestID('max_loan_amount_text').invoke('text').then((text: string) => {
  //   const maxLoanAmount = new BigNumber(text).toFixed(2, 1) // use 2dp and round down
  //   cy.getByTestID('form_input_borrow').clear().type(maxLoanAmount).blur()
  // })
  // cy.getByTestID('borrow_loan_submit_button').click()
  // cy.getByTestID('button_confirm_borrow_loan').click()
  // cy.closeOceanInterface()

  // Bidder 1
  // cy.exitWallet()
  // })
  const samplePoolPair = [
    {
      id: '17',
      symbol: 'USDT-DFI',
      displaySymbol: 'dUSDT-DFI',
      name: 'Playground USDT-Default Defi token',
      status: true,
      tokenA: {
        symbol: 'USDT',
        displaySymbol: 'dUSDT',
        id: '3',
        reserve: '10000000',
        blockCommission: '0'
      },
      tokenB: {
        symbol: 'DFI',
        displaySymbol: 'DFI',
        id: '0',
        reserve: '1000',
        blockCommission: '0'
      },
      priceRatio: {
        ab: '10000',
        ba: '0.0001'
      },
      commission: '0',
      totalLiquidity: {
        token: '100000',
        usd: '20000000'
      },
      tradeEnabled: true,
      ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
      rewardPct: '0.1',
      creation: {
        tx: '2e3f75a022e7296fef40c292b36dee0254486b94c6b7c816d8755d9a6d2b6b23',
        height: 134
      },
      apr: {
        reward: 66.8826,
        total: 66.8826
      }
    },
    {
      id: '20',
      symbol: 'DUSD-DFI',
      displaySymbol: 'DUSD-DFI',
      name: 'Decentralized USD-Default Defi token',
      status: true,
      tokenA: {
        symbol: 'DUSD',
        displaySymbol: 'DUSD',
        id: '14',
        reserve: '770',
        blockCommission: '0'
      },
      tokenB: {
        symbol: 'DFI',
        displaySymbol: 'DFI',
        id: '0',
        reserve: '77',
        blockCommission: '0'
      },
      priceRatio: {
        ab: '10',
        ba: '0.1'
      },
      commission: '0.02',
      totalLiquidity: {
        token: '243.49537982',
        usd: '1540'
      },
      tradeEnabled: true,
      ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
      rewardPct: '0.1',
      creation: {
        tx: 'd10b9f5193493514d35a31681a03573831b9a382f281e93de33cfc3e603a5d51',
        height: 142
      },
      apr: {
        reward: 868605.1948051949,
        total: 868605.1948051949
      }
    },
    {
      id: '21',
      symbol: 'TU10-DUSD',
      displaySymbol: 'dTU10-DUSD',
      name: 'Decentralized TU10-Decentralized USD',
      status: true,
      tokenA: {
        symbol: 'TU10',
        displaySymbol: 'dTU10',
        id: '13',
        reserve: '4.87',
        blockCommission: '0'
      },
      tokenB: {
        symbol: 'DUSD',
        displaySymbol: 'DUSD',
        id: '14',
        reserve: '974',
        blockCommission: '0'
      },
      priceRatio: {
        ab: '0.005',
        ba: '200'
      },
      commission: '0.02',
      totalLiquidity: {
        token: '68.87219745',
        usd: '1948'
      },
      tradeEnabled: true,
      ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
      rewardPct: '0.1',
      creation: {
        tx: '7aa15f770483ce4f2c7c5245a29e4727b57ce9d1461db6dc269d8d66c9478341',
        height: 149
      },
      apr: {
        reward: 686679.6714579056,
        total: 686679.6714579056
      }
    }
  ]
  before(function () {
    cy.intercept('**/settings/flags', {
      body: [{
        id: 'auction',
        name: 'Auction',
        stage: 'public',
        version: '>=0.0.0',
        description: 'Browse auctions provided by DeFiChain',
        networks: [EnvironmentNetwork.MainNet, EnvironmentNetwork.TestNet, EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
        platforms: ['ios', 'android', 'web']
      }]
    })
    cy.intercept('**/poolpairs?size=*', {
      body: {
        data: samplePoolPair
      }
    })
    cy.createEmptyWallet(true)
    cy.sendDFItoWallet().sendDFItoWallet().sendDFITokentoWallet().sendTokenToWallet(['CD10']).wait(6000)
    cy.getByTestID('details_dfi').click()
    cy.getByTestID('dfi_token_amount').contains('10.00000000')
    cy.getByTestID('dfi_utxo_amount').contains('20.00000000')
    cy.getByTestID('dfi_total_balance_amount').contains('30.00000000')
    cy.setWalletTheme(walletTheme)
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('empty_vault').should('exist')
    cy.createVault(0)
    cy.getByTestID('vault_card_0_manage_loans_button').should('not.exist')
    cy.getByTestID('vault_card_0_edit_collaterals_button').click()
    cy.addCollateral('0.20000000', 'DFI')
    cy.addCollateral('0.00000001', 'dCD10')
    cy.getByTestID('bottom_tab_loans').click()
    cy.getByTestID('loans_tabs_YOUR_VAULTS').click()
    cy.getByTestID('vault_card_0_manage_loans_button').click()
    cy.getByTestID('button_browse_loans').click()
    cy.getByTestID('loan_card_dTU10').click()
    cy.getByTestID('max_loan_amount_text').invoke('text').then((text: string) => {
      const maxLoanAmount = new BigNumber(text).toFixed(2, 1) // use 2dp and round down
      cy.getByTestID('form_input_borrow').clear().type(maxLoanAmount).blur()
    })
    cy.getByTestID('borrow_loan_submit_button').click()
    cy.getByTestID('button_confirm_borrow_loan').click()
    cy.closeOceanInterface()
  })

  it('should liquidate vault', function () {
    cy.getByTestID('loans_tabs_YOUR_VAULTS').click()
    generateBlockUntilLiquidate()
    cy.checkVaultTag('IN LIQUIDATION', VaultStatus.Liquidated, 'vault_card_0_status', walletTheme.isDark)
  })

  it('should show liquidated vault in auctions', function () {
    cy.getByTestID('bottom_tab_auctions').click()
    cy.getByTestID('batch_0_dTU10').should('exist')
  })

  it('should display important auction details', function () {
    runIfAuctionsIsAvailable(() => {
      cy.getByTestID('batch_card_0_owned_vault').should('exist')
      cy.getByTestID('batch_card_0_no_bid').should('exist')
    })
  })

  it('should be able to quick/place bid', function () {
    getLoanTokenToPlaceBid()
    cy.getByTestID('bottom_tab_auctions').click()

    runIfAuctionsIsAvailable(() => {
      cy.getByTestID('batch_card_0').click()
      cy.getByTestID('empty_bid_history').should('exist')
      cy.getByTestID('auction_detail_tab_COLLATERALS').click()
      cy.getByTestID('collateral_row_0_amount').contains('0.20000000 DFI')
      cy.getByTestID('auction_details_quick_bid_button').click()
      cy.getByTestID('quick_bid_submit_button').click().wait(1000)
      cy.closeOceanInterface()

      cy.getByTestID('auction_detail_tab_BID_HISTORY').click()
      cy.getByTestID('empty_bid_history').should('not.exist')
      cy.getByTestID('batch_detail_highest_text').should('exist')
      cy.getByTestID('bid_1').should('exist')

      // place bid
      cy.getByTestID('bottom_tab_auctions').click()
      cy.getByTestID('batch_card_0_place_bid_button').click()
      cy.getByTestID('MAX_amount_button').click()
      cy.getByTestID('button_submit').click()
      cy.getByTestID('button_confirm_bid').click()
      cy.closeOceanInterface()
      cy.getByTestID('batch_card_0_highest_text').should('exist')
      cy.getByTestID('batch_card_0').click()
      cy.getByTestID('bid_1').should('exist')
      cy.getByTestID('bid_2').should('exist')
    })
  })

  // TODO: add e2e to check if other user can place bid
  // it('should allow others to place bid', function () {
  //   cy.wait(5000)
  //   cy.exitWallet()
  //   cy.restoreMnemonicWords(recoveryWords).wait(3000)
  //   runIfAuctionsIsAvailable(() => {
  //     cy.getByTestID('bottom_tab_auctions').click()
  //     cy.getByTestID('batch_card_0_owned_vault').should('exist')
  //     cy.getByTestID('batch_card_0_no_bid').should('exist')
  //     cy.getByTestID('batch_card_0_place_bid').click()
  //     cy.getByTestID('MAX_amount_button').click()
  //     cy.getByTestID('button_submit').click()
  //     cy.getByTestID('button_confirm_bid').click()
  //     cy.closeOceanInterface()

  //     cy.getByTestID('batch_card_0_highest_text').should('exist')
  //     cy.getByTestID('batch_card_0').click()
  //     cy.getByTestID('bid_3').should('exist')
  //   })
  // })

  describe('Min. Next Bid', function () {
    // Price rate ($ per TU10) = 200000
    function validateLoanTokenUSDValue (tokenTestID: string, usdTestID: string): void {
      cy.wrap<LoanVaultLiquidated[]>(whale.poolpairs.listDexPrices('USDT'), { timeout: 20000 })
        .then((response): void => {
          cy.getByTestID(tokenTestID).invoke('text').then((text: string) => {
            const minNextBid = text.replace(' dTU10', '')
            cy.getByTestID(usdTestID).invoke('text').then((actualUSD: string) => {
              const price = response.dexPrices.TU10
              const estimatedUSD = new BigNumber(minNextBid).times(price.denominationPrice)
              checkValueWithinRange(actualUSD, estimatedUSD.toFixed(2))
            })
          })
        })
    }

    it('should display USD values in batch card', function () {
      cy.go('back')
      runIfAuctionsIsAvailable(() => {
        validateLoanTokenUSDValue('batch_0_min_next_bid', 'batch_0_min_next_bid_usd')
      })
    })

    it('should display USD values in quick bid bottom sheet in auction home screen', function () {
      runIfAuctionsIsAvailable(() => {
        cy.getByTestID('batch_card_0_quick_bid_button').click()
        validateLoanTokenUSDValue('quick_bid_min_next_bid', 'quick_bid_min_next_bid_usd')
        validateLoanTokenUSDValue('text_current_balance', 'quick_bid_current_balance_usd')
        cy.getByTestID('quick_bid_close_button').click()
      })
    })

    it('should display USD values in place bid screen', function () {
      runIfAuctionsIsAvailable(() => {
        cy.getByTestID('batch_card_0_place_bid_button').click()
        validateLoanTokenUSDValue('text_min_next_bid', 'place_bid_min_next_bid_usd')
        cy.go('back')
      })
    })

    it('should display USD values in auction details screen', function () {
      runIfAuctionsIsAvailable(() => {
        cy.getByTestID('batch_card_0').click()
        validateLoanTokenUSDValue('auction_detail_min_next_bid', 'auction_detail_min_next_bid_usd')
      })
    })

    it('should display USD values in quick bid bottom sheet in auction details screen', function () {
      runIfAuctionsIsAvailable(() => {
        cy.getByTestID('auction_details_quick_bid_button').click()
        validateLoanTokenUSDValue('quick_bid_min_next_bid', 'quick_bid_min_next_bid_usd')
        validateLoanTokenUSDValue('text_current_balance', 'quick_bid_current_balance_usd')
        cy.getByTestID('quick_bid_close_button').click()
      })
    })
  })
})

context('Wallet - Auctions Feature Gated', () => {
  it('should not have auctions tab if auction feature is blocked', function () {
    cy.intercept('**/settings/flags', {
      body: []
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_auctions').should('not.exist')
  })

  it('should not have auctions tab if feature flag api does not contains auction', function () {
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
    cy.getByTestID('bottom_tab_auctions').should('not.exist')
  })

  it('should not have auctions tab if feature flag api failed', function () {
    cy.intercept('**/settings/flags', {
      statusCode: 404,
      body: '404 Not Found!',
      headers: {
        'x-not-found': 'true'
      }
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_auctions').should('not.exist')
  })

  it('should not have auctions tab if auction feature is beta and not activated by user', function () {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'auction',
          name: 'Auction',
          stage: 'beta',
          version: '>=0.0.0',
          description: 'Auction',
          networks: [EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
          platforms: ['ios', 'android', 'web']
        }
      ]
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_auctions').should('not.exist')
  })

  it('should have auctions tab if auction feature is beta is activated', function () {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'auction',
          name: 'Auction',
          stage: 'beta',
          version: '>=0.0.0',
          description: 'Auctions',
          networks: [EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
          platforms: ['ios', 'android', 'web']
        }
      ]
    })
    localStorage.setItem('WALLET.ENABLED_FEATURES', '["auction"]')
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_auctions').should('exist')
  })

  it('should have auctions tab if auction feature is public', function () {
    cy.intercept('**/settings/flags', {
      body: [
        {
          id: 'auction',
          name: 'Auction',
          stage: 'public',
          version: '>=0.0.0',
          description: 'Auctions',
          networks: [EnvironmentNetwork.RemotePlayground, EnvironmentNetwork.LocalPlayground],
          platforms: ['ios', 'android', 'web']
        }
      ]
    })
    cy.createEmptyWallet(true)
    cy.getByTestID('bottom_tab_auctions').should('exist')
  })
})

context('Wallet - Auctions - Filters and Sorting', () => {
  const vaultIds = {
    fromYourVaultWithBidLost1: 'from-your-vault-with-bid-lost-1',
    fromYourVaultWithBidLost2: 'from-your-vault-with-bid-lost-2',
    fromYourVaultWithWinningBid1: 'from-your-vault-with-winning-bid-1',
    fromYourVaultWithWinningBid2: 'from-your-vault-with-winning-bid-2',
    fromYourVault1: 'from-your-vault-1',
    fromYourVault2: 'from-your-vault-2',
    otherVault1: 'other-vault-1',
    otherVault2: 'other-vault-2'
  }

  const getAuctions = (
    ownerAddress: string,
    otherAddresses: string[]
  ): LoanVaultLiquidated[] => {
    const getAuctionData = ({
      ownerAddress,
      hasPlacedBid,
      isHighestBidder,
      liquidationHeight,
      vaultId
    }: {
      ownerAddress: string
      hasPlacedBid: boolean
      isHighestBidder: boolean
      liquidationHeight: number
      vaultId: string
    }): LoanVaultLiquidated => {
      return {
        vaultId: vaultId,
        loanScheme: {
          id: 'MIN150',
          minColRatio: '150',
          interestRate: '5'
        },
        ownerAddress: ownerAddress,
        state: LoanVaultState.IN_LIQUIDATION,
        batchCount: 1,
        liquidationHeight: liquidationHeight,
        liquidationPenalty: 5,
        batches: [
          {
            index: 0,
            collaterals: [
              {
                id: '0',
                amount: '20.00000000',
                symbol: 'DFI',
                symbolKey: 'DFI',
                name: 'Default Defi token',
                displaySymbol: 'DFI',
                activePrice: {
                  id: 'DFI-USD-3330',
                  key: 'DFI-USD',
                  isLive: true,
                  block: {
                    hash: '5c28aee7e41f7210120059400870a528a87bd27cebd2a75e63fe0a4c6dec3ee5',
                    height: 3330,
                    medianTime: 1646632901,
                    time: 1646632908
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
                    amount: '100.00000000',
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3
                    }
                  },
                  sort: '00000d02'
                }
              }
            ],
            loan: {
              id: '15',
              amount: '114.12742562',
              symbol: 'TU10',
              symbolKey: 'TU10',
              name: 'Decentralized TU10',
              displaySymbol: 'dTU10',
              activePrice: {
                id: 'TU10-USD-3330',
                key: 'TU10-USD',
                isLive: true,
                block: {
                  hash: '5c28aee7e41f7210120059400870a528a87bd27cebd2a75e63fe0a4c6dec3ee5',
                  height: 3330,
                  medianTime: 1646632901,
                  time: 1646632908
                },
                active: {
                  amount: '11.72914909',
                  weightage: 3,
                  oracles: {
                    active: 3,
                    total: 3
                  }
                },
                next: {
                  amount: '11.73305927',
                  weightage: 3,
                  oracles: {
                    active: 3,
                    total: 3
                  }
                },
                sort: '00000d02'
              }
            },
            froms: hasPlacedBid ? [ownerAddress, ...otherAddresses] : [],
            ...(hasPlacedBid && {
              highestBid: {
                owner: isHighestBidder ? ownerAddress : otherAddresses[0],
                amount: {
                  id: '15',
                  amount: '322.65909673',
                  symbol: 'TU10',
                  symbolKey: 'TU10',
                  name: 'Decentralized TU10',
                  displaySymbol: 'dTU10',
                  activePrice: {
                    id: 'TU10-USD-1302',
                    key: 'TU10-USD',
                    isLive: true,
                    block: {
                      hash: '6e5328f43012d0940255b83c802e82355aade267df04f64f82871e119d3df2be',
                      height: 1302,
                      medianTime: 1646644048,
                      time: 1646644054
                    },
                    active: {
                      amount: '10.59605962',
                      weightage: 3,
                      oracles: {
                        active: 3,
                        total: 3
                      }
                    },
                    next: {
                      amount: '10.59923876',
                      weightage: 3,
                      oracles: {
                        active: 3,
                        total: 3
                      }
                    },
                    sort: '00000516'
                  }
                }
              }
            })
          }
        ]
      }
    }

    const fromYourVault1 = getAuctionData({ vaultId: vaultIds.fromYourVault1, ownerAddress, hasPlacedBid: false, isHighestBidder: false, liquidationHeight: 1100 })
    const fromYourVault2 = getAuctionData({ vaultId: vaultIds.fromYourVault2, ownerAddress, hasPlacedBid: false, isHighestBidder: false, liquidationHeight: 1200 })
    const fromYourVaultWithWinningBid1 = getAuctionData({ vaultId: vaultIds.fromYourVaultWithWinningBid1, ownerAddress, hasPlacedBid: true, isHighestBidder: true, liquidationHeight: 1100 })
    const fromYourVaultWithWinningBid2 = getAuctionData({ vaultId: vaultIds.fromYourVaultWithWinningBid2, ownerAddress, hasPlacedBid: true, isHighestBidder: true, liquidationHeight: 1200 })
    const fromYourVaultWithBidLost1 = getAuctionData({ vaultId: vaultIds.fromYourVaultWithBidLost1, ownerAddress, hasPlacedBid: true, isHighestBidder: false, liquidationHeight: 1100 })
    const fromYourVaultWithBidLost2 = getAuctionData({ vaultId: vaultIds.fromYourVaultWithBidLost2, ownerAddress, hasPlacedBid: true, isHighestBidder: false, liquidationHeight: 1200 })
    const otherVault1 = getAuctionData({ vaultId: vaultIds.otherVault1, ownerAddress: otherAddresses[0], hasPlacedBid: false, isHighestBidder: false, liquidationHeight: 1100 })
    const otherVault2 = getAuctionData({ vaultId: vaultIds.otherVault2, ownerAddress: otherAddresses[1], hasPlacedBid: false, isHighestBidder: false, liquidationHeight: 1200 })

    return [otherVault1, fromYourVaultWithBidLost2, fromYourVault1, fromYourVaultWithWinningBid2, fromYourVault2, otherVault2, fromYourVaultWithBidLost1, fromYourVaultWithWinningBid1]
  }

  const getVaults = (vaultIds: string[], ownerAddress: string): Array<LoanVaultActive | LoanVaultLiquidated> => {
    return vaultIds.map(vaultId => {
      return {
        vaultId: vaultId,
        loanScheme: {
          id: 'MIN150',
          minColRatio: '150',
          interestRate: '5'
        },
        ownerAddress: ownerAddress,
        state: LoanVaultState.IN_LIQUIDATION,
        batchCount: 1,
        liquidationHeight: 3835,
        liquidationPenalty: 5,
        batches: [
          {
            index: 0,
            collaterals: [
              {
                id: '0',
                amount: '20.00000000',
                symbol: 'DFI',
                symbolKey: 'DFI',
                name: 'Default Defi token',
                displaySymbol: 'DFI',
                activePrice: {
                  id: 'DFI-USD-3798',
                  key: 'DFI-USD',
                  isLive: true,
                  block: {
                    hash: 'block-hash-1',
                    height: 3798,
                    medianTime: 1646634305,
                    time: 1646634311
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
                    amount: '100.00000000',
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3
                    }
                  },
                  sort: '00000ed6'
                }
              }
            ],
            loan: {
              id: '15',
              amount: '114.12911939',
              symbol: 'TU10',
              symbolKey: 'TU10',
              name: 'Decentralized TU10',
              displaySymbol: 'dTU10',
              activePrice: {
                id: 'TU10-USD-3798',
                key: 'TU10-USD',
                isLive: true,
                block: {
                  hash: 'block-hash-1',
                  height: 3798,
                  medianTime: 1646634305,
                  time: 1646634311
                },
                active: {
                  amount: '12.00683353',
                  weightage: 3,
                  oracles: {
                    active: 3,
                    total: 3
                  }
                },
                next: {
                  amount: '12.01043594',
                  weightage: 3,
                  oracles: {
                    active: 3,
                    total: 3
                  }
                },
                sort: '00000ed6'
              }
            },
            froms: []
          }
        ]
      }
    })
  }

  beforeEach(() => {
    // To keep vaults in liquidation status
    cy.intercept('**/regtest/stats', {
      statusCode: 200,
      body: {
        data: {
          count: {
            blocks: 100,
            prices: 0,
            tokens: 11,
            masternodes: 10
          },
          tvl: {
            dex: 1
          }
        }
      }
    })
    cy.createEmptyWallet(true).wait(3000)
    cy.getByTestID('receive_balance_button').click()
    cy.getByTestID('address_text').invoke('text').then((ownerAddress: string) => {
      cy.intercept('**/vaults?size=*', {
        statusCode: 200,
        body: { data: getVaults(Object.values(vaultIds), ownerAddress) }
      }).as('getVaults')
      cy.intercept('**/auctions?size=*', {
        body: {
          data: getAuctions(ownerAddress, ['owner-address-abcdefghijklmopqrstuvexyz-1', 'owner-address-abcdefghijklmopqrstuvexyz-2'])
        }
      })
    })
    cy.getByTestID('bottom_tab_auctions').click()
  })

  it('should sort auctions correctly', function () {
    /*
      Sort Order:
        - Placed bid lost
        - Placed bid winning
        - Time remaining (desc)
    */
    Object.values(vaultIds).forEach((vaultId, index) => {
      cy.getByTestID(`batch_card_${index}`).click()
      cy.getByTestID('auction_detail_tab_AUCTION_DETAILS').click()
      cy.getByTestID('vault_id').should('have.text', vaultId)
      cy.go('back')
    })
  })

  it('should filter auctions from your vault with correct sorting', function () {
    cy.getByTestID('auctions_button_group_FROM_YOUR_VAULT').click()
    Object.values([
      vaultIds.fromYourVaultWithBidLost1,
      vaultIds.fromYourVaultWithBidLost2,
      vaultIds.fromYourVaultWithWinningBid1,
      vaultIds.fromYourVaultWithWinningBid2,
      vaultIds.fromYourVault1,
      vaultIds.fromYourVault2]).forEach((vaultId, index) => {
      cy.getByTestID(`batch_card_${index}`).click()
      cy.getByTestID('auction_detail_tab_AUCTION_DETAILS').click()
      cy.getByTestID('vault_id').should('have.text', vaultId)
      cy.go('back')
    })
    cy.getByTestID('batch_card_6').should('not.exist')
  })

  it('should filter auctions with placed bids with correct sorting', function () {
    cy.getByTestID('auctions_button_group_WITH_PLACED_BIDS').click()
    Object.values([
      vaultIds.fromYourVaultWithBidLost1,
      vaultIds.fromYourVaultWithBidLost2,
      vaultIds.fromYourVaultWithWinningBid1,
      vaultIds.fromYourVaultWithWinningBid2]).forEach((vaultId, index) => {
      cy.getByTestID(`batch_card_${index}`).click()
      cy.getByTestID('auction_detail_tab_AUCTION_DETAILS').click()
      cy.getByTestID('vault_id').should('have.text', vaultId)
      cy.go('back')
    })
    cy.getByTestID('batch_card_4').should('not.exist')
  })

  it('should display bid lost/winning on card', function () {
    cy.getByTestID('batch_card_0_bid_lost').should('exist')
    cy.getByTestID('batch_card_1_bid_lost').should('exist')
    cy.getByTestID('batch_card_0_no_bid').should('not.exist')
    cy.getByTestID('batch_card_1_no_bid').should('not.exist')
    cy.getByTestID('batch_card_0_no_winning').should('not.exist')
    cy.getByTestID('batch_card_1_no_winning').should('not.exist')

    cy.getByTestID('batch_card_2_bid_winning').should('exist')
    cy.getByTestID('batch_card_3_bid_winning').should('exist')
    cy.getByTestID('batch_card_2_no_bid').should('not.exist')
    cy.getByTestID('batch_card_3_no_bid').should('not.exist')
    cy.getByTestID('batch_card_2_bid_lost').should('not.exist')
    cy.getByTestID('batch_card_3_bid_lost').should('not.exist')
  })

  it('should display empty results on each tab', function () {
    cy.getByTestID('header_auctions_search').click()
    cy.getByTestID('auctions_search_input').clear().type('XXX').blur()
    cy.getByTestID('empty_auctions_list').should('exist')
    cy.getByTestID('empty_auctions_list').should('have.text', 'No available auctions')
    cy.getByTestID('auctions_button_group_FROM_YOUR_VAULT').click()
    cy.getByTestID('empty_auctions_list').should('have.text', 'No available auctions from your vault')
    cy.getByTestID('auctions_button_group_WITH_PLACED_BIDS').click()
    cy.getByTestID('empty_auctions_list').should('have.text', 'No available auctions with placed bids')
  })
})
