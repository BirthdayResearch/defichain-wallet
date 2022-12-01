import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { RootState } from "@store";
import { setTokenSymbol, wallet } from "@store/wallet";
import { futureSwaps } from "@store/futureSwap";
import { ActionButtons } from "./ActionButtons";

jest.mock("@shared-contexts/ThemeProvider");
jest.mock("@contexts/FeatureFlagContext");
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
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
      <Provider store={store}>
        <ActionButtons />
      </Provider>
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
