import { render } from "@testing-library/react-native";
import { EmptyTransaction } from "./EmptyTransaction";

jest.mock("@react-navigation/native");
jest.mock("@shared-contexts/ThemeProvider");

describe("empty transaction", () => {
  it("should match snapshot", async () => {
    const rendered = render(
      <EmptyTransaction
        handleRefresh={() => {}}
        key="1"
        loadingStatus="loading"
      />
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
