import { render } from "@testing-library/react-native";
import { InfoTextLink } from "./InfoTextLink";

describe("Info text link", () => {
  it("should match snapshot", () => {
    const rendered = render(<InfoTextLink onPress={jest.fn()} text="foo" />);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
