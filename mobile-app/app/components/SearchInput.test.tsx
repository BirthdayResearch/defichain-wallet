import { tailwind } from "@tailwind";
import { render } from "@testing-library/react-native";
import { SearchInput } from "./SearchInput";

describe("Search Input", () => {
  it("should match snapshot", () => {
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
