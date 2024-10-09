import { WhaleApiClient } from "@defichain/whale-api-client";
import BigNumber from "bignumber.js";

interface CheckBalanceProps {
  client: WhaleApiClient;
  address: string;
  token: string;
  amount: string;
}

/**
 * Checks if wallet address has enough balance for specific token and amount.
 * @param {WhaleApiClient} client instance of whale API client
 * @param {string} address bech32/legacy/b58 formatted address
 * @param {string} token symbol to check balance from
 * @param {string} amount to check across available balance
 * @returns {boolean}
 */
export async function checkSufficientBalance({
  client,
  address,
  token,
  amount,
}: CheckBalanceProps): Promise<boolean> {
  if (new BigNumber(amount).isNaN()) {
    throw new Error("amount should be a number");
  }
  if (new BigNumber(amount).lte(0)) {
    throw new Error("amount should greater than zero");
  }
  const tokens = await client.address.listToken(address);
  const tokenInfo = tokens.find((t) => t.symbol === token);
  const availableAmount = new BigNumber(tokenInfo?.amount ?? 0);
  return availableAmount.gte(amount);
}
