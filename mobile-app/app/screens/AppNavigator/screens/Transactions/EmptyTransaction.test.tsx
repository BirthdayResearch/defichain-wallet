import { render } from "@testing-library/react-native";
import { EmptyTransaction } from "./EmptyTransaction";

jest.mock("@react-navigation/native");

describe("empty transaction", () => {
  it("should render empty state", async () => {
    const navigation: any = {
      navigate: jest.fn(),
    };
    const rendered = render(
      <EmptyTransaction
        handleRefresh={() => {}}
        key="1"
        loadingStatus="loading"
        navigation={navigation}
      />,
    );

    expect(await rendered.findByText("No transactions found")).toBeTruthy();
    expect(await rendered.findByText("Start by depositing DFI")).toBeTruthy();
  });
});
