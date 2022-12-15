import { render } from "@testing-library/react-native";
import { InputHelperText } from "./InputHelperText";

describe("input helper text", () => {
  it("should render", async () => {
    const rendered = render(
      <InputHelperText
        testID="testID"
        label="foo"
        content="bar"
        suffix="suffix"
      />
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
