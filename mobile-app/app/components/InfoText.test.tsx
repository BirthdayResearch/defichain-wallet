import { render } from "@testing-library/react-native";
import { InfoText } from "./InfoText";

jest.mock("@waveshq/walletkit-ui/dist/contexts/ThemeProvider");

describe("info text", () => {
  it("should match snapshot", async () => {
    const rendered = render(<InfoText text="foo" />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
