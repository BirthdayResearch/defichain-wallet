import BigNumber from "bignumber.js";

/**
 *
 * @returns
 * - 0.00000000 when value <= 0.1
 * - x.xx otherwise
 */
export function getPrecisedTokenValue(
  value: string | number | BigNumber
): string {
  BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });
  const usdValue = new BigNumber(value);
  return usdValue.isLessThanOrEqualTo(0.1)
    ? usdValue.toFixed(8)
    : usdValue.toFixed(2);
}

/**
 *
 * @returns
 * - 0.00 when value === 0
 * - 0.00000000 when value <= 0.1
 * - x.xx otherwise
 */
export function getPrecisedCurrencyValue(
  value: string | number | BigNumber
): string {
  BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });
  const currencyValue = new BigNumber(value);
  return currencyValue.isLessThanOrEqualTo(0.1) &&
    currencyValue.isGreaterThan(0)
    ? currencyValue.toFixed(8)
    : currencyValue.toFixed(2);
}
