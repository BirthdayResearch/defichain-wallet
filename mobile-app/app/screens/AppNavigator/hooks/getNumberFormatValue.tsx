import BigNumber from "bignumber.js";

/**
 *
 * @returns
 * - when value is not NaN/null/"" returns rounded down value to the decimalScale
 * - otherwise returns 0 to the decimalScale
 */

export function getNumberFormatValue(
  value: string | number | BigNumber,
  decimalScale: number
): string {
  return BigNumber(value).isNaN()
    ? BigNumber("0").toFixed(decimalScale)
    : BigNumber(value).toFixed(decimalScale);
}
