import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react-native";
import * as React from "react";
import { Provider } from "react-redux";
import { RootState } from "../../store";
import { networkDrawer } from "../../store/networkDrawer";
import { NetworkDrawer } from "./NetworkDrawer";

describe('networkDrawer', () => {
  it('should match snapshot with error', async () => {
    const initialState: Partial<RootState> = {
      networkDrawer: {
        height: 49,
        transactions: [],
        err: new Error('An unknown error has occurred')
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

  it('should match snapshot', async () => {
    const initialState: Partial<RootState> = {
      networkDrawer: {
        height: 49,
        transactions: [],
        err: new Error('An unknown error has occurred')
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
})
