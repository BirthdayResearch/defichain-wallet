import { render } from "@testing-library/react-native";

import { VaultInfo } from "./VaultInfo";

jest.mock("@waveshq/walletkit-ui/dist/contexts/ThemeProvider");
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
}));

describe("Vault info", () => {
  it("should render label with token icon group", async () => {
    const rendered = render(
      <VaultInfo
        testID="vault_info"
        label="Foo"
        tokens={["BTC", "dLTC", "dDOGE", "dETH", "dBCH", "DFI"]}
      />
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
