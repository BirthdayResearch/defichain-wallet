import { CollateralToken, LoanScheme, LoanToken, LoanVaultLiquidated, LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { VaultStatus } from '@screens/AppNavigator/screens/Loans/VaultStatusTypes'
import { ascColRatioLoanScheme, fetchCollateralTokens, fetchLoanSchemes, fetchLoanTokens, fetchVaults, loans, LoansState, loanTokenByTokenId, loanTokensSelector, LoanVault, vaultsSelector } from './loans'

describe('loans reducer', () => {
  let initialState: LoansState
  const vault: LoanVault = {
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
        displaySymbol: 'DFI'
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
      },
      {
        id: '13',
        amount: '0.00000001',
        symbol: 'TD10',
        symbolKey: 'TD10',
        name: 'Decentralized TD10',
        displaySymbol: 'dTD10'
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
      },
      {
        id: '13',
        amount: '0.00000000',
        symbol: 'TD10',
        symbolKey: 'TD10',
        name: 'Decentralized TD10',
        displaySymbol: 'dTD10'
      }
    ]
  }
  const loanTokens: LoanToken[] = [
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
        displaySymbol: 'dTD10',
        isLoanToken: true
      },
      interest: '1.5',
      fixedIntervalPriceId: 'TD10/USD'
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
        displaySymbol: 'DUSD',
        isLoanToken: true
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
        displaySymbol: 'dTR50',
        isLoanToken: true
      },
      interest: '3',
      fixedIntervalPriceId: 'TR50/USD'
    }
  ]
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
          displaySymbol: 'dCS25',
          isLoanToken: false
        },
        factor: '1',
        activateAfterBlock: 130,
        fixedIntervalPriceId: 'CS25/USD'
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
          displaySymbol: 'dUSDT',
          isLoanToken: false
        },
        factor: '1',
        activateAfterBlock: 129,
        fixedIntervalPriceId: 'USDT/USD'
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
          displaySymbol: 'dCR50',
          isLoanToken: false
        },
        factor: '1',
        activateAfterBlock: 130,
        fixedIntervalPriceId: 'CR50/USD'
      }
    ]
    const action = { type: fetchCollateralTokens.fulfilled, payload: collateralTokens }
    const actual = loans.reducer(initialState, action)
    expect(actual.collateralTokens).toStrictEqual(collateralTokens)
  })

  it('should be able to select loan schemes with ascending collateralization ratio', () => {
    const state = {
      ...initialState,
      loanSchemes
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
          displaySymbol: 'dTD10',
          isLoanToken: true
        },
        interest: '1.5',
        fixedIntervalPriceId: 'TD10/USD'
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
          displaySymbol: 'DUSD',
          isLoanToken: true
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
          displaySymbol: 'dTR50',
          isLoanToken: true
        },
        interest: '3',
        fixedIntervalPriceId: 'TR50/USD'
      }
    ]
    const actual = loanTokensSelector(state)
    expect(actual).toStrictEqual(loanTokensWithDUSDActivePrice)
  })

  it('should be able to select loan token by token ID', () => {
    const state = {
      ...initialState,
      loanTokens
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
        displaySymbol: 'DUSD',
        isLoanToken: true
      },
      interest: '0',
      fixedIntervalPriceId: 'DUSD/USD'
    })
  })

  it('should be able to select vaults regardless of vault state', () => {
    const liquidatedVault: LoanVaultLiquidated & { vaultState: VaultStatus } = {
      vaultId: 'eee84f2cc56bbc51a42eaf302b76d4d1250b58b943829ee82f2fa9a46a9e4319',
      loanScheme: {
        id: 'MIN150',
        minColRatio: '150',
        interestRate: '5'
      },
      ownerAddress: 'bcrt1q39r84tmh4xp7wmg32tnza8j544lynknvy8q2nr',
      state: LoanVaultState.IN_LIQUIDATION,
      vaultState: VaultStatus.Liquidated,
      liquidationHeight: 1,
      liquidationPenalty: 1,
      batchCount: 1,
      batches: []
    }
    const state = {
      ...initialState,
      vaults: [liquidatedVault]
    }
    const actual = vaultsSelector(state)
    expect(actual).toStrictEqual([liquidatedVault])
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
          displaySymbol: 'DUSD'
        },
        {
          id: '13',
          amount: '0.00000001',
          symbol: 'TD10',
          symbolKey: 'TD10',
          name: 'Decentralized TD10',
          displaySymbol: 'dTD10'
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
        },
        {
          id: '13',
          amount: '0.00000000',
          symbol: 'TD10',
          symbolKey: 'TD10',
          name: 'Decentralized TD10',
          displaySymbol: 'dTD10'
        }
      ],
      vaultState: 'HEALTHY'
    }])
  })
})
