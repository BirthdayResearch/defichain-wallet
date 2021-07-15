import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react-native";
import * as React from "react";
import { Provider } from "react-redux";
import { RootState } from "../../store";
import { ocean } from "../../store/ocean";
import { OceanInterface } from "./OceanInterface";

describe('oceanInterface', () => {
  it('should match snapshot with error', async () => {
    const initialState: Partial<RootState> = {
      ocean: {
        height: 49,
        transactions: [],
        err: new Error('An unknown error has occurred')
      }
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: { ocean: ocean.reducer }
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
    const initialState: Partial<RootState> = {
      ocean: {
        height: 49,
        transactions: [],
        err: new Error('An unknown error has occurred')
      }
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: { ocean: ocean.reducer }
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
