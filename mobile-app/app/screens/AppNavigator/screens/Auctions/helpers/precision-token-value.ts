import BigNumber from 'bignumber.js'

export function getPrecisedTokenValue (value: string | number | BigNumber): string {
  const usdValue = new BigNumber(value)
  return usdValue.isLessThanOrEqualTo(0.1) ? usdValue.toFixed(8) : usdValue.toFixed(2)
}
