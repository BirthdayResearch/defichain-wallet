import { configureStore } from "@reduxjs/toolkit";
import { RootState } from "@store";
import {
  ocean,
  block,
  transactionQueue,
} from "@waveshq/walletkit-ui/dist/store";
import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { NetworkSelectionScreen } from "./NetworkSelectionScreen";

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));
jest.mock("@shared-contexts/DeFiScanContext", () => ({
  useDeFiScanContext: () => ({ getblocksUrl: jest.fn() }),
}));

describe("onboarding network selection screen", () => {
  it("should render", async () => {
    const initialState: Partial<RootState> = {
      block: {
        count: 2000,
        masternodeCount: 10,
        lastSuccessfulSync: "Tue, 14 Sep 2021 15:37:10 GMT",
        connected: true,
        isPolling: true,
      },
      transactionQueue: {
        transactions: [],
      },
      ocean: {
        transactions: [],
        height: 0,
        err: undefined,
      },
    };

    const store = configureStore({
      preloadedState: initialState,
      reducer: {
        block: block.reducer,
        transactionQueue: transactionQueue.reducer,
        ocean: ocean.reducer,
      },
    });

    const rendered = render(
      <Provider store={store}>
        <NetworkSelectionScreen />
      </Provider>
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
