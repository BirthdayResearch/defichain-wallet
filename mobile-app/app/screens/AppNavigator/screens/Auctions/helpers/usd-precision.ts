import BigNumber from 'bignumber.js'

export function getUSDPrecisedPrice (value: string | number | BigNumber, denominationCurrency?: string): string {
  const usdValue = new BigNumber(value)

  if (denominationCurrency === undefined || denominationCurrency === 'USDT') {
    return usdValue.isLessThanOrEqualTo(0.1) ? usdValue.toFixed(8) : usdValue.toFixed(2)
  } else {
    // return 8 decimal points for token denomination
    return usdValue.toFixed(8)
  }
}
