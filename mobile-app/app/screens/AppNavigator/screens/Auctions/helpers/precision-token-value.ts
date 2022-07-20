import BigNumber from 'bignumber.js'

// display 0.00000000 when value is 0
export function getPrecisedTokenValue (value: string | number | BigNumber): string {
  const usdValue = new BigNumber(value)
  return usdValue.isLessThanOrEqualTo(0.1) ? usdValue.toFixed(8) : usdValue.toFixed(2)
}

// display 0.00 when value is 0
export function getPrecisedCurrencyValue (value: string | number | BigNumber): string {
  const currencyValue = new BigNumber(value)
  return currencyValue.isLessThanOrEqualTo(0.1) && currencyValue.isGreaterThan(0)
    ? currencyValue.toFixed(8)
: currencyValue.toFixed(2)
}
