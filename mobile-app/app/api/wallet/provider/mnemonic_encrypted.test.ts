import { EncryptedProviderData } from "@defichain/jellyfish-wallet-encrypted";
import { MnemonicEncrypted } from "@api/wallet";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import { WalletPersistenceDataI, WalletType } from "@waveshq/walletkit-ui";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getMnemonicHdNodeProvider for encrypted mnemonic", () => {
  it("should throw error when wallet type is not encrypted or version is not v1", () => {
    const data: WalletPersistenceDataI<EncryptedProviderData> = {
      version: "v1",
      type: WalletType.MNEMONIC_UNPROTECTED,
      raw: {
        pubKey: "",
        chainCode: "",
        encryptedPrivKey: "",
      },
    };
    const options = EnvironmentNetwork.LocalPlayground;
    const prompt = { prompt: jest.fn() };
    expect(() => {
      MnemonicEncrypted.initProvider(data, options, prompt);
    }).toThrow("Unexpected WalletPersistenceDataI");
  });
});
