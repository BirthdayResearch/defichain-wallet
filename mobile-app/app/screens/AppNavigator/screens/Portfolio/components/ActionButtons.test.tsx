import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { RootState } from "@store";
import { setTokenSymbol, wallet } from "@waveshq/walletkit-ui/dist/store";
import { futureSwaps } from "@store/futureSwap";
import { DomainProvider } from "@shared-contexts/DomainProvider";
import { DomainPersistence } from "@api";
import { NativeLoggingProvider } from "@shared-contexts/NativeLoggingProvider";
import { StoreProvider } from "@contexts/StoreProvider";
import { ActionButtons } from "./ActionButtons";

jest.mock("@contexts/FeatureFlagContext");
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

const items: any = {};
jest.mock("react-native", () => ({
  AsyncStorage: {
    setItem: jest.fn((item, value) => {
      return new Promise((resolve) => {
        items[item] = value;
        resolve(value);
      });
    }),
    getItem: jest.fn((item) => {
      return new Promise((resolve) => {
        resolve(items[item]);
      });
    }),
  },
}));

describe("DFI Action Buttons", () => {
  it("should match snapshot for Action Buttons component", async () => {
    const initialState: Partial<RootState> = {
      futureSwaps: {
        futureSwaps: [],
        executionBlock: 0,
      },
      wallet: {
        utxoBalance: "77",
        tokens: [
          {
            id: "0",
            symbol: "DFI",
            symbolKey: "DFI",
            displaySymbol: "DFI",
            isDAT: true,
            isLPS: false,
            isLoanToken: false,
            amount: "23",
            name: "DeFiChain",
          },
        ].map(setTokenSymbol),
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
      reducer: {
        wallet: wallet.reducer,
        futureSwaps: futureSwaps.reducer,
      },
    });

    const rendered = render(
      <StoreProvider>
        <Provider store={store}>
          <NativeLoggingProvider>
            <DomainProvider api={DomainPersistence}>
              <ActionButtons />
            </DomainProvider>
          </NativeLoggingProvider>
        </Provider>
      </StoreProvider>
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
