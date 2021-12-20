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
    style.dark = tailwind('text-darkerror-500')
  } else if (stats.isAtRisk) {
    style.light = tailwind('text-warning-500')
    style.dark = tailwind('text-darkwarning-500')
  } else if (stats.isHealthy) {
    style.light = tailwind('text-success-500')
    style.dark = tailwind('text-darksuccess-500')
  }
  return style
}

export function useResultingCollateralizationRatioByCollateral ({
  collateralValue,
  collateralRatio,
  minCollateralRatio,
  totalLoanAmount,
  numOfColorBars = 6,
  totalCollateralValueInUSD
}: {
  collateralValue: string
  collateralRatio: BigNumber
  minCollateralRatio: BigNumber
  totalLoanAmount: BigNumber
  totalCollateralValue?: BigNumber
  numOfColorBars: number
  totalCollateralValueInUSD: BigNumber
}): {
  resultingColRatio: BigNumber
  displayedColorBars: number
} {
  const hasCollateralRatio = !new BigNumber(collateralRatio).isNaN() && new BigNumber(collateralRatio).isPositive()
  const resultingColRatio = collateralValue === '' || !hasCollateralRatio
  ? new BigNumber(collateralRatio)
  : totalCollateralValueInUSD.dividedBy(totalLoanAmount).multipliedBy(100)

  const numOfColorBarPerStatus = numOfColorBars / 3 // (3): liquidation, at risk, healthy
  const healthyThresholdRatio = 1.75
  const atRiskThresholdRatio = 1.5
  const liquidatedThresholdRatio = 1.25
  const atRiskThreshold = new BigNumber(minCollateralRatio).multipliedBy(atRiskThresholdRatio)
  const liquidatedThreshold = new BigNumber(minCollateralRatio).multipliedBy(liquidatedThresholdRatio)

  const isAtRisk = totalLoanAmount.gt(0) && resultingColRatio.isLessThan(atRiskThreshold)
  const isInLiquidation = totalLoanAmount.gt(0) && resultingColRatio.isLessThan(liquidatedThreshold)
  const isHealthy = !isInLiquidation && !isAtRisk && totalLoanAmount.gt(0)

  const getRatio = (): number => {
    if (isHealthy) {
      return healthyThresholdRatio
    } else if (isAtRisk && !isInLiquidation) {
      return atRiskThresholdRatio
    } else {
      return liquidatedThresholdRatio
    }
  }

  const colorBarsCount = getColorBarsCount(
    numOfColorBarPerStatus,
    minCollateralRatio,
    resultingColRatio,
    getRatio(),
    isHealthy
  )

  let displayedColorBars = -1

  if (resultingColRatio.isLessThanOrEqualTo(0)) {
    displayedColorBars = -1
  } else if (isHealthy && colorBarsCount > 0) {
    displayedColorBars = colorBarsCount + (numOfColorBarPerStatus * 2)
  } else if (isHealthy && colorBarsCount === -1) {
    displayedColorBars = numOfColorBars // display full color bar
  } else if (isAtRisk && !isInLiquidation) {
    displayedColorBars = colorBarsCount + numOfColorBarPerStatus
  } else {
    displayedColorBars = colorBarsCount
  }

  return {
    displayedColorBars,
    resultingColRatio
  }
}

const getColorBarsCount = (
  numOfColorBarPerStatus: number,
  minCollateralRatio: BigNumber,
  resultingCollateralRatio: BigNumber,
  thresholdRatio: number,
  isHealthy: boolean
  ): number => {
  let colorBarsCount = -1
  let index = 1
  while (colorBarsCount === -1 && index <= numOfColorBarPerStatus) {
    const colorBarMaxAmount = minCollateralRatio.plus(minCollateralRatio.multipliedBy(
      new BigNumber(thresholdRatio).minus(1).dividedBy(isHealthy ? 1 : numOfColorBarPerStatus).times(index) // divide threshold to number of bars
    ))

    if (resultingCollateralRatio.isLessThanOrEqualTo(colorBarMaxAmount)) {
      colorBarsCount = index
    }

    index += 1
  }

  return colorBarsCount
}
