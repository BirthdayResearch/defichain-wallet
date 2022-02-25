
import { WhaleApiClient } from '@defichain/whale-api-client'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { TokenData } from '@defichain/whale-api-client/dist/api/tokens'
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'

interface AssociatedToken {
  [key: string]: TokenData
}
export interface WalletState {
  utxoBalance: string
  tokens: WalletToken[]
  allTokens: AssociatedToken
  poolpairs: DexItem[]
  hasFetchedPoolpairData: boolean
  hasFetchedToken: boolean
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
  allTokens: {},
  poolpairs: [],
  hasFetchedPoolpairData: false,
  hasFetchedToken: false
}

const tokenDFI: WalletToken = {
  id: '0',
  symbol: 'DFI',
  symbolKey: 'DFI',
  isDAT: true,
  isLPS: false,
  isLoanToken: false,
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

const associateTokens = (tokens: TokenData[]): AssociatedToken => {
  return tokens.reduce((allToken, token) => ({ ...allToken, [token.displaySymbol]: token }), {})
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
  async ({ size = 200, address, client }: { size?: number, address: string, client: WhaleApiClient }): Promise<{ tokens: AddressToken[], allTokens: TokenData[], utxoBalance: string }> => {
    const tokens = await client.address.listToken(address, size)
    const allTokens = await client.tokens.list(size)
    const utxoBalance = await client.address.getBalance(address)
    return { tokens, utxoBalance, allTokens }
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
    builder.addCase(fetchTokens.fulfilled, (state, action: PayloadAction<{ tokens: AddressToken[], allTokens: TokenData[], utxoBalance: string }>) => {
      state.hasFetchedToken = true
      state.tokens = action.payload.tokens.map(setTokenSymbol)
      state.utxoBalance = action.payload.utxoBalance
      state.allTokens = associateTokens(action.payload.allTokens)
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
    const tokenAmount = new BigNumber((tokens.find(t => t.id === '0') ?? tokenDFI).amount)
    return tokens.map((t) => {
      if (t.id === '0_utxo') {
        return { ...t, amount: utxoAmount.toFixed(8) }
      } else if (t.id === '0_unified') {
        return { ...t, amount: utxoAmount.plus(tokenAmount).toFixed(8) }
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

/**
 * Get single token detail by `displaySymbol` from wallet store.
 */
 export const tokenSelectorByDisplaySymbol = createSelector([(state: WalletState) => state.allTokens, selectTokenId], (allTokens, displaySymbol) => {
  return allTokens[displaySymbol]
})
