import { render } from "@testing-library/react-native";
import { WalletCreateRestoreSuccess } from "./WalletCreateRestoreSuccess";

jest.mock("@shared-contexts/ThemeProvider");

jest.mock("@shared-contexts/WhaleContext", () => ({
  useWhaleApiClient: () => ({ client: jest.fn() }),
}));
jest.mock("@shared-contexts/WalletPersistenceContext", () => ({
  useWalletPersistenceContext: () => ({ setWallet: jest.fn() }),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 100, bottom: 100 }),
}));

describe("WalletCreateRestoreSuccess", () => {
  const mockEncryptedData = {
    type: "MNEMONIC_ENCRYPTED",
    version: "v1",
    raw: {
      pubKey: "foo",
      chainCode: "bar",
      encryptedPrivKey: "2000",
    },
  };

  it("should match create wallet snapshot", () => {
    const navigation: any = {
      navigate: jest.fn(),
    };
    const route: any = {
      params: {
        isWalletRestored: false,
        data: mockEncryptedData,
      },
    };
    const rendered = render(
      <WalletCreateRestoreSuccess navigation={navigation} route={route} />
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  it("should match restore wallet snapshot", () => {
    const navigation: any = {
      navigate: jest.fn(),
    };
    const route: any = {
      params: {
        isWalletRestored: true,
        data: mockEncryptedData,
      },
    };
    const rendered = render(
      <WalletCreateRestoreSuccess navigation={navigation} route={route} />
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
