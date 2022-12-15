import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render } from "@testing-library/react-native";
import * as Clipboard from "expo-clipboard";
import { Provider } from "react-redux";
import { RootState } from "@store";
import { wallet } from "@store/wallet";
import { ReceiveScreen } from "./ReceiveScreen";

jest.mock("@shared-contexts/WalletContext");

jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(),
}));

jest.mock("react-native-toast-notifications", () => ({
  useToast: () => ({
    show: jest.fn(),
    hide: jest.fn(),
    hideAll: jest.fn(),
  }),
}));

jest.mock("@waveshq/walletkit-ui/dist/contexts/ThemeProvider");

describe("receive page", () => {
  it("should match snapshot", async () => {
    const initialState: Partial<RootState> = {
      wallet: {
        utxoBalance: "77",
        tokens: [],
        allTokens: {},
        poolpairs: [],
        dexPrices: {},
        swappableTokens: {},
        hasFetchedPoolpairData: false,
        hasFetchedToken: true,
        hasFetchedSwappableTokens: false,
      },
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: { wallet: wallet.reducer },
    });
    const component = (
      <Provider store={store}>
        <ReceiveScreen />
      </Provider>
    );
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should trigger copy", async () => {
    const initialState: Partial<RootState> = {
      wallet: {
        utxoBalance: "77",
        tokens: [],
        allTokens: {},
        poolpairs: [],
        dexPrices: {},
        swappableTokens: {},
        hasFetchedPoolpairData: false,
        hasFetchedToken: true,
        hasFetchedSwappableTokens: false,
      },
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: { wallet: wallet.reducer },
    });
    const component = (
      <Provider store={store}>
        <ReceiveScreen />
      </Provider>
    );
    const spy = jest.spyOn(Clipboard, "setStringAsync");
    const rendered = render(component);
    const copyButton = await rendered.findByTestId("copy_button");
    fireEvent.press(copyButton);
    expect(spy).toHaveBeenCalled();
  });

  it("should trigger share", async () => {
    const initialState: Partial<RootState> = {
      wallet: {
        utxoBalance: "77",
        tokens: [],
        allTokens: {},
        poolpairs: [],
        dexPrices: {},
        swappableTokens: {},
        hasFetchedPoolpairData: false,
        hasFetchedToken: true,
        hasFetchedSwappableTokens: false,
      },
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: { wallet: wallet.reducer },
    });
    const component = (
      <Provider store={store}>
        <ReceiveScreen />
      </Provider>
    );
    const spy = jest.spyOn(Clipboard, "setStringAsync");
    const rendered = render(component);
    const shareButton = await rendered.findByTestId("share_button");
    fireEvent.press(shareButton);
    expect(spy).toHaveBeenCalled();
  });
});
