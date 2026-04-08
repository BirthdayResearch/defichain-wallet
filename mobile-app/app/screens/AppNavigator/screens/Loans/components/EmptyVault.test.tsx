import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { render } from "@testing-library/react-native";

import { EmptyVault } from "./EmptyVault";

jest.mock("@components/BottomSheetWithNavV2", () => ({
  BottomSheetWithNavV2: () => null,
  BottomSheetWebWithNavV2: () => null,
}));

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: jest.fn(),
}));

describe("Empty vault", () => {
  it("should render empty vault state", async () => {
    const rendered = render(
      <BottomSheetModalProvider>
        <EmptyVault handleRefresh={() => jest.fn} isLoading={false} />
      </BottomSheetModalProvider>,
    );
    expect(await rendered.findByTestId("empty_vault_title")).toBeTruthy();
    expect(await rendered.findByTestId("empty_vault_description")).toBeTruthy();
    expect(await rendered.findByTestId("button_create_vault")).toBeTruthy();
  });
});
