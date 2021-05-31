import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export enum WalletStatus {
  INITIAL,
  LOADING,
  NO_WALLET,
  LOADED_WALLET,
  ERROR
}

interface WalletState {
  status: WalletStatus
}

const initialState: WalletState = {
  status: WalletStatus.INITIAL
}

export const wallet = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<WalletStatus>) => {
      state.status = action.payload
    }
  }
})
