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
  }
  destination: {
    amount: string
    displaySymbol: string
    isLoanToken: boolean
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
    // return client.account.getPendingFutureSwaps(address) //TODO: change to WhaleApiClient when whale whitelisted API
    return {
      owner: '',
      values: [
        {
          source: '1.123@DUSD',
          destination: '321.987654@TU10'
        },
        {
          source: '321.987654@TU10',
          destination: '1.123@DUSD'
        },
        {
          source: '1.123@DUSD',
          destination: '321231.987654@TS25'
        }
      ]
    }
  }
)

export const fetchExecutionBlock = createAsyncThunk(
  'wallet/fetchNextFutureSwapBlock',
  async ({ client }: { client: WhaleRpcClient }) => {
    // return client.oracle.getFutureSwapBlock() //TODO: change to WhaleApiClient when whale whitelisted API
    return 188820
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
  return futureSwaps.futureSwaps.map(swap => {
    const [sourceAmount, sourceSymbol] = swap.source.split('@') // ['123', 'DUSD']
    const [destinationAmount, destinationSymbol] = swap.destination.split('@') // ['321', 'TSLA']
    const refToken = 'DUSD'
    const loanTokenDisplaySymbol = loans.loanTokens.find(
      token => token.token.symbol === (sourceSymbol !== refToken ? sourceSymbol : destinationSymbol)
    )?.token.displaySymbol ?? ''
    return {
      source: {
        amount: new BigNumber(sourceAmount).toFixed(8),
        displaySymbol: sourceSymbol !== refToken ? loanTokenDisplaySymbol : refToken,
        isLoanToken: sourceSymbol !== refToken
      },
      destination: {
        amount: new BigNumber(destinationAmount).toFixed(8),
        displaySymbol: destinationSymbol !== refToken ? loanTokenDisplaySymbol : refToken,
        isLoanToken: destinationSymbol !== refToken
      }
    }
  })
})
