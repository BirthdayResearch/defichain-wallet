import { validateAddress } from "./addressValidator";

const WALLET_ADDRESS = {
  mainnet: "df1qldycdkvqaacwsf4gmgl29mt686mh95kattran0",
  testnet: "tf1qm5hf2lhrsyfzeu0mnnzl3zllznfveua5rprhr4",
  regtest: "bcrt1qh2yq58tzsh4gled7wv98mm7lndj9u5v6zyr2ge",
};

describe("Address validator", () => {
  it("should be valid DFC address for Mainnet network", () => {
    const isValidAddress = validateAddress(WALLET_ADDRESS.mainnet, "mainnet");
    expect(isValidAddress).toBeTruthy();
  });

  it("should be valid DFC address for Testnet network", () => {
    const isValidAddress = validateAddress(WALLET_ADDRESS.testnet, "testnet");
    expect(isValidAddress).toBeTruthy();
  });

  it("should be valid DFC address for Regtest network", () => {
    const isValidAddress = validateAddress(WALLET_ADDRESS.regtest, "regtest");
    expect(isValidAddress).toBeTruthy();
  });

  it("should be invalid when a Mainnet address is used on Testnet network", () => {
    const isValidAddress = validateAddress(WALLET_ADDRESS.mainnet, "testnet");
    expect(isValidAddress).toBeFalsy();
  });

  it("should be invalid when a Testnet address is used on Mainnet network", () => {
    const isValidAddress = validateAddress(WALLET_ADDRESS.testnet, "mainnet");
    expect(isValidAddress).toBeFalsy();
  });

  it("should be invalid when a Regtest address is used on Mainnet network", () => {
    const isValidAddress = validateAddress(WALLET_ADDRESS.regtest, "mainnet");
    expect(isValidAddress).toBeFalsy();
  });
});
