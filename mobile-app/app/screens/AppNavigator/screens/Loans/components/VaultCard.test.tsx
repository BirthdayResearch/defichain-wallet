import { render } from "@testing-library/react-native";
import { LoanVaultState } from "@defichain/whale-api-client/dist/api/loan";
import { configureStore } from "@reduxjs/toolkit";
import { wallet } from "@store/wallet";
import { loans } from "@store/loans";
import { RootState } from "@store";
import { Provider } from "react-redux";
import { VaultCard, VaultCardProps } from "./VaultCard";

jest.mock("react-native-reanimated", () => "react-native-reanimated/mock");
jest.mock(
  "react-native-circular-progress-indicator",
  () => "react-native-circular-progress-indicator/mock"
);

jest.mock("@shared-contexts/DeFiScanContext");
jest.mock("@components/BottomSheetInfo", () => ({
  BottomSheetInfo: () => <></>,
}));
jest.mock("react-native-popover-view");
jest.mock("@contexts/FeatureFlagContext");
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => {
    return { navigate: jest.fn() };
  },
  useScrollToTop: jest.fn(),
  useIsFocused: jest.fn(),
}));
jest.mock("@gorhom/bottom-sheet", () => ({
  useBottomSheetModal: () => ({
    dismiss: jest.fn(),
  }),
}));

describe("Vault card", () => {
  const initialState: Partial<RootState> = {
    loans: {
      vaults: [
        {
          vaultId: "22ffasd5ca123123123123123121231061",
          loanAmounts: [],
          collateralRatio: "",
          collateralValue: "",
          collateralAmounts: [],
          loanScheme: {
            id: "0",
            interestRate: "3",
            minColRatio: "100",
          },
          loanValue: "100",
          ownerAddress: "bcrt1qxzj8pnkeqznvx6xgeepdywus8lkxq3vvmeccyt",
          state: LoanVaultState.ACTIVE,
          informativeRatio: "0",
          interestAmounts: [],
          interestValue: "1",
        },
      ],
      collateralTokens: [],
      loanPaymentTokenActivePrices: {},
      hasFetchedLoansData: false,
      hasFetchedVaultsData: false,
      hasFetchedLoanSchemes: true,
      loanSchemes: [],
      loanTokens: [],
    },
  };
  const store = configureStore({
    preloadedState: initialState,
    reducer: {
      wallet: wallet.reducer,
      loans: loans.reducer,
    },
  });

  it("should match snapshot of liquidated vault", async () => {
    const lockedVault: Omit<
      VaultCardProps,
      | "dismissModal"
      | "expandModal"
      | "setBottomSheetScreen"
      | "onBottomSheetLoansTokensListSelect"
    > = {
      vault: {
        vaultId: "22ffasd5ca123123123123123121231061",
        loanScheme: {
          id: "0",
          interestRate: "3",
          minColRatio: "100",
        },
        ownerAddress: "bcrt1qxzj8pnkeqznvx6xgeepdywus8lkxq3vvmeccyt",
        state: LoanVaultState.IN_LIQUIDATION,
        batches: [],
        batchCount: 0,
        liquidationHeight: 0,
        liquidationPenalty: 0,
      },
      testID: "vault",
    };
    const rendered = render(
      <Provider store={store}>
        <VaultCard
          dismissModal={() => jest.fn}
          expandModal={() => jest.fn}
          setBottomSheetScreen={() => jest.fn}
          setSnapPoints={() => jest.fn}
          onBottomSheetLoansTokensListSelect={() => jest.fn}
          vault={lockedVault.vault}
          testID={lockedVault.testID}
        />
      </Provider>
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot of at-risk vault", async () => {
    const atRiskVault: VaultCardProps = {
      vault: {
        vaultId: "22ffasd5ca123123123123123121231061",
        loanAmounts: [],
        collateralRatio: "",
        collateralValue: "",
        collateralAmounts: [],
        loanScheme: {
          id: "0",
          interestRate: "3",
          minColRatio: "100",
        },
        loanValue: "100",
        ownerAddress: "bcrt1qxzj8pnkeqznvx6xgeepdywus8lkxq3vvmeccyt",
        state: LoanVaultState.MAY_LIQUIDATE,
        informativeRatio: "0",
        interestAmounts: [],
        interestValue: "1",
      },
      testID: "vault",
      dismissModal: () => jest.fn,
      expandModal: () => jest.fn,
      setBottomSheetScreen: () => jest.fn,
      setSnapPoints: () => jest.fn,
      onBottomSheetLoansTokensListSelect: () => jest.fn,
    };
    const rendered = render(
      <Provider store={store}>
        <VaultCard {...atRiskVault} testID={atRiskVault.testID} />
      </Provider>
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot of healthy vault", async () => {
    const safeVault: Omit<
      VaultCardProps,
      | "dismissModal"
      | "expandModal"
      | "setBottomSheetScreen"
      | "onBottomSheetLoansTokensListSelect"
    > = {
      vault: {
        vaultId: "22ffasd5ca123123123123123121231061",
        loanAmounts: [],
        collateralRatio: "",
        collateralValue: "",
        collateralAmounts: [],
        loanScheme: {
          id: "0",
          interestRate: "3",
          minColRatio: "100",
        },
        loanValue: "100",
        ownerAddress: "bcrt1qxzj8pnkeqznvx6xgeepdywus8lkxq3vvmeccyt",
        state: LoanVaultState.ACTIVE,
        informativeRatio: "0",
        interestAmounts: [],
        interestValue: "1",
      },
      testID: "vault",
    };
    const rendered = render(
      <Provider store={store}>
        <VaultCard
          dismissModal={() => jest.fn}
          expandModal={() => jest.fn}
          setBottomSheetScreen={() => jest.fn}
          setSnapPoints={() => jest.fn}
          onBottomSheetLoansTokensListSelect={() => jest.fn}
          vault={safeVault.vault}
          testID={safeVault.testID}
        />
      </Provider>
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot of active vault", async () => {
    const newVault: Omit<
      VaultCardProps,
      | "dismissModal"
      | "expandModal"
      | "setBottomSheetScreen"
      | "onBottomSheetLoansTokensListSelect"
    > = {
      vault: {
        vaultId: "22ffasd5ca123123123123123121231061",
        loanAmounts: [],
        collateralRatio: "",
        collateralValue: "",
        collateralAmounts: [],
        loanScheme: {
          id: "0",
          interestRate: "3",
          minColRatio: "100",
        },
        loanValue: "100",
        ownerAddress: "bcrt1qxzj8pnkeqznvx6xgeepdywus8lkxq3vvmeccyt",
        state: LoanVaultState.ACTIVE,
        informativeRatio: "0",
        interestAmounts: [],
        interestValue: "1",
      },
      testID: "vault",
    };
    const rendered = render(
      <Provider store={store}>
        <VaultCard
          dismissModal={() => jest.fn}
          expandModal={() => jest.fn}
          setBottomSheetScreen={() => jest.fn}
          setSnapPoints={() => jest.fn}
          onBottomSheetLoansTokensListSelect={() => jest.fn}
          vault={newVault.vault}
          testID={newVault.testID}
        />
      </Provider>
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
