import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { RootState } from "@store";
import { wallet, setTokenSymbol } from "@store/wallet";
import { block } from "@waveshq/walletkit-ui/dist/store/block";
import { StoreServiceProvider } from "@waveshq/walletkit-ui";
import { loans } from "@store/loans";
import { LoanVaultState } from "@defichain/whale-api-client/dist/api/loan";
import { futureSwaps } from "@store/futureSwap";
import { WhaleProvider } from "@shared-contexts/WhaleContext";
import { ServiceProviderPersistence } from "@api/wallet/service_provider";
import { Logging } from "@api";
import { PortfolioScreen } from "./PortfolioScreen";

jest.mock("@react-navigation/bottom-tabs", () => ({
  useBottomTabBarHeight: () => 49,
}));
jest.mock("@contexts/FeatureFlagContext");
jest.mock("randomcolor", () => jest.fn().mockReturnValue("#ffffff"));

jest.mock("@shared-contexts/LanguageProvider");
jest.mock("@shared-contexts/DeFiScanContext");
jest.mock("@shared-contexts/WalletContext");
jest.mock("@shared-contexts/WalletPersistenceContext");

jest.mock("@contexts/DisplayBalancesContext");

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({ navigate: jest.fn() }),
  useScrollToTop: jest.fn(),
  useIsFocused: jest.fn(),
}));

jest.mock("@gorhom/bottom-sheet", () => ({
  useBottomSheetModal: () => ({
    dismiss: jest.fn(),
  }),
}));

jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  OS: "web",
  select: () => jest.fn,
}));

jest.mock("@store/website", () => ({
  useGetAnnouncementsQuery: () => ({ data: [], isSuccess: true }),
  useGetStatusQuery: () => jest.fn(),
}));

jest.mock(
  "@screens/AppNavigator/screens/Portfolio/components/Announcements",
  () => {
    function Announcements(): JSX.Element {
      return <></>;
    }
    return { Announcements };
  }
);

describe("portfolio page", () => {
  const tokens = [
    {
      id: "0",
      symbol: "DFI",
      symbolKey: "DFI",
      displaySymbol: "DFI",
      isDAT: true,
      isLPS: false,
      isLoanToken: false,
      amount: "23",
      name: "Defi",
    },
    {
      id: "1",
      symbol: "BTC",
      symbolKey: "BTC",
      displaySymbol: "dBTC",
      isDAT: true,
      isLPS: false,
      isLoanToken: false,
      amount: "777",
      name: "Bitcoin",
    },
    {
      id: "2",
      symbol: "ETH",
      symbolKey: "ETH",
      displaySymbol: "dETH",
      isDAT: true,
      isLPS: false,
      isLoanToken: false,
      amount: "555",
      name: "Ethereum",
    },
  ];

  it("should match snapshot", async () => {
    const initialState: Partial<RootState> = {
      wallet: {
        utxoBalance: "77",
        tokens: tokens.map(setTokenSymbol),
        allTokens: {},
        poolpairs: [],
        dexPrices: {},
        swappableTokens: {},
        hasFetchedPoolpairData: false,
        hasFetchedToken: true,
        hasFetchedSwappableTokens: false,
      },
      block: {
        count: 100,
        masternodeCount: 10,
        lastSuccessfulSync: undefined,
        connected: true,
        isPolling: true,
        tvl: undefined,
      },
      loans: {
        vaults: [
          {
            vaultId:
              "d3f52b85e004fda0244dc2f73771c7ecc91fda1a0ca1e439b421ebbb9573dae2",
            loanScheme: {
              id: "MIN150",
              minColRatio: "150",
              interestRate: "5",
            },
            ownerAddress: "bcrt1qsr645glm3krcskdvak5hzs5eez6u4385k9a3wv",
            state: LoanVaultState.ACTIVE,
            informativeRatio: "-1",
            collateralRatio: "-1",
            collateralValue: "212.3",
            loanValue: "0",
            interestValue: "0",
            collateralAmounts: [
              {
                id: "0",
                amount: "2.12300000",
                symbol: "DFI",
                symbolKey: "DFI",
                name: "Default Defi token",
                displaySymbol: "DFI",
                activePrice: {
                  id: "DFI-USD-4224",
                  key: "DFI-USD",
                  isLive: true,
                  block: {
                    hash: "01ff6c392764d0bba244369e3b6c096eac73bd5a5a1fc6a187ea7358baa56111",
                    height: 4224,
                    medianTime: 1646706425,
                    time: 1646706431,
                  },
                  active: {
                    amount: "100.00000000",
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3,
                    },
                  },
                  next: {
                    amount: "100.00000000",
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3,
                    },
                  },
                  sort: "00001080",
                },
              },
            ],
            loanAmounts: [],
            interestAmounts: [],
          },
        ],
        collateralTokens: [],
        loanPaymentTokenActivePrices: {},
        hasFetchedLoansData: false,
        hasFetchedVaultsData: true,
        hasFetchedLoanSchemes: true,
        loanSchemes: [],
        loanTokens: [],
      },
      futureSwaps: {
        futureSwaps: [],
        executionBlock: 0,
      },
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: {
        wallet: wallet.reducer,
        block: block.reducer,
        loans: loans.reducer,
        futureSwaps: futureSwaps.reducer,
      },
    });
    const navigation: any = {
      navigate: jest.fn(),
      setOptions: jest.fn(),
    };
    const route: any = {};
    const component = (
      <Provider store={store}>
        <StoreServiceProvider api={ServiceProviderPersistence} logger={Logging}>
          <WhaleProvider>
            <PortfolioScreen navigation={navigation} route={route} />
          </WhaleProvider>
        </StoreServiceProvider>
      </Provider>
    );
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should navigate to token detail page", async () => {
    const initialState: Partial<RootState> = {
      wallet: {
        utxoBalance: "77",
        tokens: tokens.map(setTokenSymbol),
        allTokens: {},
        poolpairs: [],
        dexPrices: {},
        swappableTokens: {},
        hasFetchedPoolpairData: false,
        hasFetchedToken: true,
        hasFetchedSwappableTokens: false,
      },
      block: {
        count: 100,
        masternodeCount: 10,
        lastSuccessfulSync: undefined,
        connected: true,
        isPolling: true,
        tvl: undefined,
      },
      loans: {
        vaults: [
          {
            vaultId:
              "d3f52b85e004fda0244dc2f73771c7ecc91fda1a0ca1e439b421ebbb9573dae2",
            loanScheme: {
              id: "MIN150",
              minColRatio: "150",
              interestRate: "5",
            },
            ownerAddress: "bcrt1qsr645glm3krcskdvak5hzs5eez6u4385k9a3wv",
            state: LoanVaultState.ACTIVE,
            informativeRatio: "-1",
            collateralRatio: "-1",
            collateralValue: "212.3",
            loanValue: "0",
            interestValue: "0",
            collateralAmounts: [
              {
                id: "0",
                amount: "2.12300000",
                symbol: "DFI",
                symbolKey: "DFI",
                name: "Default Defi token",
                displaySymbol: "DFI",
                activePrice: {
                  id: "DFI-USD-4224",
                  key: "DFI-USD",
                  isLive: true,
                  block: {
                    hash: "01ff6c392764d0bba244369e3b6c096eac73bd5a5a1fc6a187ea7358baa56111",
                    height: 4224,
                    medianTime: 1646706425,
                    time: 1646706431,
                  },
                  active: {
                    amount: "100.00000000",
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3,
                    },
                  },
                  next: {
                    amount: "100.00000000",
                    weightage: 3,
                    oracles: {
                      active: 3,
                      total: 3,
                    },
                  },
                  sort: "00001080",
                },
              },
            ],
            loanAmounts: [],
            interestAmounts: [],
          },
        ],
        collateralTokens: [],
        loanPaymentTokenActivePrices: {},
        hasFetchedLoansData: false,
        hasFetchedVaultsData: true,
        hasFetchedLoanSchemes: true,
        loanSchemes: [],
        loanTokens: [],
      },
      futureSwaps: {
        futureSwaps: [],
        executionBlock: 0,
      },
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: {
        wallet: wallet.reducer,
        block: block.reducer,
        loans: loans.reducer,
        futureSwaps: futureSwaps.reducer,
      },
    });
    const navigation: any = {
      navigate: jest.fn(),
      setOptions: jest.fn(),
    };
    const route: any = {};
    const spy = jest.spyOn(navigation, "navigate");

    const component = (
      <Provider store={store}>
        <StoreServiceProvider api={ServiceProviderPersistence} logger={Logging}>
          <WhaleProvider>
            <PortfolioScreen navigation={navigation} route={route} />
          </WhaleProvider>
        </StoreServiceProvider>
      </Provider>
    );
    const rendered = render(component);
    const btcBalanceRow = await rendered.findByTestId("portfolio_row_1");
    fireEvent.press(btcBalanceRow);
    expect(spy).toHaveBeenCalled();
  });
});
