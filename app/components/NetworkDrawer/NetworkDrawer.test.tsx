import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render } from "@testing-library/react-native";
import * as React from "react";
import { Linking } from "react-native";
import { Provider } from "react-redux";
import { RootState } from "../../store";
import { networkDrawer } from "../../store/networkDrawer";
import { NetworkDrawer } from "./NetworkDrawer";

describe('networkDrawer', () => {
  it('should match snapshot', async () => {
    const initialState: Partial<RootState> = {
      networkDrawer: {
        height: 49,
        isOpen: false,
        title: 'Loading...',
        isLoading: false,
        txid: ''
      }
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: { networkDrawer: networkDrawer.reducer }
    })
    const component = (
      <Provider store={store}>
        <NetworkDrawer />
      </Provider>
    );
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should display loading state', async () => {
    const initialState: Partial<RootState> = {
      networkDrawer: {
        height: 49,
        isOpen: true,
        title: 'Loading...',
        isLoading: true,
        txid: ''
      }
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: { networkDrawer: networkDrawer.reducer }
    })
    const component = (
      <Provider store={store}>
        <NetworkDrawer />
      </Provider>
    );
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should display txid and click', async () => {
    const initialState: Partial<RootState> = {
      networkDrawer: {
        height: 49,
        isOpen: true,
        title: 'Transaction completed',
        isLoading: false,
        txid: 'aoiwidwoajdpaowdpo123123apdowipo123'
      }
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: { networkDrawer: networkDrawer.reducer }
    })
    const component = (
      <Provider store={store}>
        <NetworkDrawer />
      </Provider>
    );
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
    const receiveButton = await rendered.findByTestId('networkDrawer_explorer')
    fireEvent.press(receiveButton)
    expect(Linking.canOpenURL).toBeCalled()
  })

  it('should display completed state and close panel', async () => {
    const initialState: Partial<RootState> = {
      networkDrawer: {
        height: 49,
        isOpen: true,
        title: 'Transaction completed',
        isLoading: false,
        txid: 'aoiwidwoajdpaowdpo123123apdowipo123'
      }
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: { networkDrawer: networkDrawer.reducer }
    })
    const component = (
      <Provider store={store}>
        <NetworkDrawer />
      </Provider>
    );
    const rendered = render(component)
    expect(rendered.toJSON()).toMatchSnapshot()
    const receiveButton = await rendered.findByTestId('networkDrawer_close')
    fireEvent.press(receiveButton)
    expect(Linking.canOpenURL).toBeCalled()
  })
})
