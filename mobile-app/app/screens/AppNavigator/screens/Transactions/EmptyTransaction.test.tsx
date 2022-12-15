import { render } from "@testing-library/react-native";
import { EmptyTransaction } from "./EmptyTransaction";

jest.mock("@react-navigation/native");
jest.mock("@waveshq/walletkit-ui/dist/contexts/ThemeProvider");

describe("empty transaction", () => {
  it("should match snapshot", async () => {
    const navigation: any = {
      navigate: jest.fn(),
    };
    const rendered = render(
      <EmptyTransaction
        handleRefresh={() => {}}
        key="1"
        loadingStatus="loading"
        navigation={navigation}
      />
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
