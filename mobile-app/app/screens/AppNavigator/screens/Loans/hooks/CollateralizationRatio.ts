import { ThemedProps } from '@components/themed'
import BigNumber from 'bignumber.js'
import { tailwind } from '@tailwind'

export interface CollateralizationRatioProps {
  colRatio: BigNumber
  minColRatio: BigNumber
  totalLoanAmount: BigNumber
  totalCollateralValue?: BigNumber
}

export interface CollateralizationRatioStats {
  atRiskThreshold: BigNumber
  liquidatedThreshold: BigNumber
  isInLiquidation: boolean
  isAtRisk: boolean
  isHealthy: boolean
  isReady: boolean
}

export function useCollateralRatioStats ({
  colRatio,
  minColRatio,
  totalLoanAmount,
  totalCollateralValue
}: CollateralizationRatioProps): CollateralizationRatioStats {
  const atRiskThreshold = new BigNumber(minColRatio).multipliedBy(1.5)
  const liquidatedThreshold = new BigNumber(minColRatio).multipliedBy(1.25)
  const isInLiquidation = totalLoanAmount.gt(0) && colRatio.isLessThan(liquidatedThreshold)
  const isAtRisk = totalLoanAmount.gt(0) && colRatio.isLessThan(atRiskThreshold)
  return {
    atRiskThreshold,
    liquidatedThreshold,
    isInLiquidation,
    isAtRisk,
    isHealthy: !isInLiquidation && !isAtRisk && totalLoanAmount.gt(0),
    isReady: !isInLiquidation && !isAtRisk && totalLoanAmount.eq(0) && totalCollateralValue !== undefined && totalCollateralValue.gt(0)
  }
}

export function useCollateralizationRatioColor (props: CollateralizationRatioProps): ThemedProps {
  const style: ThemedProps = {}
  const stats = useCollateralRatioStats(props)

  if (stats.isInLiquidation) {
    style.light = tailwind('text-error-500')
    style.dark = tailwind('text-dfxpink-500')
  } else if (stats.isAtRisk) {
    style.light = tailwind('text-warning-500')
    style.dark = tailwind('text-dfxyellow-500')
  } else if (stats.isHealthy) {
    style.light = tailwind('text-success-500')
    style.dark = tailwind('text-darksuccess-100')
  }
  return style
}
