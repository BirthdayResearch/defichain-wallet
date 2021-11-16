import { ThemedProps } from '@components/themed'
import BigNumber from 'bignumber.js'
import { tailwind } from '@tailwind'

interface UseCollateralizationRatioColorProps {
  value: string
  minColRatio: string
}

export function UseCollateralizationRatioColor (props: UseCollateralizationRatioColorProps): ThemedProps {
  const collateralizationRatio = new BigNumber(props.value)
  const style: ThemedProps = {}
  const atRiskThreshold = new BigNumber(props.minColRatio).multipliedBy(1.5)
  const liquidatedThreshold = new BigNumber(props.minColRatio).multipliedBy(1.25)

  if (collateralizationRatio.isLessThan(liquidatedThreshold)) {
    style.light = tailwind('text-error-500')
    style.dark = tailwind('text-darkerror-500')
  } else if (collateralizationRatio.isLessThan(atRiskThreshold)) {
    style.light = tailwind('text-warning-500')
    style.dark = tailwind('text-darkwarning-500')
  } else {
    style.light = tailwind('text-success-500')
    style.dark = tailwind('text-darksuccess-500')
  }
  return style
}
