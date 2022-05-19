import { FutureData, GetFutureInfo } from '@defichain/jellyfish-api-core/dist/category/account'
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@store'
import { selectLoansState } from './loans'
import { WhaleRpcClient } from '@defichain/whale-api-client'
import BigNumber from 'bignumber.js'

export interface FutureSwapData {
  source: {
    amount: string
    displaySymbol: string
    isLoanToken: boolean
    symbol: string
    tokenId: string
  }
  destination: {
    displaySymbol: string
    isLoanToken: boolean
    symbol: string
    tokenId: string
  }
}

export interface FutureSwapState {
  futureSwaps: FutureData[]
  executionBlock: number
}

const initialState: FutureSwapState = {
  futureSwaps: [],
  executionBlock: 0
}

export const fetchFutureSwaps = createAsyncThunk(
  'wallet/fetchFutureSwaps',
  async ({ client, address }: { client: WhaleRpcClient, address: string }) => {
    return await client.account.getPendingFutureSwaps(address)
  }
)

export const fetchExecutionBlock = createAsyncThunk(
  'wallet/fetchNextFutureSwapBlock',
  async ({ client }: { client: WhaleRpcClient }) => {
    return await client.oracle.getFutureSwapBlock()
  }
)

export const futureSwaps = createSlice({
  name: 'futureSwaps',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchFutureSwaps.fulfilled, (state, action: PayloadAction<GetFutureInfo>) => {
      state.futureSwaps = action.payload.values
    })
    builder.addCase(fetchExecutionBlock.fulfilled, (state, action: PayloadAction<number>) => {
      state.executionBlock = action.payload
    })
  }
})

export const selectFutureSwapState = (state: RootState): FutureSwapState => state.futureSwaps

export const hasFutureSwap = createSelector((state: FutureSwapState) => state.futureSwaps, (swap): boolean => {
  return swap.length > 0
})

export const FutureSwapSelector = createSelector([selectFutureSwapState, selectLoansState], (futureSwaps, loans): FutureSwapData[] => {
  return Object.values(futureSwaps.futureSwaps.reduce((swaps: { [key: string]: FutureSwapData }, swap) => {
    const [sourceAmount, sourceSymbol] = swap.source.split('@') // ['123', 'DUSD']
    const destinationSymbol = swap.destination
    const sourceLoanToken = loans.loanTokens.find(token => token.token.symbol === sourceSymbol)
    const destinationLoanToken = loans.loanTokens.find(token => token.token.symbol === destinationSymbol)
    const key = `${sourceSymbol}-${destinationSymbol}`
    swaps[key] = {
      source: {
        amount: swaps[key] === undefined
          ? new BigNumber(sourceAmount).toFixed(8)
          : BigNumber.max(new BigNumber(swaps[key].source.amount), 0).plus(sourceAmount).toFixed(8),
        displaySymbol: sourceLoanToken?.token.displaySymbol ?? '',
        isLoanToken: sourceLoanToken?.token.displaySymbol !== 'DUSD',
        symbol: sourceLoanToken?.token.symbol ?? '',
        tokenId: sourceLoanToken?.token.id ?? ''
      },
      destination: {
        displaySymbol: destinationLoanToken?.token.displaySymbol ?? '',
        isLoanToken: destinationLoanToken?.token.displaySymbol !== 'DUSD',
        symbol: destinationLoanToken?.token.symbol ?? '',
        tokenId: destinationLoanToken?.token.id ?? ''
      }
    }

    return swaps
  }, {}))
})
