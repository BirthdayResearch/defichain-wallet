import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface BlockState {
  count?: number
  masternodeCount?: number
  lastSync?: string
  connected: boolean
  isPolling: boolean
  tvl?: number
}

const initialState: BlockState = {
  count: undefined,
  masternodeCount: undefined,
  lastSync: undefined,
  connected: false,
  isPolling: false,
  tvl: undefined
}

export const block = createSlice({
  name: 'block',
  initialState,
  reducers: {
    updateBlockDetails: (state, action: PayloadAction<{ count: number, masternodeCount: number, lastSync?: string, tvl?: number }>) => {
      state.count = action.payload.count
      state.masternodeCount = action.payload.masternodeCount
      if (action.payload.lastSync != null) {
        state.lastSync = action.payload.lastSync
      }
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
