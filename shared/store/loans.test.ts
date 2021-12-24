import { CollateralToken, LoanScheme, LoanToken, LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { ActivePrice } from '@defichain/whale-api-client/dist/api/prices'
import { ascColRatioLoanScheme, fetchCollateralTokens, fetchLoanSchemes, fetchLoanTokens, fetchVaults, loans, LoansState, loanTokenByTokenId, loanTokensSelector, LoanVault, vaultsSelector } from './loans'

describe('loans reducer', () => {
  let initialState: LoansState
  const vault: LoanVault =
  {
    vaultId: 'eee84f2cc56bbc51a42eaf302b76d4d1250b58b943829ee82f2fa9a46a9e4319',
    loanScheme: {
      id: 'MIN150',
      minColRatio: '150',
      interestRate: '5'
    },
    ownerAddress: 'bcrt1q39r84tmh4xp7wmg32tnza8j544lynknvy8q2nr',
    state: LoanVaultState.ACTIVE,
    informativeRatio: '9999.94300032',
    collateralRatio: '10000',
    collateralValue: '100',
    loanValue: '1.0000057',
    interestValue: '0.0000057',
    collateralAmounts: [
      {
        id: '0',
        amount: '1.00000000',
        symbol: 'DFI',
        symbolKey: 'DFI',
        name: 'Default Defi token',
        displaySymbol: 'DFI',
        activePrice: {
          id: 'DFI-USD-5676',
          key: 'DFI-USD',
          isLive: true,
          block: {
            hash: '4aea2761e0f220fc88616dffc555a64e7b663f564f441dfc0ba1f56cc7216342',
            height: 5676,
            medianTime: 1640317919,
            time: 1640317925
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
          sort: '0000162c'
        }
      }
    ],
    loanAmounts: [
      {
        id: '14',
        amount: '1.00000570',
        symbol: 'DUSD',
        symbolKey: 'DUSD',
        name: 'Decentralized USD',
        displaySymbol: 'DUSD'
      }
    ],
    interestAmounts: [
      {
        id: '14',
        amount: '0.00000570',
        symbol: 'DUSD',
        symbolKey: 'DUSD',
        name: 'Decentralized USD',
        displaySymbol: 'DUSD'
      }
    ]
  }
  const loanTokens: LoanToken[] = [
    {
      tokenId: '3b15f22b7e8016ebb7c0e771831221327c96a82ea45abe7232f16d1d9c49a259',
      token: {
        id: '12',
        symbol: 'TU10',
        symbolKey: 'TU10',
        name: 'Decentralized TU10',
        decimal: 8,
        limit: '0',
        mintable: true,
        tradeable: true,
        isDAT: true,
        isLPS: false,
        finalized: false,
        minted: '10.27',
        creation: {
          tx: '3b15f22b7e8016ebb7c0e771831221327c96a82ea45abe7232f16d1d9c49a259',
          height: 128
        },
        destruction: {
          tx: '0000000000000000000000000000000000000000000000000000000000000000',
          height: -1
        },
        collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
        displaySymbol: 'dTU10'
      },
      interest: '1',
      fixedIntervalPriceId: 'TU10/USD',
      activePrice: {
        id: 'TU10-USD-4644',
        key: 'TU10-USD',
        isLive: true,
        block: {
          hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
          height: 4644,
          medianTime: 1640314816,
          time: 1640314822
        },
        active: {
          amount: '12.53060202',
          weightage: 3,
          oracles: {
            active: 3,
            total: 3
          }
        },
        next: {
          amount: '12.53436157',
          weightage: 3,
          oracles: {
            active: 3,
            total: 3
          }
        },
        sort: '00001224'
      }
    },
    {
      tokenId: '66115c008b1fe6fcf689b6d0f815f08e97c7e4c4b1967ff96753ba92882c6797',
      token: {
        id: '13',
        symbol: 'TS25',
        symbolKey: 'TS25',
        name: 'Decentralized TS10',
        decimal: 8,
        limit: '0',
        mintable: true,
        tradeable: true,
        isDAT: true,
        isLPS: false,
        finalized: false,
        minted: '102.7',
        creation: {
          tx: '66115c008b1fe6fcf689b6d0f815f08e97c7e4c4b1967ff96753ba92882c6797',
          height: 128
        },
        destruction: {
          tx: '0000000000000000000000000000000000000000000000000000000000000000',
          height: -1
        },
        collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
        displaySymbol: 'dTS25'
      },
      interest: '2',
      fixedIntervalPriceId: 'TS25/USD',
      activePrice: {
        id: 'TS25-USD-4644',
        key: 'TS25-USD',
        isLive: true,
        block: {
          hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
          height: 4644,
          medianTime: 1640314816,
          time: 1640314822
        },
        active: {
          amount: '25.00000000',
          weightage: 3,
          oracles: {
            active: 3,
            total: 3
          }
        },
        next: {
          amount: '25.00000000',
          weightage: 3,
          oracles: {
            active: 3,
            total: 3
          }
        },
        sort: '00001224'
      }
    },
    {
      tokenId: 'a3a124bf5a6c37fe8d293b45bf32a16e412d06c376d0a042078279564c07ac2e',
      token: {
        id: '10',
        symbol: 'TD10',
        symbolKey: 'TD10',
        name: 'Decentralized TD10',
        decimal: 8,
        limit: '0',
        mintable: true,
        tradeable: true,
        isDAT: true,
        isLPS: false,
        finalized: false,
        minted: '0.0001027',
        creation: {
          tx: 'a3a124bf5a6c37fe8d293b45bf32a16e412d06c376d0a042078279564c07ac2e',
          height: 128
        },
        destruction: {
          tx: '0000000000000000000000000000000000000000000000000000000000000000',
          height: -1
        },
        collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
        displaySymbol: 'dTD10'
      },
      interest: '1.5',
      fixedIntervalPriceId: 'TD10/USD',
      activePrice: {
        id: 'TD10-USD-4644',
        key: 'TD10-USD',
        isLive: true,
        block: {
          hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
          height: 4644,
          medianTime: 1640314816,
          time: 1640314822
        },
        active: {
          amount: '798028250.32269574',
          weightage: 3,
          oracles: {
            active: 3,
            total: 3
          }
        },
        next: {
          amount: '797788865.78764842',
          weightage: 3,
          oracles: {
            active: 3,
            total: 3
          }
        },
        sort: '00001224'
      }
    },
    {
      tokenId: 'b99d32217b8fbe8872015c1a376f745a94372f061a0fb88c9b212876e4f158f5',
      token: {
        id: '14',
        symbol: 'DUSD',
        symbolKey: 'DUSD',
        name: 'Decentralized USD',
        decimal: 8,
        limit: '0',
        mintable: true,
        tradeable: true,
        isDAT: true,
        isLPS: false,
        finalized: false,
        minted: '20540',
        creation: {
          tx: 'b99d32217b8fbe8872015c1a376f745a94372f061a0fb88c9b212876e4f158f5',
          height: 128
        },
        destruction: {
          tx: '0000000000000000000000000000000000000000000000000000000000000000',
          height: -1
        },
        collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
        displaySymbol: 'DUSD'
      },
      interest: '0',
      fixedIntervalPriceId: 'DUSD/USD'
    },
    {
      tokenId: 'ffbaea57f155a36700c65a018aafe5e7d9984416339fb623df887f1a82b12142',
      token: {
        id: '11',
        symbol: 'TR50',
        symbolKey: 'TR50',
        name: 'Decentralized TR50',
        decimal: 8,
        limit: '0',
        mintable: true,
        tradeable: true,
        isDAT: true,
        isLPS: false,
        finalized: false,
        minted: '10.27',
        creation: {
          tx: 'ffbaea57f155a36700c65a018aafe5e7d9984416339fb623df887f1a82b12142',
          height: 128
        },
        destruction: {
          tx: '0000000000000000000000000000000000000000000000000000000000000000',
          height: -1
        },
        collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
        displaySymbol: 'dTR50'
      },
      interest: '3',
      fixedIntervalPriceId: 'TR50/USD',
      activePrice: {
        id: 'TR50-USD-4644',
        key: 'TR50-USD',
        isLive: false,
        block: {
          hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
          height: 4644,
          medianTime: 1640314816,
          time: 1640314822
        },
        active: {
          amount: '1.30875799',
          weightage: 3,
          oracles: {
            active: 3,
            total: 3
          }
        },
        next: {
          amount: '0.78137694',
          weightage: 3,
          oracles: {
            active: 3,
            total: 3
          }
        },
        sort: '00001224'
      }
    }
  ]
  const customDUSDActivePrice: ActivePrice = {
    id: 'custom_DUSD',
    key: 'custom_DUSD',
    sort: '',
    isLive: true,
    block: {
      hash: '',
      height: 0,
      time: 0,
      medianTime: 0
    },
    active: {
      amount: '1',
      weightage: 1,
      oracles: {
        active: 1,
        total: 1
      }
    },
    next: {
      amount: '1',
      weightage: 1,
      oracles: {
        active: 1,
        total: 1
      }
    }
  }

  beforeEach(() => {
    initialState = {
      vaults: [],
      loanTokens: [],
      loanSchemes: [],
      collateralTokens: [],
      hasFetchedVaultsData: false,
      hasFetchedLoansData: false
    }
  })

  it('should handle initial state', () => {
    expect(loans.reducer(undefined, { type: 'unknown' })).toEqual({
      vaults: [],
      loanTokens: [],
      loanSchemes: [],
      collateralTokens: [],
      hasFetchedVaultsData: false,
      hasFetchedLoansData: false
    })
  })

  it('should handle fetch vaults', () => {
    const action = { type: fetchVaults.fulfilled, payload: [vault] }
    const actual = loans.reducer(initialState, action)
    expect(actual.vaults).toStrictEqual([vault])
  })

  it('should handle fetch loan tokens', () => {
    const action = { type: fetchLoanTokens.fulfilled, payload: loanTokens }
    const actual = loans.reducer(initialState, action)
    expect(actual.loanTokens).toStrictEqual(loanTokens)
  })

  it('should handle fetch loan schemes', () => {
    const loanSchemes: LoanScheme[] = [
      {
        id: 'MIN10000',
        minColRatio: '1000',
        interestRate: '0.5'
      },
      {
        id: 'MIN150',
        minColRatio: '150',
        interestRate: '5'
      },
      {
        id: 'MIN175',
        minColRatio: '175',
        interestRate: '3'
      },
      {
        id: 'MIN200',
        minColRatio: '200',
        interestRate: '2'
      },
      {
        id: 'MIN350',
        minColRatio: '350',
        interestRate: '1.5'
      },
      {
        id: 'MIN500',
        minColRatio: '500',
        interestRate: '1'
      }
    ]
    const action = { type: fetchLoanSchemes.fulfilled, payload: loanSchemes }
    const actual = loans.reducer(initialState, action)
    expect(actual.loanSchemes).toStrictEqual(loanSchemes)
  })

  it('should handle fetch collateral tokens', () => {
    const collateralTokens: CollateralToken[] = [
      {
        tokenId: '08987c2d1f3d7d5a18a331c4a173a85be34cf5d2438a3e51a2ed4ed2779a6279',
        token: {
          id: '8',
          symbol: 'CS25',
          symbolKey: 'CS25',
          name: 'Playground CS25',
          decimal: 8,
          limit: '0',
          mintable: true,
          tradeable: true,
          isDAT: true,
          isLPS: false,
          finalized: false,
          minted: '100000000',
          creation: {
            tx: '37e2279b80e68f55fe1ccf9920a084731cd08e331a5ee6f7769759263e66bdcb',
            height: 118
          },
          destruction: {
            tx: '0000000000000000000000000000000000000000000000000000000000000000',
            height: -1
          },
          collateralAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
          displaySymbol: 'dCS25'
        },
        factor: '1',
        activateAfterBlock: 130,
        fixedIntervalPriceId: 'CS25/USD',
        activePrice: {
          id: 'CS25-USD-4644',
          key: 'CS25-USD',
          isLive: true,
          block: {
            hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
            height: 4644,
            medianTime: 1640314816,
            time: 1640314822
          },
          active: {
            amount: '25.00000000',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          next: {
            amount: '25.00000000',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          sort: '00001224'
        }
      },
      {
        tokenId: '0b990af4ede825e3b626ac3eaa72111babf0ee5e188e66ce503415e0d3f88031',
        token: {
          id: '3',
          symbol: 'USDT',
          symbolKey: 'USDT',
          name: 'Playground USDT',
          decimal: 8,
          limit: '0',
          mintable: true,
          tradeable: true,
          isDAT: true,
          isLPS: false,
          finalized: false,
          minted: '1000000000',
          creation: {
            tx: '3fba5bf3426acbe9e3aadc9827ec8eb646ee6a2e6b09eb41ce69bddfe054d03a',
            height: 107
          },
          destruction: {
            tx: '0000000000000000000000000000000000000000000000000000000000000000',
            height: -1
          },
          collateralAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
          displaySymbol: 'dUSDT'
        },
        factor: '1',
        activateAfterBlock: 129,
        fixedIntervalPriceId: 'USDT/USD',
        activePrice: {
          id: 'USDT-USD-4644',
          key: 'USDT-USD',
          isLive: true,
          block: {
            hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
            height: 4644,
            medianTime: 1640314816,
            time: 1640314822
          },
          active: {
            amount: '0.99000000',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          next: {
            amount: '0.99000000',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          sort: '00001224'
        }
      },
      {
        tokenId: '11c000d76c6d45f069630ffb3534d69f1b0e1d75a1f97d9bb3fcfaa051116126',
        token: {
          id: '9',
          symbol: 'CR50',
          symbolKey: 'CR50',
          name: 'Playground CR50',
          decimal: 8,
          limit: '0',
          mintable: true,
          tradeable: true,
          isDAT: true,
          isLPS: false,
          finalized: false,
          minted: '100000000',
          creation: {
            tx: '2f35eb08a993b052cbb60fb27062c6ff6f88015c92566a243d0092c267a31462',
            height: 120
          },
          destruction: {
            tx: '0000000000000000000000000000000000000000000000000000000000000000',
            height: -1
          },
          collateralAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
          displaySymbol: 'dCR50'
        },
        factor: '1',
        activateAfterBlock: 130,
        fixedIntervalPriceId: 'CR50/USD',
        activePrice: {
          id: 'CR50-USD-4644',
          key: 'CR50-USD',
          isLive: true,
          block: {
            hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
            height: 4644,
            medianTime: 1640314816,
            time: 1640314822
          },
          active: {
            amount: '1.30875799',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          next: {
            amount: '1.55109154',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          sort: '00001224'
        }
      },
      {
        tokenId: '1be56968323c69b31b02a6e15a0d072a7eaa40606e59bd332a632f8f74c8394f',
        token: {
          id: '1',
          symbol: 'BTC',
          symbolKey: 'BTC',
          name: 'Playground BTC',
          decimal: 8,
          limit: '0',
          mintable: true,
          tradeable: true,
          isDAT: true,
          isLPS: false,
          finalized: false,
          minted: '10000',
          creation: {
            tx: '0c5cd2e8869686f74e181fa7da9cf9321fe68061879e2324623cbe337c56d258',
            height: 102
          },
          destruction: {
            tx: '0000000000000000000000000000000000000000000000000000000000000000',
            height: -1
          },
          collateralAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
          displaySymbol: 'dBTC'
        },
        factor: '1',
        activateAfterBlock: 129,
        fixedIntervalPriceId: 'BTC/USD',
        activePrice: {
          id: 'BTC-USD-4644',
          key: 'BTC-USD',
          isLive: true,
          block: {
            hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
            height: 4644,
            medianTime: 1640314816,
            time: 1640314822
          },
          active: {
            amount: '50.00000000',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          next: {
            amount: '50.00000000',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          sort: '00001224'
        }
      },
      {
        tokenId: '24c29b6cb479672d2187ec2996bc503a5d513972d92021af2893086a499b23e6',
        token: {
          id: '5',
          symbol: 'USDC',
          symbolKey: 'USDC',
          name: 'Playground USDC',
          decimal: 8,
          limit: '0',
          mintable: true,
          tradeable: true,
          isDAT: true,
          isLPS: false,
          finalized: false,
          minted: '200000000',
          creation: {
            tx: '99b9023db4bb1f6bc482200bd0f78b08f0e111401ea325dffb34810be5779539',
            height: 111
          },
          destruction: {
            tx: '0000000000000000000000000000000000000000000000000000000000000000',
            height: -1
          },
          collateralAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
          displaySymbol: 'dUSDC'
        },
        factor: '1',
        activateAfterBlock: 129,
        fixedIntervalPriceId: 'USDC/USD',
        activePrice: {
          id: 'USDC-USD-4644',
          key: 'USDC-USD',
          isLive: true,
          block: {
            hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
            height: 4644,
            medianTime: 1640314816,
            time: 1640314822
          },
          active: {
            amount: '1.00000000',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          next: {
            amount: '1.00000000',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          sort: '00001224'
        }
      },
      {
        tokenId: '5b43b7fccfdbe27c03634f4557f2f32afc9ee48b590152de3ab03c7924f60d3e',
        token: {
          id: '6',
          symbol: 'CU10',
          symbolKey: 'CU10',
          name: 'Playground CU10',
          decimal: 8,
          limit: '0',
          mintable: true,
          tradeable: true,
          isDAT: true,
          isLPS: false,
          finalized: false,
          minted: '100000000',
          creation: {
            tx: '58f057f353135d7663467ac500048d850281eb760cc4977c3744ef3f5cff0bfd',
            height: 114
          },
          destruction: {
            tx: '0000000000000000000000000000000000000000000000000000000000000000',
            height: -1
          },
          collateralAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
          displaySymbol: 'dCU10'
        },
        factor: '1',
        activateAfterBlock: 129,
        fixedIntervalPriceId: 'CU10/USD',
        activePrice: {
          id: 'CU10-USD-4644',
          key: 'CU10-USD',
          isLive: true,
          block: {
            hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
            height: 4644,
            medianTime: 1640314816,
            time: 1640314822
          },
          active: {
            amount: '12.53060202',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          next: {
            amount: '12.53436157',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          sort: '00001224'
        }
      },
      {
        tokenId: 'b3c215e96ecdb722fca85145a78c045c451eebc8b9f0b3c78f0693b15ac7029e',
        token: {
          id: '2',
          symbol: 'ETH',
          symbolKey: 'ETH',
          name: 'Playground ETH',
          decimal: 8,
          limit: '0',
          mintable: true,
          tradeable: true,
          isDAT: true,
          isLPS: false,
          finalized: false,
          minted: '100000000',
          creation: {
            tx: 'ca4ba3657826c47d6691d4a54b96f5652852540684d11d5113603ed9a1345d6f',
            height: 105
          },
          destruction: {
            tx: '0000000000000000000000000000000000000000000000000000000000000000',
            height: -1
          },
          collateralAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
          displaySymbol: 'dETH'
        },
        factor: '0.7',
        activateAfterBlock: 129,
        fixedIntervalPriceId: 'ETH/USD',
        activePrice: {
          id: 'ETH-USD-4644',
          key: 'ETH-USD',
          isLive: true,
          block: {
            hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
            height: 4644,
            medianTime: 1640314816,
            time: 1640314822
          },
          active: {
            amount: '10.00000000',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          next: {
            amount: '10.00000000',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          sort: '00001224'
        }
      },
      {
        tokenId: 'd99b4da573135d0725b5ee5a077b5d102dff3659ba1586de66bb02039c60902f',
        token: {
          id: '0',
          symbol: 'DFI',
          symbolKey: 'DFI',
          name: 'Default Defi token',
          decimal: 8,
          limit: '0',
          mintable: false,
          tradeable: true,
          isDAT: true,
          isLPS: false,
          finalized: true,
          minted: '0',
          creation: {
            tx: '0000000000000000000000000000000000000000000000000000000000000000',
            height: 0
          },
          destruction: {
            tx: '0000000000000000000000000000000000000000000000000000000000000000',
            height: -1
          },
          displaySymbol: 'DFI'
        },
        factor: '1',
        activateAfterBlock: 129,
        fixedIntervalPriceId: 'DFI/USD',
        activePrice: {
          id: 'DFI-USD-4644',
          key: 'DFI-USD',
          isLive: true,
          block: {
            hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
            height: 4644,
            medianTime: 1640314816,
            time: 1640314822
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
          sort: '00001224'
        }
      },
      {
        tokenId: 'e932b483ea016170177627a508cfa065f047ea1a6b61d7e8cf645c12dd7719cb',
        token: {
          id: '7',
          symbol: 'CD10',
          symbolKey: 'CD10',
          name: 'Playground CD10',
          decimal: 8,
          limit: '0',
          mintable: true,
          tradeable: true,
          isDAT: true,
          isLPS: false,
          finalized: false,
          minted: '100000000',
          creation: {
            tx: '358ccc9b87730b9cd82acc4ba50012c59345b1212aa1f1a13db573cd242e817c',
            height: 116
          },
          destruction: {
            tx: '0000000000000000000000000000000000000000000000000000000000000000',
            height: -1
          },
          collateralAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
          displaySymbol: 'dCD10'
        },
        factor: '1',
        activateAfterBlock: 130,
        fixedIntervalPriceId: 'CD10/USD',
        activePrice: {
          id: 'CD10-USD-4644',
          key: 'CD10-USD',
          isLive: true,
          block: {
            hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
            height: 4644,
            medianTime: 1640314816,
            time: 1640314822
          },
          active: {
            amount: '798028250.32269574',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          next: {
            amount: '797788865.78764842',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          sort: '00001224'
        }
      }
    ]
    const action = { type: fetchCollateralTokens.fulfilled, payload: collateralTokens }
    const actual = loans.reducer(initialState, action)
    expect(actual.collateralTokens).toStrictEqual(collateralTokens)
  })

  it('should be able to select loan schemes with ascending collateralization ratio', () => {
    const state = {
      ...initialState,
      loanSchemes: [
        {
          id: 'MIN10000',
          minColRatio: '1000',
          interestRate: '0.5'
        },
        {
          id: 'MIN150',
          minColRatio: '150',
          interestRate: '5'
        },
        {
          id: 'MIN175',
          minColRatio: '175',
          interestRate: '3'
        },
        {
          id: 'MIN200',
          minColRatio: '200',
          interestRate: '2'
        },
        {
          id: 'MIN350',
          minColRatio: '350',
          interestRate: '1.5'
        },
        {
          id: 'MIN500',
          minColRatio: '500',
          interestRate: '1'
        }
      ]
    }
    const actual = ascColRatioLoanScheme(state)
    expect(actual).toStrictEqual([
      {
        id: 'MIN150',
        minColRatio: '150',
        interestRate: '5'
      },
      {
        id: 'MIN175',
        minColRatio: '175',
        interestRate: '3'
      },
      {
        id: 'MIN200',
        minColRatio: '200',
        interestRate: '2'
      },
      {
        id: 'MIN350',
        minColRatio: '350',
        interestRate: '1.5'
      },
      {
        id: 'MIN500',
        minColRatio: '500',
        interestRate: '1'
      },
      {
        id: 'MIN10000',
        minColRatio: '1000',
        interestRate: '0.5'
      }
    ])
  })

  it('should be able to select loans token that returns DUSD with active price', () => {
    const state = {
      ...initialState,
      loanTokens
    }
    const loanTokensWithDUSDActivePrice: LoanToken[] = [
      {
        tokenId: '3b15f22b7e8016ebb7c0e771831221327c96a82ea45abe7232f16d1d9c49a259',
        token: {
          id: '12',
          symbol: 'TU10',
          symbolKey: 'TU10',
          name: 'Decentralized TU10',
          decimal: 8,
          limit: '0',
          mintable: true,
          tradeable: true,
          isDAT: true,
          isLPS: false,
          finalized: false,
          minted: '10.27',
          creation: {
            tx: '3b15f22b7e8016ebb7c0e771831221327c96a82ea45abe7232f16d1d9c49a259',
            height: 128
          },
          destruction: {
            tx: '0000000000000000000000000000000000000000000000000000000000000000',
            height: -1
          },
          collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
          displaySymbol: 'dTU10'
        },
        interest: '1',
        fixedIntervalPriceId: 'TU10/USD',
        activePrice: {
          id: 'TU10-USD-4644',
          key: 'TU10-USD',
          isLive: true,
          block: {
            hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
            height: 4644,
            medianTime: 1640314816,
            time: 1640314822
          },
          active: {
            amount: '12.53060202',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          next: {
            amount: '12.53436157',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          sort: '00001224'
        }
      },
      {
        tokenId: '66115c008b1fe6fcf689b6d0f815f08e97c7e4c4b1967ff96753ba92882c6797',
        token: {
          id: '13',
          symbol: 'TS25',
          symbolKey: 'TS25',
          name: 'Decentralized TS10',
          decimal: 8,
          limit: '0',
          mintable: true,
          tradeable: true,
          isDAT: true,
          isLPS: false,
          finalized: false,
          minted: '102.7',
          creation: {
            tx: '66115c008b1fe6fcf689b6d0f815f08e97c7e4c4b1967ff96753ba92882c6797',
            height: 128
          },
          destruction: {
            tx: '0000000000000000000000000000000000000000000000000000000000000000',
            height: -1
          },
          collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
          displaySymbol: 'dTS25'
        },
        interest: '2',
        fixedIntervalPriceId: 'TS25/USD',
        activePrice: {
          id: 'TS25-USD-4644',
          key: 'TS25-USD',
          isLive: true,
          block: {
            hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
            height: 4644,
            medianTime: 1640314816,
            time: 1640314822
          },
          active: {
            amount: '25.00000000',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          next: {
            amount: '25.00000000',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          sort: '00001224'
        }
      },
      {
        tokenId: 'a3a124bf5a6c37fe8d293b45bf32a16e412d06c376d0a042078279564c07ac2e',
        token: {
          id: '10',
          symbol: 'TD10',
          symbolKey: 'TD10',
          name: 'Decentralized TD10',
          decimal: 8,
          limit: '0',
          mintable: true,
          tradeable: true,
          isDAT: true,
          isLPS: false,
          finalized: false,
          minted: '0.0001027',
          creation: {
            tx: 'a3a124bf5a6c37fe8d293b45bf32a16e412d06c376d0a042078279564c07ac2e',
            height: 128
          },
          destruction: {
            tx: '0000000000000000000000000000000000000000000000000000000000000000',
            height: -1
          },
          collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
          displaySymbol: 'dTD10'
        },
        interest: '1.5',
        fixedIntervalPriceId: 'TD10/USD',
        activePrice: {
          id: 'TD10-USD-4644',
          key: 'TD10-USD',
          isLive: true,
          block: {
            hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
            height: 4644,
            medianTime: 1640314816,
            time: 1640314822
          },
          active: {
            amount: '798028250.32269574',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          next: {
            amount: '797788865.78764842',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          sort: '00001224'
        }
      },
      {
        tokenId: 'b99d32217b8fbe8872015c1a376f745a94372f061a0fb88c9b212876e4f158f5',
        token: {
          id: '14',
          symbol: 'DUSD',
          symbolKey: 'DUSD',
          name: 'Decentralized USD',
          decimal: 8,
          limit: '0',
          mintable: true,
          tradeable: true,
          isDAT: true,
          isLPS: false,
          finalized: false,
          minted: '20540',
          creation: {
            tx: 'b99d32217b8fbe8872015c1a376f745a94372f061a0fb88c9b212876e4f158f5',
            height: 128
          },
          destruction: {
            tx: '0000000000000000000000000000000000000000000000000000000000000000',
            height: -1
          },
          collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
          displaySymbol: 'DUSD'
        },
        interest: '0',
        fixedIntervalPriceId: 'DUSD/USD',
        activePrice: customDUSDActivePrice
      },
      {
        tokenId: 'ffbaea57f155a36700c65a018aafe5e7d9984416339fb623df887f1a82b12142',
        token: {
          id: '11',
          symbol: 'TR50',
          symbolKey: 'TR50',
          name: 'Decentralized TR50',
          decimal: 8,
          limit: '0',
          mintable: true,
          tradeable: true,
          isDAT: true,
          isLPS: false,
          finalized: false,
          minted: '10.27',
          creation: {
            tx: 'ffbaea57f155a36700c65a018aafe5e7d9984416339fb623df887f1a82b12142',
            height: 128
          },
          destruction: {
            tx: '0000000000000000000000000000000000000000000000000000000000000000',
            height: -1
          },
          collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
          displaySymbol: 'dTR50'
        },
        interest: '3',
        fixedIntervalPriceId: 'TR50/USD',
        activePrice: {
          id: 'TR50-USD-4644',
          key: 'TR50-USD',
          isLive: false,
          block: {
            hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
            height: 4644,
            medianTime: 1640314816,
            time: 1640314822
          },
          active: {
            amount: '1.30875799',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          next: {
            amount: '0.78137694',
            weightage: 3,
            oracles: {
              active: 3,
              total: 3
            }
          },
          sort: '00001224'
        }
      }
    ]
    const actual = loanTokensSelector(state)
    expect(actual).toStrictEqual(loanTokensWithDUSDActivePrice)
  })

  it('should be able to select loan token by token ID', () => {
    const state = {
      ...initialState,
      loanTokens: [
        {
          tokenId: '3b15f22b7e8016ebb7c0e771831221327c96a82ea45abe7232f16d1d9c49a259',
          token: {
            id: '12',
            symbol: 'TU10',
            symbolKey: 'TU10',
            name: 'Decentralized TU10',
            decimal: 8,
            limit: '0',
            mintable: true,
            tradeable: true,
            isDAT: true,
            isLPS: false,
            finalized: false,
            minted: '10.27',
            creation: {
              tx: '3b15f22b7e8016ebb7c0e771831221327c96a82ea45abe7232f16d1d9c49a259',
              height: 128
            },
            destruction: {
              tx: '0000000000000000000000000000000000000000000000000000000000000000',
              height: -1
            },
            collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
            displaySymbol: 'dTU10'
          },
          interest: '1',
          fixedIntervalPriceId: 'TU10/USD',
          activePrice: {
            id: 'TU10-USD-4644',
            key: 'TU10-USD',
            isLive: true,
            block: {
              hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
              height: 4644,
              medianTime: 1640314816,
              time: 1640314822
            },
            active: {
              amount: '12.53060202',
              weightage: 3,
              oracles: {
                active: 3,
                total: 3
              }
            },
            next: {
              amount: '12.53436157',
              weightage: 3,
              oracles: {
                active: 3,
                total: 3
              }
            },
            sort: '00001224'
          }
        },
        {
          tokenId: '66115c008b1fe6fcf689b6d0f815f08e97c7e4c4b1967ff96753ba92882c6797',
          token: {
            id: '13',
            symbol: 'TS25',
            symbolKey: 'TS25',
            name: 'Decentralized TS10',
            decimal: 8,
            limit: '0',
            mintable: true,
            tradeable: true,
            isDAT: true,
            isLPS: false,
            finalized: false,
            minted: '102.7',
            creation: {
              tx: '66115c008b1fe6fcf689b6d0f815f08e97c7e4c4b1967ff96753ba92882c6797',
              height: 128
            },
            destruction: {
              tx: '0000000000000000000000000000000000000000000000000000000000000000',
              height: -1
            },
            collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
            displaySymbol: 'dTS25'
          },
          interest: '2',
          fixedIntervalPriceId: 'TS25/USD',
          activePrice: {
            id: 'TS25-USD-4644',
            key: 'TS25-USD',
            isLive: true,
            block: {
              hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
              height: 4644,
              medianTime: 1640314816,
              time: 1640314822
            },
            active: {
              amount: '25.00000000',
              weightage: 3,
              oracles: {
                active: 3,
                total: 3
              }
            },
            next: {
              amount: '25.00000000',
              weightage: 3,
              oracles: {
                active: 3,
                total: 3
              }
            },
            sort: '00001224'
          }
        },
        {
          tokenId: 'a3a124bf5a6c37fe8d293b45bf32a16e412d06c376d0a042078279564c07ac2e',
          token: {
            id: '10',
            symbol: 'TD10',
            symbolKey: 'TD10',
            name: 'Decentralized TD10',
            decimal: 8,
            limit: '0',
            mintable: true,
            tradeable: true,
            isDAT: true,
            isLPS: false,
            finalized: false,
            minted: '0.0001027',
            creation: {
              tx: 'a3a124bf5a6c37fe8d293b45bf32a16e412d06c376d0a042078279564c07ac2e',
              height: 128
            },
            destruction: {
              tx: '0000000000000000000000000000000000000000000000000000000000000000',
              height: -1
            },
            collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
            displaySymbol: 'dTD10'
          },
          interest: '1.5',
          fixedIntervalPriceId: 'TD10/USD',
          activePrice: {
            id: 'TD10-USD-4644',
            key: 'TD10-USD',
            isLive: true,
            block: {
              hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
              height: 4644,
              medianTime: 1640314816,
              time: 1640314822
            },
            active: {
              amount: '798028250.32269574',
              weightage: 3,
              oracles: {
                active: 3,
                total: 3
              }
            },
            next: {
              amount: '797788865.78764842',
              weightage: 3,
              oracles: {
                active: 3,
                total: 3
              }
            },
            sort: '00001224'
          }
        },
        {
          tokenId: 'b99d32217b8fbe8872015c1a376f745a94372f061a0fb88c9b212876e4f158f5',
          token: {
            id: '14',
            symbol: 'DUSD',
            symbolKey: 'DUSD',
            name: 'Decentralized USD',
            decimal: 8,
            limit: '0',
            mintable: true,
            tradeable: true,
            isDAT: true,
            isLPS: false,
            finalized: false,
            minted: '20540',
            creation: {
              tx: 'b99d32217b8fbe8872015c1a376f745a94372f061a0fb88c9b212876e4f158f5',
              height: 128
            },
            destruction: {
              tx: '0000000000000000000000000000000000000000000000000000000000000000',
              height: -1
            },
            collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
            displaySymbol: 'DUSD'
          },
          interest: '0',
          fixedIntervalPriceId: 'DUSD/USD'
        },
        {
          tokenId: 'ffbaea57f155a36700c65a018aafe5e7d9984416339fb623df887f1a82b12142',
          token: {
            id: '11',
            symbol: 'TR50',
            symbolKey: 'TR50',
            name: 'Decentralized TR50',
            decimal: 8,
            limit: '0',
            mintable: true,
            tradeable: true,
            isDAT: true,
            isLPS: false,
            finalized: false,
            minted: '10.27',
            creation: {
              tx: 'ffbaea57f155a36700c65a018aafe5e7d9984416339fb623df887f1a82b12142',
              height: 128
            },
            destruction: {
              tx: '0000000000000000000000000000000000000000000000000000000000000000',
              height: -1
            },
            collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
            displaySymbol: 'dTR50'
          },
          interest: '3',
          fixedIntervalPriceId: 'TR50/USD',
          activePrice: {
            id: 'TR50-USD-4644',
            key: 'TR50-USD',
            isLive: false,
            block: {
              hash: '7dcc823ed57d93ad386138e4bf17e68a0be636cdd667d6b82d602ad61bc9485e',
              height: 4644,
              medianTime: 1640314816,
              time: 1640314822
            },
            active: {
              amount: '1.30875799',
              weightage: 3,
              oracles: {
                active: 3,
                total: 3
              }
            },
            next: {
              amount: '0.78137694',
              weightage: 3,
              oracles: {
                active: 3,
                total: 3
              }
            },
            sort: '00001224'
          }
        }
      ]
    }
    const actual = loanTokenByTokenId(state, '14')
    expect(actual).toStrictEqual({
      tokenId: 'b99d32217b8fbe8872015c1a376f745a94372f061a0fb88c9b212876e4f158f5',
      token: {
        id: '14',
        symbol: 'DUSD',
        symbolKey: 'DUSD',
        name: 'Decentralized USD',
        decimal: 8,
        limit: '0',
        mintable: true,
        tradeable: true,
        isDAT: true,
        isLPS: false,
        finalized: false,
        minted: '20540',
        creation: {
          tx: 'b99d32217b8fbe8872015c1a376f745a94372f061a0fb88c9b212876e4f158f5',
          height: 128
        },
        destruction: {
          tx: '0000000000000000000000000000000000000000000000000000000000000000',
          height: -1
        },
        collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
        displaySymbol: 'DUSD'
      },
      interest: '0',
      fixedIntervalPriceId: 'DUSD/USD',
      activePrice: customDUSDActivePrice
    })
  })

  it('should be able to select vaults that returns DUSD loan and interest with active price', () => {
    const state = {
      ...initialState,
      vaults: [vault]
    }
    const actual = vaultsSelector(state)
    expect(actual).toStrictEqual([{
      ...vault,
      loanAmounts: [
        {
          id: '14',
          amount: '1.00000570',
          symbol: 'DUSD',
          symbolKey: 'DUSD',
          name: 'Decentralized USD',
          displaySymbol: 'DUSD',
          activePrice: customDUSDActivePrice
        }
      ],
      interestAmounts: [
        {
          id: '14',
          amount: '0.00000570',
          symbol: 'DUSD',
          symbolKey: 'DUSD',
          name: 'Decentralized USD',
          displaySymbol: 'DUSD',
          activePrice: customDUSDActivePrice
        }
      ]
    }])
  })
})
