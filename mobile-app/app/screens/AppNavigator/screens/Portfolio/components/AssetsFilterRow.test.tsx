import { render } from "@testing-library/react-native";
import { AssetsFilterRow } from "./AssetsFilterRow";

describe("Portfolio Filter Buttons", () => {
  it("should match snapshot for Assets filter Buttons component", async () => {
    const setActiveButtonGroup = jest.fn();
    const onButtonPress = jest.fn();
    const activeButtonGroup = "ALL TOKENS";
    const isEvmDomain = false;

    const rendered = render(
      <AssetsFilterRow
        setActiveButtonGroup={setActiveButtonGroup}
        onButtonGroupPress={onButtonPress}
        activeButtonGroup={activeButtonGroup}
        isEvmDomain={isEvmDomain}
      />
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
