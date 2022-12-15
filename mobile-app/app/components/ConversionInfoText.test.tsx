import { render } from "@testing-library/react-native";
import { ConversionInfoText } from "./ConversionInfoText";

describe("Conversion info text", () => {
  it("should match snapshot", async () => {
    const rendered = render(<ConversionInfoText />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
