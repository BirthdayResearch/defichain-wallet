import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface BlockState {
  count?: number
  connected: boolean
  isPolling: boolean
}

const initialState: BlockState = {
  count: undefined,
  connected: false,
  isPolling: false
}

export const block = createSlice({
  name: 'block',
  initialState,
  reducers: {
    updateBlock: (state, action: PayloadAction<{ count: number }>) => {
      state.count = action.payload.count
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload
    },
    setPolling: (state, action: PayloadAction<boolean>) => {
      state.isPolling = action.payload
    }
  }
})
