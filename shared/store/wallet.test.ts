import { TokenData } from '@defichain/whale-api-client/dist/api/tokens'
import { DexItem, fetchPoolPairs, fetchTokens, tokensSelector, wallet, WalletState, WalletToken } from './wallet'

describe('wallet reducer', () => {
  let initialState: WalletState
  let tokenDFI: WalletToken
  let utxoDFI: WalletToken
  let unifiedDFI: WalletToken
  let detailedDFI: TokenData

  const dfi = {
    id: '0',
    isDAT: true,
    isLPS: false,
    isLoanToken: false,
    name: 'DeFiChain',
    symbol: 'DFI',
    symbolKey: 'DFI',
    displaySymbol: 'DFI (Token)',
    avatarSymbol: 'DFI (Token)'
  }

  beforeEach(() => {
    initialState = {
      tokens: [],
      allTokens: {},
      utxoBalance: '0',
      poolpairs: [],
      hasFetchedPoolpairData: false,
      hasFetchedToken: true
    }
    tokenDFI = {
      ...dfi,
      amount: '100000'
    }
    utxoDFI = {
      ...tokenDFI,
      amount: '0',
      id: '0_utxo',
      displaySymbol: 'DFI (UTXO)',
      avatarSymbol: 'DFI (UTXO)'
    }
    unifiedDFI = {
      ...tokenDFI,
      amount: '0',
      id: '0_unified',
      displaySymbol: 'DFI',
      avatarSymbol: 'DFI'
    }
    detailedDFI = {
      ...dfi,
      creation: {
        tx: '0000000000000000000000000000000000000000000000000000000000000000',
        height: 0
      },
      decimal: 8,
      destruction: {
        tx: '0000000000000000000000000000000000000000000000000000000000000000', height: -1
      },
      finalized: true,
      limit: '0',
      mintable: false,
      minted: '0',
      tradeable: true
    }
  })

  it('should handle initial state', () => {
    expect(wallet.reducer(undefined, { type: 'unknown' })).toEqual({
      utxoBalance: '0',
      tokens: [],
      allTokens: {},
      poolpairs: [],
      hasFetchedPoolpairData: false,
      hasFetchedToken: false
    })
  })

  it('should handle setTokens and setUtxoBalance', () => {
    const tokens: WalletToken[] = [tokenDFI, utxoDFI]
    const allTokens = {
      'DFI (Token)': detailedDFI
    }

    const utxoBalance = '77'
    const action = { type: fetchTokens.fulfilled.type, payload: { tokens, utxoBalance, allTokens: [detailedDFI] } }
    const actual = wallet.reducer(initialState, action)
    expect(actual.tokens).toStrictEqual(tokens)
    expect(actual.utxoBalance).toStrictEqual('77')
    expect(actual.allTokens).toStrictEqual(allTokens)
  })

  it('should handle setPoolpairs', () => {
    const payload: DexItem[] = [{
      type: 'available',
      data: {
        id: '8',
        symbol: 'DFI-USDT',
        name: 'Default Defi token-Playground USDT',
        status: true,
        displaySymbol: 'dUSDT-DFI',
        tokenA: {
          id: '0',
          reserve: '1000',
          blockCommission: '0',
          symbol: 'DFI',
          displaySymbol: 'dDFI'
        },
        tokenB: {
          id: '3',
          reserve: '10000000',
          blockCommission: '0',
          symbol: 'USDT',
          displaySymbol: 'dUSDT'
        },
        priceRatio: {
          ab: '0.0001',
          ba: '10000'
        },
        commission: '0',
        totalLiquidity: {
          token: '100000',
          usd: '20000000'
        },
        tradeEnabled: true,
        ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
        rewardPct: '0.2',
        creation: {
          tx: 'f691c8b0a5d362a013a7207228e618d832c0b99af8da99c847923f5f93136d60',
          height: 119
        },
        apr: {
          reward: 133.7652,
          total: 133.7652,
          commission: 0
        }
      }
    }]

    const action = { type: fetchPoolPairs.fulfilled.type, payload }
    const actual = wallet.reducer(initialState, action)
    expect(actual.poolpairs).toStrictEqual(payload)
  })

  it('should able to select tokens with default DFIs', () => {
    const actual = tokensSelector({
      ...initialState,
      utxoBalance: '77'
    })
    expect(actual).toStrictEqual([{
      ...utxoDFI,
      amount: '77.00000000'
    }, {
      ...tokenDFI,
      amount: '0'
    }, {
      ...unifiedDFI,
      amount: '77.00000000'
    }])
  })

  it('should able to select tokens with existing DFI Token', () => {
    const btc = {
      id: '1',
      isLPS: false,
      name: 'Bitcoin',
      isDAT: true,
      symbol: 'BTC',
      symbolKey: 'BTC',
      amount: '1',
      displaySymbol: 'BTC',
      avatarSymbol: 'BTC',
      isLoanToken: false
    }
    const state = {
      ...initialState,
      utxoBalance: '77.00000000',
      tokens: [{ ...utxoDFI }, { ...tokenDFI }, { ...unifiedDFI }, { ...btc }]
    }
    const actual = tokensSelector(state)
    expect(actual).toStrictEqual([
      {
        ...utxoDFI,
        amount: '77.00000000'
      },
      { ...tokenDFI },
      {
        ...unifiedDFI,
        amount: '100077.00000000'
      },
      { ...btc }])
  })
})
