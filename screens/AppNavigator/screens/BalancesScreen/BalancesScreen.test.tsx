import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react-native"
import * as React from 'react'
import { Provider } from "react-redux";
import { RootState } from "../../../../store";
import { network } from "../../../../store/network";
import { wallet, WalletStatus } from "../../../../store/wallet";
import { BalancesScreen } from "./BalancesScreen";

jest.mock("../../../../hooks/wallet/TokensAPI", () => ({
  useTokensAPI: () => [{
    id: '0',
    symbol: 'DFI',
    symbolKey: 'DFI',
    isDAT: true,
    isLPS: false,
    amount: '23',
    name: 'Defi'
  }, {
    id: '1',
    symbol: 'BTC',
    symbolKey: 'BTC',
    isDAT: true,
    isLPS: false,
    amount: '777',
    name: 'Bitcoin'
  },
    {
      id: '2',
      symbol: 'ETH',
      symbolKey: 'ETH',
      isDAT: true,
      isLPS: false,
      amount: '555',
      name: 'Ethereum'
    }]
}));

describe('balances page', () => {
  it('display tokens list', () => {
    const initialState: Partial<RootState> = {
      wallet: {
        address: 'bcrt1q6np0fh47ykhznjhrtfvduh73cgjg32yac8t07d',
        status: WalletStatus.LOADED_WALLET,
        utxoBalance: '77',
        tokens: []
      },
      network: {
        name: 'playground',
        whale: {
          network: 'playground',
          url: 'http://0.0.0.0'
        }
      }
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: { wallet: wallet.reducer, network: network.reducer }
    })
    const component = (
      <Provider store={store}>
        <BalancesScreen />
      </Provider>
    );
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})

