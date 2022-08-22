import BigNumber from 'bignumber.js'

export function useUnitSuffix (units: Record<number, string>, value: string): string {
  const _value = new BigNumber(value)
  const places = _value.e !== null ? Math.floor(_value.e / 3) : 0
  const suffix = ` ${units[places * 3] ?? ''}`

  return _value.dividedBy(Math.pow(1000, places))
    .toFormat(2, {
      decimalSeparator: '.',
      suffix: suffix
    })
}
