import { EnvironmentNetwork } from "@waveshq/walletkit-core/src";

import { handler, HandlerProps } from "./RefundBot";

const DFC_PLAYGROUND_MNEMONIC =
  "decorate unable decide notice wear unusual detail frost tissue debate opera luggage change chest broom attract divert fine quantum citizen veteran carbon draft matter";

const DFC_INVALID_PLAYGROUND_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon";

const REFUND_PLAYGROUND_ADDRESS =
  "bcrt1qlmvmz3wvfm945txx3hsyresqep4ywylpwvqa0w";

const INVALID_REFUND_PLAYGROUND_ADDRESS = "invalidaddress";

test.skip("should return transaction id when succesfully refunded ETH tokens (with manual topup of UTXO)", async () => {
  await spiedConsoleWithReturnResponse(
    {
      index: 0,
      refundAddress: REFUND_PLAYGROUND_ADDRESS,
      claimAmount: "0.1994",
      tokenSymbol: "ETH",
      urlNetwork: "https://playground.jellyfishsdk.com",
      envNetwork: EnvironmentNetwork.RemotePlayground,
      mnemonic: DFC_PLAYGROUND_MNEMONIC,
    },
    expect.stringMatching(/Send TxId:/),
  );
});

// Received: [Error: 400 - BadRequest (/v0/regtest/rawtx/send): txn-mempool-conflict (code 18)]
// Can't send another transaction immediately
test.skip("should return transaction id when succesfully refunded DFI UTXO (with manual topup of UTXO)", async () => {
  await spiedConsoleWithReturnResponse(
    {
      index: 0,
      refundAddress: REFUND_PLAYGROUND_ADDRESS,
      claimAmount: "0.5",
      tokenSymbol: "DFI",
      urlNetwork: "https://playground.jellyfishsdk.com",
      envNetwork: EnvironmentNetwork.RemotePlayground,
      mnemonic: DFC_PLAYGROUND_MNEMONIC,
    },
    expect.stringMatching(/Send TxId:/),
  );
});

test("should return invalid DeFiChain private keys", async () => {
  await spiedConsoleWithReturnErrorResponse(
    {
      index: 0,
      refundAddress: REFUND_PLAYGROUND_ADDRESS,
      claimAmount: "0.1994",
      tokenSymbol: "ETH",
      urlNetwork: "https://playground.jellyfishsdk.com",
      envNetwork: EnvironmentNetwork.RemotePlayground,
      mnemonic: DFC_INVALID_PLAYGROUND_MNEMONIC,
    },
    "Invalid DeFiChain private keys!",
  );
});

test("should return unable to decode address given the wrong refund address' index", async () => {
  await spiedConsoleWithReturnErrorResponse(
    {
      index: -10,
      refundAddress: INVALID_REFUND_PLAYGROUND_ADDRESS,
      claimAmount: "0.1994",
      tokenSymbol: "ETH",
      urlNetwork: "https://playground.jellyfishsdk.com",
      envNetwork: EnvironmentNetwork.RemotePlayground,
      mnemonic: DFC_PLAYGROUND_MNEMONIC,
    },
    "Invalid DeFiChain private keys!",
  );
});

test("should return unable to decode address given the wrong refund address", async () => {
  await spiedConsoleWithReturnErrorResponse(
    {
      index: 0,
      refundAddress: INVALID_REFUND_PLAYGROUND_ADDRESS,
      claimAmount: "0.1994",
      tokenSymbol: "ETH",
      urlNetwork: "https://playground.jellyfishsdk.com",
      envNetwork: EnvironmentNetwork.RemotePlayground,
      mnemonic: DFC_PLAYGROUND_MNEMONIC,
    },
    `Unable to decode Address - ${INVALID_REFUND_PLAYGROUND_ADDRESS}`,
  );
});

async function spiedConsoleWithReturnResponse(
  mockedObject: HandlerProps,
  errorMessage: string,
): Promise<void> {
  const consoleSpy = jest.spyOn(console, "log");
  try {
    await handler(mockedObject);
    expect(consoleSpy).toHaveBeenCalledWith(errorMessage);
  } finally {
    consoleSpy.mockRestore();
  }
}
async function spiedConsoleWithReturnErrorResponse(
  mockedObject: HandlerProps,
  errorMessage: string,
): Promise<void> {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation();
  try {
    await handler(mockedObject);
  } catch (err) {
    expect(err).toBeDefined();
    expect(consoleSpy).toHaveBeenCalledWith(errorMessage);
  }
  consoleSpy.mockRestore();
}
