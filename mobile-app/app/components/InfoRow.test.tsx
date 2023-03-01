import { render } from "@testing-library/react-native";
import { InfoRow, InfoType } from "./InfoRow";

jest.mock("./BottomSheetModal", () => ({
  BottomSheetModal: () => <></>,
}));

describe("estimated fee info scanner", () => {
  it("should match snapshot of estimated fee", async () => {
    const component = (
      <InfoRow
        type={InfoType.EstimatedFee}
        value="100"
        testID="text_fee"
        suffix="DFI"
      />
    );
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot of vault fee", async () => {
    const component = (
      <InfoRow
        type={InfoType.VaultFee}
        value="100"
        testID="text_fee"
        suffix="DFI"
      />
    );
    const rendered = render(component);
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
