import { ActivePrice } from "@defichain/whale-api-client/dist/api/prices";
import BigNumber from "bignumber.js";

type ActivePriceType = "ACTIVE" | "NEXT";

// oracle prices
export function getActivePrice(
  symbol: string,
  activePrice?: ActivePrice,
  priceFactor: string = "1",
  type: ActivePriceType = "ACTIVE"
): string {
  const dUSDPrice = new BigNumber("1").multipliedBy(priceFactor).toFixed(8);
  if (symbol !== "DUSD") {
    return (
      (type === "ACTIVE"
        ? activePrice?.active?.amount
        : activePrice?.next?.amount) ?? "0"
    );
  }

  return dUSDPrice;
}
