import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import { render } from "@testing-library/react-native";
import { RowNetworkItem } from "./RowNetworkItem";

jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

describe("Row network item", () => {
  it("should match snapshot", () => {
    const rendered = render(
      <RowNetworkItem
        alertMessage="Foo"
        network={EnvironmentNetwork.LocalPlayground}
      />
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
