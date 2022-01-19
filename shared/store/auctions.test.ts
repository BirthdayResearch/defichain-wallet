import { LoanVaultLiquidated, LoanVaultLiquidationBatch, LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { auctions, auctionsSearchByTermSelector, AuctionsState, fetchAuctions } from './auctions'

describe('auctions reducer', () => {
  let initialState: AuctionsState
  const loanBatchFoo: LoanVaultLiquidationBatch = {
    index: 1,
    collaterals: [
      {
        id: '0',
        amount: '0.16199027',
        symbol: 'DFI',
        symbolKey: 'DFI',
        name: 'Default Defi token',
        displaySymbol: 'DFI',
        activePrice: {
          id: 'DFI-USD-1776',
          key: 'DFI-USD',
          isLive: true,
          block: {
            hash: '478bf1d2322aaa010bb1b4575491a6b3594ec294cd9cb2e406a82e56c3315062',
            height: 1776,
            medianTime: 1641219432,
            time: 1641219438
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
          sort: '000006f0'
        }
      }
    ],
    loan: {
      id: '14',
      amount: '1.00043890',
      symbol: 'TU10',
      symbolKey: 'TU10',
      name: 'Decentralized TU10',
      displaySymbol: 'dTU10',
      activePrice: {
        id: 'TU10-USD-1776',
        key: 'TU10-USD',
        isLive: true,
        block: {
          hash: '478bf1d2322aaa010bb1b4575491a6b3594ec294cd9cb2e406a82e56c3315062',
          height: 1776,
          medianTime: 1641219432,
          time: 1641219438
        },
        active: {
          amount: '10.85668461',
          weightage: 3,
          oracles: {
            active: 3,
            total: 3
          }
        },
        next: {
          amount: '10.85994194',
          weightage: 3,
          oracles: {
            active: 3,
            total: 3
          }
        },
        sort: '000006f0'
      }
    }
  }
  const loanBatchBar: LoanVaultLiquidationBatch = {
    index: 0,
    collaterals: [
      {
        id: '0',
        amount: '0.83800973',
        symbol: 'DFI',
        symbolKey: 'DFI',
        name: 'Default Defi token',
        displaySymbol: 'DFI',
        activePrice: {
          id: 'DFI-USD-1776',
          key: 'DFI-USD',
          isLive: true,
          block: {
            hash: '478bf1d2322aaa010bb1b4575491a6b3594ec294cd9cb2e406a82e56c3315062',
            height: 1776,
            medianTime: 1641219432,
            time: 1641219438
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
          sort: '000006f0'
        }
      }
    ],
    loan: {
      id: '11',
      amount: '56.13801760',
      symbol: 'DUSD',
      symbolKey: 'DUSD',
      name: 'Decentralized USD',
      displaySymbol: 'DUSD'
    }
  }
  const liquidatedVaults: LoanVaultLiquidated[] = [
    {
      vaultId: '0336a6e1bfeef859815f3e6c63595c6c0bc0db43d548df59237446ae041d3e00',
      loanScheme: {
        id: 'MIN150',
        minColRatio: '150',
        interestRate: '5'
      },
      ownerAddress: 'bcrt1q39r84tmh4xp7wmg32tnza8j544lynknvy8q2nr',
      state: LoanVaultState.IN_LIQUIDATION,
      batchCount: 1,
      liquidationHeight: 1800,
      liquidationPenalty: 5,
      batches: [loanBatchFoo]
    },
    {
      vaultId: '3f736e4ea13b91ac7dd3633e30a04553570428ad3d1ea8e39ba3162c24ab0b14',
      loanScheme: {
        id: 'MIN150',
        minColRatio: '150',
        interestRate: '5'
      },
      ownerAddress: 'bcrt1q39r84tmh4xp7wmg32tnza8j544lynknvy8q2nr',
      state: LoanVaultState.IN_LIQUIDATION,
      batchCount: 2,
      liquidationHeight: 1799,
      liquidationPenalty: 5,
      batches: [loanBatchFoo, loanBatchBar]
    }
  ]

  beforeEach(() => {
    initialState = {
      auctions: [],
      hasFetchAuctionsData: false
    }
  })

  it('should handle initial state', () => {
    expect(auctions.reducer(undefined, { type: 'unknown' })).toEqual({
      auctions: [],
      hasFetchAuctionsData: false
    })
  })

  it('should handle fetch auctions and set has fetched auction flag', () => {
    const action = { type: fetchAuctions.fulfilled, payload: liquidatedVaults }
    const actual = auctions.reducer(initialState, action)
    expect(actual.auctions).toStrictEqual(liquidatedVaults)
    expect(actual.hasFetchAuctionsData).toStrictEqual(true)
  })

  it('should be able to search auction by loan display symbol', () => {
    const state = {
      ...initialState,
      auctions: liquidatedVaults
    }
    const actual = auctionsSearchByTermSelector(state, 'dTU10')
    expect(actual).toStrictEqual([
      {
        ...loanBatchFoo,
        auction: liquidatedVaults[1]
      },
      {
        ...loanBatchFoo,
        auction: liquidatedVaults[0]
      }
    ])
  })

  it('should be able to return all loan batches if no search term matches any loan display symbol', () => {
    const state = {
      ...initialState,
      auctions: liquidatedVaults
    }
    const actual = auctionsSearchByTermSelector(state, '')
    expect(actual).toStrictEqual([
      {
        ...loanBatchFoo,
        auction: liquidatedVaults[1]
      },
      {
        ...loanBatchBar,
        auction: liquidatedVaults[1]
      },
      {
        ...loanBatchFoo,
        auction: liquidatedVaults[0]
      }
    ])
  })
})
