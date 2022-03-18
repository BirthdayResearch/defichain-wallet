import { WhaleApiClient } from '@defichain/whale-api-client'
import { AllSwappableTokensResult } from '@defichain/whale-api-client/dist/api/poolpairs'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface SwappableTokens {
    [key: string]: AllSwappableTokensResult
}

export interface PoolPairState {
    swappableTokens: SwappableTokens
    hasFetchedSwappableTokens: boolean
}

const initialState: PoolPairState = {
    swappableTokens: {},
    hasFetchedSwappableTokens: false
}

export const fetchSwappableTokens = createAsyncThunk(
    'wallet/swappableTokens',
    async ({ client, fromTokenId }: {
        client: WhaleApiClient
        fromTokenId: string
    }): Promise<AllSwappableTokensResult> => {
        return await client.poolpairs.getSwappableTokens(fromTokenId)
    }
)

export const poolpairs = createSlice({
    name: 'poolpairs',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchSwappableTokens.fulfilled, (state, action: PayloadAction<AllSwappableTokensResult>) => {
            state.hasFetchedSwappableTokens = true
            state.swappableTokens = {
                ...state.swappableTokens,
                ...{
                    [action.payload.fromToken.id]: action.payload
                }
            }
        })
    }
})
