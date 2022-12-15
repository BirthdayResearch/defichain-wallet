import { render } from "@testing-library/react-native";
import { BottomSheetHeader } from "./BottomSheetHeader";

describe("Bottom sheet header", () => {
  it("should match snapshot", async () => {
    const component = (
      <BottomSheetHeader onClose={jest.fn()} headerText="Test" />
    );
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
