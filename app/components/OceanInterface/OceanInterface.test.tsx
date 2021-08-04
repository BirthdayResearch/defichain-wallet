import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist';
import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react-native";
import * as React from "react";
import { Provider } from "react-redux";
import { SmartBuffer } from 'smart-buffer';
import { RootState } from "../../store";
import { ocean } from "../../store/ocean";
import { wallet } from "../../store/wallet";
import { OceanInterface } from "./OceanInterface";

jest.mock('../../contexts/WalletContext', () => ({
  useWallet: jest.fn().mockReturnValue({
    get: jest.fn()
  })
}))

jest.mock('../../contexts/DeFiScanContext', () => ({
	useDeFiScan: jest.fn().mockReturnValue({
		getTransactionUrl: jest.fn()
	})
}))

jest.mock("../../contexts/WalletAddressContext", () => ({
  useWalletAddressContext: () => {
    return {
      address: 'bcrt1q6np0fh47ykhznjhrtfvduh73cgjg32yac8t07d'
    }
  }
}));

describe('oceanInterface', () => {
  it('should match snapshot with error', async () => {
    const initialState: Partial<RootState> = {
      ocean: {
        height: 49,
        transactions: [],
        err: new Error('An unknown error has occurred')
      },
      wallet: {
        utxoBalance: '77',
        tokens: []
      }
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: { ocean: ocean.reducer, wallet: wallet.reducer }
    })
    const component = (
      <Provider store={store}>
        <OceanInterface />
      </Provider>
    );
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should match snapshot', async () => {
    const v2 = '020000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff050393700500ffffffff038260498a040000001976a9143db7aeb218455b697e94f6ff00c548e72221231d88ac7e67ce1d0000000017a914dd7730517e0e4969b4e43677ff5bee682e53420a870000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf90120000000000000000000000000000000000000000000000000000000000000000000000000'
    const buffer = SmartBuffer.fromBuffer(Buffer.from(v2, 'hex'))
    const signed = new CTransactionSegWit(buffer)

    const initialState: Partial<RootState> = {
      ocean: {
        height: 49,
        transactions: [{
          broadcasted: false,
          sign: async () => signed
        }]
      },
      wallet: {
        utxoBalance: '77',
        tokens: []
      }
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: { ocean: ocean.reducer, wallet: wallet.reducer }
    })
    const component = (
      <Provider store={store}>
        <OceanInterface />
      </Provider>
    );
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })
})
