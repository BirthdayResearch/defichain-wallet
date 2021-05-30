import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export enum WalletStatus {
  NONE,
  LOADING,
  LOADED,
}

interface WalletState {
  status: WalletStatus
  // balances: string
  // accounts: []
}

const initialState: WalletState = {
  status: WalletStatus.NONE
}

export const wallet = createSlice({
  name: 'wallet',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadWallet.pending, (state) => {
        state.status = WalletStatus.LOADING
      })
      .addCase(loadWallet.fulfilled, (state, action) => {
        state.status = WalletStatus.LOADED
      })
  }
})

export const loadWallet = createAsyncThunk(
  'wallet/loadWallet',
  async () => {

  }
)
