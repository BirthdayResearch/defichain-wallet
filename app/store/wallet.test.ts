import { tokensSelector, wallet, WalletState, WalletStatus, WalletToken, } from './wallet';

describe('wallet reducer', () => {
  let initialState: WalletState;
  let tokenDFI: WalletToken;
  let utxoDFI: WalletToken;

  beforeEach(() => {
    initialState = {
      status: WalletStatus.INITIAL,
      tokens: [],
      utxoBalance: '0',
      address: ''
    };
    tokenDFI = {
      id: '0',
      amount: '100000',
      isDAT: true,
      isLPS: false,
      name: 'Defichain',
      symbol: 'DFI',
      symbolKey: 'DFI',
      avatarSymbol: 'DFI',
      displaySymbol: 'DFI (Token)'
    };
    utxoDFI = {
      ...tokenDFI,
      amount: '0',
      id: '0_utxo',
      avatarSymbol: '_UTXO',
      displaySymbol: 'DFI (UTXO)'
    }
  })

  it('should handle initial state', () => {
    expect(wallet.reducer(undefined, { type: 'unknown' })).toEqual({
      status: WalletStatus.INITIAL,
      utxoBalance: '0',
      tokens: [],
      address: ''
    });
  });

  it('should handle setStatus', () => {
    const actual = wallet.reducer(initialState, wallet.actions.setStatus(WalletStatus.LOADED_WALLET));
    expect(actual.status).toStrictEqual(WalletStatus.LOADED_WALLET);
  });

  it('should handle setTokens', () => {
    const tokens: WalletToken[] = [tokenDFI, utxoDFI]
    const actual = wallet.reducer(initialState, wallet.actions.setTokens(tokens));
    expect(actual.tokens).toStrictEqual(tokens)
  });

  it('should handle setUtxoBalance', () => {
    const utxoAmount = '77'
    const actual = wallet.reducer(initialState, wallet.actions.setUtxoBalance(utxoAmount));
    expect(actual.utxoBalance).toStrictEqual(utxoAmount)
  });

  it('should handle setAddress', () => {
    const address = 'bcrt1q6np0fh47ykhznjhrtfvduh73cgjg32yac8t07d'
    const actual = wallet.reducer(initialState, wallet.actions.setAddress(address));
    expect(actual.address).toStrictEqual(address)
  });

  it('should able to select tokens with default DFIs', () => {
    const actual = tokensSelector({ ...initialState, utxoBalance: '77' })
    expect(actual).toStrictEqual([{ ...utxoDFI, amount: '77' }, { ...tokenDFI, amount: '0' }])
  });

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
      avatarSymbol: 'BTC'
    };
    const state = {
      ...initialState,
      utxoBalance: '77',
      tokens: [{ ...utxoDFI }, { ...tokenDFI }, { ...btc }]
    }
    const actual = tokensSelector(state)
    expect(actual).toStrictEqual([{ ...utxoDFI, amount: '77' }, { ...tokenDFI }, { ...btc }])
  });
})
