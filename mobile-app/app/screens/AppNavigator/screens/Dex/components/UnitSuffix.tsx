import BigNumber from 'bignumber.js'

interface UnitSuffixProps {
  value?: number | string
  units: Record<number, string>
  noSuffixSpacing?: boolean
  prefix?: string
}

export function UnitSuffixPrefix (props: UnitSuffixProps): JSX.Element {
  if (props.value === undefined) {
    return <></>
  }

  const value = new BigNumber(props.value)
  const places = value.e !== null ? Math.floor(value.e / 3) : 0
  let suffix = `${props.units[places * 3] ?? ''}`
  suffix = (props.noSuffixSpacing !== undefined && props.noSuffixSpacing) ? `${suffix}` : ` ${suffix}`

  return (
    <>
      {value.dividedBy(Math.pow(1000, places))
        .toFormat(2, {
          decimalSeparator: '.',
          suffix: suffix,
          prefix: props.prefix
        })}
    </>
  )
}
