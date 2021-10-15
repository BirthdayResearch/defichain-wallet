import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'

export interface WalletState {
  utxoBalance: string
  tokens: WalletToken[]
  poolpairs: DexItem[]
}

export interface WalletToken extends AddressToken {
  avatarSymbol: string
}

export interface DexItem {
  type: 'your' | 'available'
  data: PoolPairData
}

const initialState: WalletState = {
  utxoBalance: '0',
  tokens: [],
  poolpairs: []
}

const tokenDFI: WalletToken = {
  id: '0',
  symbol: 'DFI',
  symbolKey: 'DFI',
  isDAT: true,
  isLPS: false,

  amount: '0',
  name: 'DeFiChain',
  displaySymbol: 'DFI (Token)',
  avatarSymbol: 'DFI (Token)'
}

const utxoDFI: WalletToken = {
  ...tokenDFI,
  id: '0_utxo',
  displaySymbol: 'DFI (UTXO)',
  avatarSymbol: 'DFI (UTXO)'
}

const setTokenDetails = (t: AddressToken): WalletToken => {
  let displaySymbol = t.displaySymbol
  let avatarSymbol = t.displaySymbol
  if (t.id === '0') {
    t.name = 'DeFiChain'
    displaySymbol = 'DFI (Token)'
  }
  if (t.id === '0_utxo') {
    displaySymbol = 'DFI (UTXO)'
  }
  if (t.isLPS) {
    const [tokenA, tokenB] = t.symbol?.split('-')
    t.name = t.name.replace('Default Defi token', 'DeFiChain')
    displaySymbol = tokenA === 'DFI' ? `${tokenA}-d${tokenB}` : `d${tokenA}-${tokenB}`
    avatarSymbol = t.symbol
  }
  return {
    ...t,
    displaySymbol,
    avatarSymbol
  }
}

export const wallet = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<AddressToken[]>) => {
      state.tokens = action.payload.map(setTokenDetails)
    },
    setUtxoBalance: (state, action: PayloadAction<string>) => {
      state.utxoBalance = action.payload
    },
    setPoolPairs: (state, action: PayloadAction<DexItem[]>) => {
      state.poolpairs = action.payload
    }
  }
})

const rawTokensSelector = createSelector((state: WalletState) => state.tokens, (tokens) => {
  const rawTokens = []
  if (!tokens.some((t) => t.id === '0_utxo')) {
    rawTokens.push(utxoDFI)
  }
  if (!tokens.some((t) => t.id === '0')) {
    rawTokens.push(tokenDFI)
  }
  return [...rawTokens, ...tokens]
})

export const tokensSelector = createSelector([rawTokensSelector, (state: WalletState) => state.utxoBalance], (tokens, utxoBalance) => tokens.map((t) => {
  if (t.id === '0_utxo') {
    return { ...t, amount: new BigNumber(utxoBalance).toFixed(8) }
  }
  return t
}))

export const DFITokenSelector = createSelector(tokensSelector, tokens => {
  return tokens.find(token => token.id === '0') ?? tokenDFI
})

export const DFIUtxoSelector = createSelector(tokensSelector, tokens => {
  return tokens.find(token => token.id === '0_utxo') ?? utxoDFI
})
