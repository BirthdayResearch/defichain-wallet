import { useStyles } from "@tailwind";
import { render } from "@testing-library/react-native";
import { SearchInput } from "./SearchInput";

jest.mock("@shared-contexts/ThemeProvider");

describe.skip("Search Input", () => {
  it("should match snapshot", () => {
    const { tailwind } = useStyles();
    const rendered = render(
      <SearchInput
        containerStyle={tailwind("flex-1")}
        showClearButton
        onClearInput={jest.fn()}
      />
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
