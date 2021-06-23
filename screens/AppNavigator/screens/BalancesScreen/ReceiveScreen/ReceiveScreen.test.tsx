import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render } from "@testing-library/react-native"
import * as React from 'react'
import { Provider } from "react-redux";
import Clipboard from 'expo-clipboard'
import { RootState } from "../../../../../store";
import { network } from "../../../../../store/network";
import { wallet, WalletStatus } from "../../../../../store/wallet";
import { ReceiveScreen } from "./ReceiveScreen";

jest.mock("expo-clipboard", () => ({
  setString: jest.fn()
}))

describe('receive page', () => {
  it('should match snapshot', async () => {
    const initialState: Partial<RootState> = {
      wallet: {
        address: 'bcrt1q6np0fh47ykhznjhrtfvduh73cgjg32yac8t07d',
        status: WalletStatus.LOADED_WALLET,
        utxoBalance: '77',
        tokens: []
      }
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: { wallet: wallet.reducer, network: network.reducer }
    })
    const component = (
      <Provider store={store}>
        <ReceiveScreen />
      </Provider>
    );
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should trigger copy', async () => {
    const initialState: Partial<RootState> = {
      wallet: {
        address: 'bcrt1q6np0fh47ykhznjhrtfvduh73cgjg32yac8t07d',
        status: WalletStatus.LOADED_WALLET,
        utxoBalance: '77',
        tokens: []
      }
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: { wallet: wallet.reducer, network: network.reducer }
    })
    const component = (
      <Provider store={store}>
        <ReceiveScreen />
      </Provider>
    );
    const spy = jest.spyOn(Clipboard, 'setString')
    const rendered = render(component)
    const copyButton = await rendered.findByTestId('copy_button')
    fireEvent.press(copyButton)
    expect(spy).toHaveBeenCalled()
  })
})

