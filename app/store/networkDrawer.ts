import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface NetworkDrawerState {
  isLoading: boolean
  isOpen: boolean
  height: number
  title: string
  txid?: string
}

const initialState: NetworkDrawerState = {
  isLoading: false,
  isOpen: false,
  height: 49,
  title: 'Loading...'
}

export const networkDrawer = createSlice({
  name: 'networkDrawer',
  initialState,
  reducers: {
    openNetworkDrawer: (state, action: PayloadAction<Partial<NetworkDrawerState>>) => {
      state.isOpen = action.payload.isOpen ?? state.isOpen
      state.isLoading = action.payload.isLoading ?? state.isLoading
      state.height = action.payload.height ?? state.height
      state.title = action.payload.title ?? 'Loading...'
      state.txid = action.payload.txid
    }
  }
})
