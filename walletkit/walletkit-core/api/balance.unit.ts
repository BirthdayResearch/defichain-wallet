import { WhaleApiClient } from "@defichain/whale-api-client";

import { checkSufficientBalance } from "./balance";
import { EnvironmentNetwork } from "./environment";
import { newOceanOptions, newWhaleAPIClient } from "./whale";

const mockWalletAddress = "bcrt1qh2yq58tzsh4gled7wv98mm7lndj9u5v6zyr2ge";
const mockTokenList = [
  {
    id: "2",
    amount: "0.00000451",
    symbol: "BTC",
    symbolKey: "BTC",
    name: "Bitcoin",
    isDAT: true,
    isLPS: false,
    isLoanToken: false,
    displaySymbol: "dBTC",
  },
];

describe("Balance checker", () => {
  let client: WhaleApiClient;

  beforeAll(async () => {
    client = newWhaleAPIClient(
      newOceanOptions(EnvironmentNetwork.RemotePlayground),
    );

    jest
      .spyOn(client.address, "listToken")
      .mockResolvedValue(mockTokenList as any);
  });

  it("should verify that balance is enough when balance is EQUAL TO the given amount", async () => {
    const walletToken = mockTokenList[0];
    const params = {
      client,
      address: mockWalletAddress,
      token: walletToken.symbol,
      amount: "0.00000451",
    };
    const hasSufficientBalance = await checkSufficientBalance(params);
    expect(hasSufficientBalance).toBeTruthy();
    expect(walletToken.amount).toStrictEqual(params.amount);
  });

  it("should verify that balance is enough when balance is GREATER THAN the given amount", async () => {
    const walletToken = mockTokenList[0];
    const params = {
      client,
      address: mockWalletAddress,
      token: walletToken.symbol,
      amount: "0.00000340",
    };
    const hasSufficientBalance = await checkSufficientBalance(params);
    expect(hasSufficientBalance).toBeTruthy();
    expect(Number(walletToken.amount)).toBeGreaterThan(Number(params.amount));
  });

  it("should be falsy when available balance is LESS THAN given amount", async () => {
    const walletToken = mockTokenList[0];
    const params = {
      client,
      address: mockWalletAddress,
      token: walletToken.symbol,
      amount: "1.5",
    };
    const hasSufficientBalance = await checkSufficientBalance(params);
    expect(hasSufficientBalance).toBeFalsy();
    expect(Number(walletToken.amount)).toBeLessThan(Number(params.amount));
  });

  it("should be falsy when given token is not on wallet at all", async () => {
    const params = {
      client,
      address: mockWalletAddress,
      token: "USDC",
      amount: "0.0123",
    };
    const hasSufficientBalance = await checkSufficientBalance(params);
    expect(hasSufficientBalance).toBeFalsy();
  });

  it("should not allow invalid type for amount", async () =>
    expect(async () => {
      const params = {
        client,
        address: mockWalletAddress,
        token: "USDC",
        amount: "invalid",
      };
      await checkSufficientBalance(params);
    }).rejects.toThrow("amount should be a number"));

  it("should not allow amount to be 0 or less than 0", async () =>
    expect(async () => {
      const params = {
        client,
        address: mockWalletAddress,
        token: "USDC",
        amount: "0",
      };
      await checkSufficientBalance(params);
    }).rejects.toThrow("amount should greater than zero"));
});
