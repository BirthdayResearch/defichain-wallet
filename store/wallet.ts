import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'

export enum WalletStatus {
  INITIAL,
  LOADING,
  NO_WALLET,
  LOADED_WALLET,
  ERROR
}

export interface WalletState {
  status: WalletStatus
  utxoBalance: string
  tokens: AddressToken[]
}

const initialState: WalletState = {
  status: WalletStatus.INITIAL,
  utxoBalance: '0',
  tokens: []
}

const initialDFI: AddressToken = {
  id: '0',
  symbol: 'DFI',
  symbolKey: 'DFI',
  isDAT: true,
  isLPS: false,
  amount: '0',
  name: 'Defi'
}

export const wallet = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<WalletStatus>) => {
      state.status = action.payload
    },
    setTokens: (state, action: PayloadAction<AddressToken[]>) => {
      state.tokens = action.payload
    },
    setUtxoBalance: (state, action: PayloadAction<string>) => {
      state.utxoBalance = action.payload
    }
  }
})

export const { setStatus, setTokens, setUtxoBalance } = wallet.actions

const rawTokensSelector = createSelector((state: WalletState) => state.tokens, (tokens) => {
  if (tokens.some((t) => t.id === '0')) {
    return tokens
  } else {
    return [initialDFI, ...tokens]
  }
})
//* Use as token selector to include UTXO balance
export const tokensSelector = createSelector([rawTokensSelector, (state: WalletState) => state.utxoBalance], (tokens, utxoBalance) => tokens.map((t) => {
  if (t.id === '0') {
    return { ...t, amount: new BigNumber(t.amount).plus(utxoBalance).toFixed() }
  }
  return t
}))
