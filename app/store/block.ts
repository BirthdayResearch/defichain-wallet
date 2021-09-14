import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface BlockState {
  count?: number
  masterNodeCount?: number
  lastSync?: string
  connected: boolean
  isPolling: boolean
}

const initialState: BlockState = {
  count: undefined,
  masterNodeCount: undefined,
  lastSync: undefined,
  connected: false,
  isPolling: false
}

export const block = createSlice({
  name: 'block',
  initialState,
  reducers: {
    updateBlockDetails: (state, action: PayloadAction<{ count: number, masterNodeCount: number, lastSync?: string}>) => {
      state.count = action.payload.count
      state.masterNodeCount = action.payload.masterNodeCount
      if (action.payload.lastSync != null) {
        state.lastSync = action.payload.lastSync
      }
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload
    },
    setPolling: (state, action: PayloadAction<boolean>) => {
      state.isPolling = action.payload
    }
  }
})
