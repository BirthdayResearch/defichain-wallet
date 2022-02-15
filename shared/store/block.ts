import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface BlockState {
  count?: number
  masternodeCount?: number
  lastSync?: string
  connected: boolean
  isPolling: boolean
  tvl?: number
  lastSuccessfulSync?: string
}

const initialState: BlockState = {
  count: undefined,
  masternodeCount: undefined,
  lastSync: undefined,
  connected: false,
  isPolling: false,
  tvl: undefined,
  lastSuccessfulSync: undefined
}

export const block = createSlice({
  name: 'block',
  initialState,
  reducers: {
    updateBlockDetails: (state, action: PayloadAction<{ count: number, masternodeCount: number, lastSync?: string, lastSuccessfulSync?: string, tvl?: number }>) => {
      state.count = action.payload.count
      state.masternodeCount = action.payload.masternodeCount
      const firstSuccessfulSync = state.lastSuccessfulSync ?? new Date().toString()
      state.lastSuccessfulSync = action.payload.lastSuccessfulSync != null ? action.payload.lastSuccessfulSync : firstSuccessfulSync
      state.lastSync = action.payload.lastSync // updated even if its not successful (no connection)
      state.tvl = action.payload.tvl
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload
    },
    setPolling: (state, action: PayloadAction<boolean>) => {
      state.isPolling = action.payload
    }
  }
})
