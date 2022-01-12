import { WhaleApiClient } from '@defichain/whale-api-client'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { ActivePrice } from '@defichain/whale-api-client/dist/api/prices'
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'

export interface WalletState {
  utxoBalance: string
  tokens: WalletToken[]
  poolpairs: DexItem[]
  hasFetchedPoolpairData: boolean
}

export interface WalletToken extends AddressToken {
  avatarSymbol: string
  activePrice?: ActivePrice
}

export interface DexItem {
  type: 'your' | 'available'
  data: PoolPairData
}

const initialState: WalletState = {
  utxoBalance: '0',
  tokens: [],
  poolpairs: [],
  hasFetchedPoolpairData: false
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

const unifiedDFI: WalletToken = {
  ...tokenDFI,
  id: '0_unified',
  displaySymbol: 'DFI',
  avatarSymbol: 'DFI'
}

export const setTokenSymbol = (t: AddressToken): WalletToken => {
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
    t.name = t.name.replace('Default Defi token', 'DeFiChain')
    avatarSymbol = t.symbol
  }
  return {
    ...t,
    displaySymbol,
    avatarSymbol
  }
}

export const fetchPoolPairs = createAsyncThunk(
  'wallet/fetchPoolPairs',
  async ({ size = 200, client }: { size?: number, client: WhaleApiClient }): Promise<DexItem[]> => {
    const pairs = await client.poolpairs.list(size)
    return pairs.map(data => ({ type: 'available', data }))
  }
)

export const fetchTokens = createAsyncThunk(
  'wallet/fetchTokens',
  async ({ size = 200, address, client }: { size?: number, address: string, client: WhaleApiClient }): Promise<{ tokens: WalletToken[], utxoBalance: string }> => {
    const tokens = await client.address.listToken(address, size)
    if (!tokens.some((t) => t.id === '0')) {
      tokens.push(tokenDFI)
    }
    const tokensWithPrice: WalletToken[] = await Promise.all(tokens.map(async (token) => {
      const activePrices = await client.prices.getFeedActive(token.symbol, 'USD', 1)
      const detailToken = setTokenSymbol(token)
      return { ...detailToken, activePrice: activePrices[0] }
    }))
    const utxoBalance = await client.address.getBalance(address)
    return { tokens: tokensWithPrice, utxoBalance }
  }
)

export const wallet = createSlice({
  name: 'wallet',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPoolPairs.fulfilled, (state, action: PayloadAction<DexItem[]>) => {
      state.hasFetchedPoolpairData = true
      state.poolpairs = action.payload
    })
    builder.addCase(fetchTokens.fulfilled, (state, action: PayloadAction<{ tokens: WalletToken[], utxoBalance: string }>) => {
      state.tokens = action.payload.tokens
      state.utxoBalance = action.payload.utxoBalance
    })
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
  if (!tokens.some((t) => t.id === '0_unified')) {
    rawTokens.push(unifiedDFI)
  }
  return [...rawTokens, ...tokens]
})

export const tokensSelector = createSelector([rawTokensSelector, (state: WalletState) => state.utxoBalance], (tokens, utxoBalance) => {
    const utxoAmount = new BigNumber(utxoBalance)
    const dfiToken = (tokens.find(t => t.id === '0') ?? tokenDFI)
    return tokens.map((t) => {
      if (t.id === '0_utxo') {
        return { ...t, amount: utxoAmount.toFixed(8), activePrice: dfiToken?.activePrice }
      } else if (t.id === '0_unified') {
        return { ...t, amount: utxoAmount.plus(dfiToken.amount).toFixed(8), activePrice: dfiToken?.activePrice }
      }
      return t
    })
  }
)

export const DFITokenSelector = createSelector(tokensSelector, tokens => {
  return tokens.find(token => token.id === '0') ?? tokenDFI
})

export const DFIUtxoSelector = createSelector(tokensSelector, tokens => {
  return tokens.find(token => token.id === '0_utxo') ?? utxoDFI
})

export const unifiedDFISelector = createSelector(tokensSelector, tokens => {
  return tokens.find(token => token.id === '0_unified') ?? unifiedDFI
})

const selectTokenId = (state: WalletState, tokenId: string): string => tokenId

/**
 * Get single token by `id` from wallet store.
 * To get DFI Token or DFI UTXO, use `DFITokenSelector` or `DFIUtxoSelector` instead
 */
export const tokenSelector = createSelector([tokensSelector, selectTokenId], (tokens, tokenId) => {
  return tokens.find(token => {
    if (tokenId === '0' || tokenId === '0_utxo') {
      return token.id === '0_unified'
    }
    return token.id === tokenId
  })
})
