import { render } from "@testing-library/react-native";
import { ConversionInfoText } from "./ConversionInfoText";

jest.mock("@waveshq/walletkit-ui/dist/contexts/ThemeProvider");

describe("Conversion info text", () => {
  it("should match snapshot", async () => {
    const rendered = render(<ConversionInfoText />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
