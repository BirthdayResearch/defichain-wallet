import { render } from "@testing-library/react-native";
import { RootState } from "@store";
import { setTokenSymbol, wallet } from "@waveshq/walletkit-ui/dist/store";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { block } from "@waveshq/walletkit-ui/dist/store/block";
import BigNumber from "bignumber.js";
import { loans } from "@store/loans";
import { PortfolioButtonGroupTabKey, TotalPortfolio } from "./TotalPortfolio";

jest.mock("@contexts/DisplayBalancesContext");

describe("DFI Total Portfolio Card", () => {
  it("should match snapshot", async () => {
    const initialState: Partial<RootState> = {
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
      loans: {
        vaults: [],
        collateralTokens: [],
        loanPaymentTokenActivePrices: {},
        hasFetchedLoansData: true,
        hasFetchedVaultsData: true,
        hasFetchedLoanSchemes: true,
        loanSchemes: [],
        loanTokens: [],
      },
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: {
        wallet: wallet.reducer,
        block: block.reducer,
        loans: loans.reducer,
      },
    });
    const component = (
      <Provider store={store}>
        <TotalPortfolio
          totalAvailableValue={new BigNumber(1000)}
          totalLockedValue={new BigNumber(300)}
          totalLoansValue={new BigNumber(100)}
          portfolioButtonGroup={[
            {
              id: PortfolioButtonGroupTabKey.USDT,
              label: "USD",
              handleOnPress: jest.fn(),
            },
          ]}
          denominationCurrency={PortfolioButtonGroupTabKey.USDT}
          setDenominationCurrency={jest.fn()}
        />
      </Provider>
    );
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
