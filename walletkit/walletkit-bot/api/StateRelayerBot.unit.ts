import { EnvironmentNetwork } from "@waveshq/walletkit-core";

import {
  expectedPairData,
  mockedDexPricesData,
  mockedPoolPairData,
  mockedStatsData,
} from "../utils/oceanMockedData";
import { handler } from "./StateRelayerBot";

jest.mock("@defichain/whale-api-client", () => ({
  WhaleApiClient: jest.fn().mockImplementation(() => ({
    stats: {
      get: () => mockedStatsData,
    },
    poolpairs: {
      list: () => mockedPoolPairData,
      listDexPrices: () => mockedDexPricesData,
    },
  })),
}));

describe("State Relayer Bot Tests", () => {
  test("should check block height difference is more than 30", () => {});
  test("should check that data is parsed correctly", async () => {
    const response = await runHandler();
    expect(response).toBeDefined();

    // should check data from /dex is parsed correctly
    expect(response).toHaveProperty(
      "totalValueLockInPoolPair",
      "272281685.3262795",
    );
    expect(response).toHaveProperty("total24HVolume", "60010");
    expect(response).toHaveProperty("pair", expectedPairData);

    // should check data from /dex/[pool-pair] is parsed correctly

    // should check data from /vaults is parsed correctly

    // should check data from /masternodes is parsed correctly

    // should check data from all burns is parsed correctly
  });
});

async function runHandler() {
  return handler({
    envNetwork: EnvironmentNetwork.LocalPlayground,
    urlNetwork: "",
  });
}
