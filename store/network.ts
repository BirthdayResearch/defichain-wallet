import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

export type NetworkName = 'mainnet' | 'testnet' | 'regtest' | 'playground'

export interface PlaygroundApiState {
  url: string
  environment: 'localhost' | 'remote'
}

export interface WhaleApiState {
  url: string
  network: NetworkName
}

interface NetworkState {
  name?: NetworkName
  whale?: WhaleApiState
  playground?: PlaygroundApiState
}

const initialState: NetworkState = {}

export const network = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setWhale: (state, action: PayloadAction<WhaleApiState>) => {
      state.whale = action.payload
      state.name = action.payload.network
    },
    setPlayground: (state, action: PayloadAction<PlaygroundApiState>) => {
      state.playground = action.payload
    }
  }
})

export const refreshIntervalSelector = createSelector((network: NetworkState) => network.name, (name: NetworkName | undefined) => {
  switch (name) {
    case 'playground':
    case 'regtest':
    default:
      return 3000
    case 'testnet':
      return 15000
    case 'mainnet':
      return 30000
  }
})
