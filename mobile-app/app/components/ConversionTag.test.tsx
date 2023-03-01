import { render } from "@testing-library/react-native";
import { ConversionTag } from "./ConversionTag";

describe("Conversion tag", () => {
  it("should match snapshot", async () => {
    const rendered = render(<ConversionTag />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
