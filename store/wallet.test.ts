import { AddressToken } from "@defichain/whale-api-client/dist/api/address";
import {
  tokensSelector,
  WalletState,
  WalletStatus,
  wallet
} from './wallet';

describe('wallet reducer', () => {
  let initialState: WalletState;
  let initialDFI: AddressToken;

  beforeEach(() => {
    initialState = {
      status: WalletStatus.INITIAL,
      tokens: [],
      utxoBalance: '0',
      address: ''
    };
    initialDFI = {
      id: '0',
      amount: '100000',
      isDAT: true,
      isLPS: false,
      name: 'Defi',
      symbol: 'DFI',
      symbolKey: 'DFI'
    };
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
    const tokens: AddressToken[] = [initialDFI]
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

  it('should able to select tokens with DFI added', () => {
    const actual = tokensSelector({ ...initialState, utxoBalance: '77' })
    expect(actual).toStrictEqual([{ ...initialDFI, amount: '77' }])
  });

  it('should able to select tokens with existing DFI Token', () => {
    const btc = {
      id: '1',
      isLPS: false,
      name: 'Bitcoin',
      isDAT: true,
      symbol: 'BTC',
      symbolKey: 'BTC',
      amount: '1'
    };
    const state = {
      ...initialState,
      utxoBalance: '77',
      tokens: [{ ...initialDFI }, { ...btc }]
    }
    const actual = tokensSelector(state)
    expect(actual).toStrictEqual([{ ...initialDFI, amount: '100077' }, { ...btc }])
  });
})
