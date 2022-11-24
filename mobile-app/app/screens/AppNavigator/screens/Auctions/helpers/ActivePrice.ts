import { ActivePrice } from "@defichain/whale-api-client/dist/api/prices";
import BigNumber from "bignumber.js";

type ActivePriceType = "ACTIVE" | "NEXT";
type TokenType = "COLLATERAL" | "LOAN";

/**
 * Returns either the current (`ACTIVE`) or future (`NEXT`) oracle price for
 *
 * Collateral:
 * - pass `collateralFactor` from collateral token
 * - pass `tokenType = "COLLATERAL"`
 *
 * Loan:
 * - use as it is
 */
export function getActivePrice(
  symbol: string,
  activePrice?: ActivePrice,
  collateralFactor: string = "1",
  priceType: ActivePriceType = "ACTIVE",
  tokenType: TokenType = "LOAN"
): string {
  if (symbol === "DUSD") {
    return new BigNumber("1").multipliedBy(collateralFactor).toFixed(8);
  }

  if (tokenType === "LOAN") {
    return (
      (priceType === "ACTIVE"
        ? activePrice?.active?.amount
        : activePrice?.next?.amount) ?? "0"
    );
  } else {
    return priceType === "ACTIVE"
      ? new BigNumber(activePrice?.active?.amount ?? 0)
          .multipliedBy(collateralFactor)
          .toFixed(8)
      : new BigNumber(activePrice?.next?.amount ?? 0)
          .multipliedBy(collateralFactor)
          .toFixed(8);
  }
}
