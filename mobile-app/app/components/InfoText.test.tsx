import { render } from "@testing-library/react-native";
import { InfoText } from "./InfoText";

describe("info text", () => {
  it("should match snapshot", async () => {
    const rendered = render(<InfoText text="foo" />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
