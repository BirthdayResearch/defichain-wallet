import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { render } from "@testing-library/react-native";

import { EmptyVault } from "./EmptyVault";

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: jest.fn(),
}));

describe("Empty vault", () => {
  it("should match snapshot", async () => {
    const rendered = render(
      <BottomSheetModalProvider>
        <EmptyVault handleRefresh={() => jest.fn} isLoading={false} />
      </BottomSheetModalProvider>
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
