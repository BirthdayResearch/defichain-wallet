import { WhaleApiClient } from '@defichain/whale-api-client'
import { LoanVaultLiquidated, LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuctionsState {
  auctions: LoanVaultLiquidated[]
}

const initialState: AuctionsState = {
  auctions: []
}

export const fetchAuctions = createAsyncThunk(
  'wallet/fetchAuctions',
  async ({ size = 50, client }: { size?: number, client: WhaleApiClient }) => {
    const auctions: LoanVaultLiquidated[] = [{
      vaultId: '92dcef48f0109d007f6c02a263fdb9d30e618739a8d749584e0b732c5b968f54',
      loanScheme: {
        id: 'MIN200',
        minColRatio: '200',
        interestRate: '2'
      },
      ownerAddress: '8ZxMPyEeyTDcvmxgWWRDfrq8kwQEm5sbXq',
      state: LoanVaultState.IN_LIQUIDATION,
      batchCount: 2,
      liquidationHeight: 9870,
      liquidationPenalty: 5,
      batches: [
        {
          index: 0,
          collaterals: [
            {
              id: '0',
              amount: '3360.60854727',
              symbol: 'DFI',
              symbolKey: 'DFI',
              name: 'Default Defi token',
              displaySymbol: 'DFI',
              activePrice: {
                id: 'DFI-USD-1386480',
                key: 'DFI-USD',
                isLive: true,
                block: {
                  hash: 'af18460c64945121d96fd126bcc22dd48229ada245b0bc33129364b49168346c',
                  height: 1386480,
                  medianTime: 1637562729,
                  time: 1637562731
                },
                active: {
                  amount: '2.97565149',
                  weightage: 30,
                  oracles: {
                    active: 3,
                    total: 3
                  }
                },
                next: {
                  amount: '2.98680778',
                  weightage: 30,
                  oracles: {
                    active: 3,
                    total: 3
                  }
                },
                sort: '001527f0'
              }
            }
          ],
          loan: {
            id: '15',
            amount: '5015.07942533',
            symbol: 'DUSD',
            symbolKey: 'DUSD',
            name: 'Decentralized USD',
            displaySymbol: 'DUSD'
          }
        },
        {
          index: 1,
          collaterals: [
            {
              id: '0',
              amount: '2341.07877576',
              symbol: 'DFI',
              symbolKey: 'DFI',
              name: 'Default Defi token',
              displaySymbol: 'DFI',
              activePrice: {
                id: 'DFI-USD-1386480',
                key: 'DFI-USD',
                isLive: true,
                block: {
                  hash: 'af18460c64945121d96fd126bcc22dd48229ada245b0bc33129364b49168346c',
                  height: 1386480,
                  medianTime: 1637562729,
                  time: 1637562731
                },
                active: {
                  amount: '2.97565149',
                  weightage: 30,
                  oracles: {
                    active: 3,
                    total: 3
                  }
                },
                next: {
                  amount: '2.98680778',
                  weightage: 30,
                  oracles: {
                    active: 3,
                    total: 3
                  }
                },
                sort: '001527f0'
              }
            }
          ],
          loan: {
            id: '15',
            amount: '3493.62201408',
            symbol: 'DUSD',
            symbolKey: 'DUSD',
            name: 'Decentralized USD',
            displaySymbol: 'DUSD'
          }
        }
      ]
    }]
    return auctions // await client.loan.listAuction(size)
  }
)

export const auctions = createSlice({
  name: 'auctions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAuctions.fulfilled, (state, action: PayloadAction<LoanVaultLiquidated[]>) => {
      state.auctions = action.payload
    })
  }
})
