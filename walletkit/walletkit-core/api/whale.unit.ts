import { EnvironmentNetwork } from "./environment";
import {
  getDefaultDefiChainURL,
  newOceanOptions,
  newWhaleAPIClient,
  newWhaleRpcClient,
} from "./whale";

describe("whale", () => {
  it("should match ocean options for local playground", () => {
    const oceanOptions = newOceanOptions(EnvironmentNetwork.LocalPlayground);
    expect(oceanOptions).toMatchObject({
      url: "http://localhost:19553",
      network: "regtest",
      version: "v0",
    });
  });

  it("should match ocean options for remote playground", () => {
    const oceanOptions = newOceanOptions(EnvironmentNetwork.RemotePlayground);
    expect(oceanOptions).toMatchObject({
      url: "https://playground.jellyfishsdk.com",
      network: "regtest",
      version: "v0",
    });
  });

  it("should match ocean options for testnet", () => {
    const oceanOptions = newOceanOptions(EnvironmentNetwork.TestNet);
    expect(oceanOptions).toMatchObject({
      url: "https://testnet.ocean.jellyfishsdk.com",
      network: "testnet",
      version: "v0",
    });
  });

  it("should match ocean options for mainnet", () => {
    const oceanOptions = newOceanOptions(EnvironmentNetwork.MainNet);
    expect(oceanOptions).toMatchObject({
      url: "https://ocean.defichain.com",
      network: "mainnet",
      version: "v0",
    });
  });

  it("should match ocean options for devnet", () => {
    const oceanOptions = newOceanOptions(EnvironmentNetwork.DevNet);
    expect(oceanOptions).toMatchObject({
      url: "http://devnet.ocean.jellyfishsdk.com",
      network: "devnet",
      version: "v0",
    });
  });

  it("should match ocean options for changi", () => {
    const oceanOptions = newOceanOptions(EnvironmentNetwork.Changi);
    expect(oceanOptions).toMatchObject({
      url: "https://changi.ocean.jellyfishsdk.com",
      network: "changi",
      version: "v0",
    });
  });

  it("should create new instance of whale api client", () => {
    const oceanOptions = newOceanOptions(EnvironmentNetwork.TestNet);
    const whaleApiClient = newWhaleAPIClient(oceanOptions);
    expect(whaleApiClient).toBeDefined();
  });

  it("should create new instance of whale rpc client", () => {
    const oceanOptions = newOceanOptions(EnvironmentNetwork.TestNet);
    const whaleApiClient = newWhaleRpcClient(oceanOptions);
    expect(whaleApiClient).toBeDefined();
  });

  it("should match default ocean url for local playground", () => {
    const defaultURL = getDefaultDefiChainURL(
      EnvironmentNetwork.LocalPlayground,
    );
    expect(defaultURL).toStrictEqual("http://localhost:19553");
  });

  it("should match default ocean url for remote playground", () => {
    const defaultURL = getDefaultDefiChainURL(
      EnvironmentNetwork.RemotePlayground,
    );
    expect(defaultURL).toStrictEqual("https://playground.jellyfishsdk.com");
  });

  it("should match default ocean url for testnet", () => {
    const defaultURL = getDefaultDefiChainURL(EnvironmentNetwork.TestNet);
    expect(defaultURL).toStrictEqual("https://testnet.ocean.jellyfishsdk.com");
  });

  it("should match default ocean url for mainnet", () => {
    const defaultURL = getDefaultDefiChainURL(EnvironmentNetwork.MainNet);
    expect(defaultURL).toStrictEqual("https://ocean.defichain.com");
  });

  it("should match default ocean url for devnet", () => {
    const defaultURL = getDefaultDefiChainURL(EnvironmentNetwork.DevNet);
    expect(defaultURL).toStrictEqual("http://devnet.ocean.jellyfishsdk.com");
  });

  it("should match default ocean url for changi", () => {
    const defaultURL = getDefaultDefiChainURL(EnvironmentNetwork.Changi);
    expect(defaultURL).toStrictEqual("https://changi.ocean.jellyfishsdk.com");
  });
});

describe("whale custom provider", () => {
  const customProviderURL = "https://custom.provider.test.com";

  it("should match custom provider URL for local playground", () => {
    const oceanOptions = newOceanOptions(
      EnvironmentNetwork.LocalPlayground,
      customProviderURL,
    );
    expect(oceanOptions).toMatchObject({
      url: customProviderURL,
      network: "regtest",
      version: "v0",
    });
  });

  it("should match custom provider URL for testnet", () => {
    const oceanOptions = newOceanOptions(
      EnvironmentNetwork.TestNet,
      customProviderURL,
    );
    expect(oceanOptions).toMatchObject({
      url: customProviderURL,
      network: "testnet",
      version: "v0",
    });
  });

  it("should match custom provider URL for mainnet", () => {
    const oceanOptions = newOceanOptions(
      EnvironmentNetwork.MainNet,
      customProviderURL,
    );
    expect(oceanOptions).toMatchObject({
      url: customProviderURL,
      network: "mainnet",
      version: "v0",
    });
  });

  it("should match custom provider URL for devnet", () => {
    const oceanOptions = newOceanOptions(
      EnvironmentNetwork.DevNet,
      customProviderURL,
    );
    expect(oceanOptions).toMatchObject({
      url: customProviderURL,
      network: "devnet",
      version: "v0",
    });
  });

  it("should match custom provider URL for changi", () => {
    const oceanOptions = newOceanOptions(
      EnvironmentNetwork.Changi,
      customProviderURL,
    );
    expect(oceanOptions).toMatchObject({
      url: customProviderURL,
      network: "changi",
      version: "v0",
    });
  });
});
