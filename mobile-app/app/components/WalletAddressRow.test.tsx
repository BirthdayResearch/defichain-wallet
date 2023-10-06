import { render } from "@testing-library/react-native";
import { configureStore } from "@reduxjs/toolkit";
import { RootState } from "@store";
import { Provider } from "react-redux";
import { userPreferences } from "@store/userPreferences";

import { DomainType } from "@contexts/DomainContext";
import { WalletAddressRow } from "./WalletAddressRow";

jest.mock("@shared-contexts/WalletContext");

describe("Wallet Address Row", () => {
  it("should match snapshot", async () => {
    const initialState: Partial<RootState> = {
      userPreferences: {
        addresses: {
          foo: {
            address: "foo",
            evmAddress: "",
            label: "foo",
          },
        },
        addressBook: {
          bar: {
            address: "bar",
            label: "bar",
            addressDomainType: DomainType.DVM,
          },
        },
      },
    };
    const store = configureStore({
      preloadedState: initialState,
      reducer: { userPreferences: userPreferences.reducer },
    });

    const rendered = render(
      <Provider store={store}>
        <WalletAddressRow />
      </Provider>,
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
