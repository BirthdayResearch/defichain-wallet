import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render } from "@testing-library/react-native";
import { RootState } from "@store";
import { block } from "@waveshq/walletkit-ui/dist/store/block";
import { NetworkDetails } from "./NetworkDetails";

jest.mock("@waveshq/walletkit-ui/dist/contexts/ThemeProvider");

jest.mock("@shared-contexts/DeFiScanContext");

jest.mock("dayjs", () => () => ({ format: () => "Sep 14, 9:07 pm" }));

describe("NetworkDetails", () => {
  it("<NetworkDetails /> should render components", () => {
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
    const component = (
      <Provider store={store}>
        <NetworkDetails />
      </Provider>
    );
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
