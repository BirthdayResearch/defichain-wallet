import { configureStore } from "@reduxjs/toolkit";
import { RootState } from "@store";
import { block } from "@waveshq/walletkit-ui/dist/store/block";
import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { OnboardingNetworkSelectScreen } from "./OnboardingNetworkSelectScreen";

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));
jest.mock("@shared-contexts/DeFiScanContext", () => ({
  useDeFiScanContext: () => ({ getblocksUrl: jest.fn() }),
}));

jest.mock("@waveshq/walletkit-ui/dist/contexts/ThemeProvider");

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
    };

    const store = configureStore({
      preloadedState: initialState,
      reducer: { block: block.reducer },
    });

    const rendered = render(
      <Provider store={store}>
        <OnboardingNetworkSelectScreen />
      </Provider>
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
