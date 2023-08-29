import { configureStore } from "@reduxjs/toolkit";
import { RootState } from "@store";
import { userPreferences } from "@store/userPreferences";
import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { DomainType } from "@contexts/DomainContext";
import { AddressSelectionButton } from "./AddressSelectionButton";

describe("Address Selection Button", () => {
  it("should match snapshot", async () => {
    const onPress = jest.fn();
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
        <AddressSelectionButton
          address="foo"
          addressLength={4}
          onPress={onPress}
          hasCount
        />
      </Provider>,
    );

    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
