import { render } from "@testing-library/react-native";
import { AssetsFilterRow } from "./AssetsFilterRow";

jest.mock("@shared-contexts/ThemeProvider");

describe("Portfolio Filter Buttons", () => {
  it("should match snapshot for Assets filter Buttons component", async () => {
    const setActiveButtonGroup = jest.fn();
    const onButtonPress = jest.fn();
    const activeButtonGroup = "ALL TOKENS";

    const rendered = render(
      <AssetsFilterRow
        setActiveButtonGroup={setActiveButtonGroup}
        onButtonGroupPress={onButtonPress}
        activeButtonGroup={activeButtonGroup}
      />
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
