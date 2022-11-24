import { ThemedProps } from "@components/themed";
import BigNumber from "bignumber.js";
import { getColor, tailwind } from "@tailwind";
import { VaultStatus } from "@screens/AppNavigator/screens/Loans/VaultStatusTypes";

export interface CollateralizationRatioProps {
  colRatio: BigNumber;
  minColRatio: BigNumber;
  totalLoanAmount: BigNumber;
  totalCollateralValue?: BigNumber;
}

export interface CollateralizationRatioStats {
  isInLiquidation: boolean;
  isAtRisk: boolean;
  isHealthy: boolean;
  isReady: boolean;
}

export function useCollateralRatioStats({
  colRatio,
  minColRatio,
  totalLoanAmount,
  totalCollateralValue,
}: CollateralizationRatioProps): CollateralizationRatioStats {
  const { atRiskThreshold, liquidatedThreshold } =
    useColRatioThreshold(minColRatio);
  const isInLiquidation =
    totalLoanAmount.gt(0) && colRatio.isLessThan(liquidatedThreshold);
  const isAtRisk =
    totalLoanAmount.gt(0) && colRatio.isLessThan(atRiskThreshold);
  return {
    isInLiquidation,
    isAtRisk,
    isHealthy: !isInLiquidation && !isAtRisk && totalLoanAmount.gt(0),
    isReady:
      !isInLiquidation &&
      !isAtRisk &&
      totalLoanAmount.eq(0) &&
      totalCollateralValue !== undefined &&
      totalCollateralValue.gt(0),
  };
}

export function useColRatioThreshold(minColRatio: BigNumber) {
  const atRiskThreshold = new BigNumber(minColRatio).multipliedBy(1.5);
  const liquidatedThreshold = new BigNumber(minColRatio).multipliedBy(1.25);
  return { atRiskThreshold, liquidatedThreshold };
}

export function useCollateralizationRatioColor(
  props: CollateralizationRatioProps
): ThemedProps {
  const style: ThemedProps = {};
  const stats = useCollateralRatioStats(props);

  if (stats.isInLiquidation) {
    style.light = tailwind("text-red-v2");
    style.dark = tailwind("text-red-v2");
  } else if (stats.isAtRisk) {
    style.light = tailwind("text-orange-v2");
    style.dark = tailwind("text-orange-v2");
  } else if (stats.isHealthy || stats.isReady) {
    style.light = tailwind("text-green-v2");
    style.dark = tailwind("text-green-v2");
  }
  return style;
}

export function useResultingCollateralizationRatioByCollateral({
  collateralValue,
  collateralRatio,
  minCollateralRatio,
  totalLoanAmount,
  numOfColorBars = 6,
  totalCollateralValueInUSD,
}: {
  collateralValue: string;
  collateralRatio: BigNumber;
  minCollateralRatio: BigNumber;
  totalLoanAmount: BigNumber;
  totalCollateralValue?: BigNumber;
  numOfColorBars: number;
  totalCollateralValueInUSD: BigNumber;
}): {
  resultingColRatio: BigNumber;
  displayedColorBars: number;
} {
  const hasCollateralRatio =
    !new BigNumber(collateralRatio).isNaN() &&
    new BigNumber(collateralRatio).isPositive();
  const resultingColRatio =
    collateralValue === "" ||
    !hasCollateralRatio ||
    new BigNumber(collateralValue).isZero()
      ? new BigNumber(collateralRatio)
      : totalCollateralValueInUSD.dividedBy(totalLoanAmount).multipliedBy(100);

  const numOfColorBarPerStatus = numOfColorBars / 3; // (3): liquidation, at risk, healthy
  const healthyThresholdRatio = 1.75;
  const atRiskThresholdRatio = 1.5;
  const liquidatedThresholdRatio = 1.25;
  const atRiskThreshold = new BigNumber(minCollateralRatio).multipliedBy(
    atRiskThresholdRatio
  );
  const liquidatedThreshold = new BigNumber(minCollateralRatio).multipliedBy(
    liquidatedThresholdRatio
  );

  const isAtRisk =
    totalLoanAmount.gt(0) && resultingColRatio.isLessThan(atRiskThreshold);
  const isInLiquidation =
    totalLoanAmount.gt(0) && resultingColRatio.isLessThan(liquidatedThreshold);
  const isHealthy = !isInLiquidation && !isAtRisk && totalLoanAmount.gt(0);

  const getRatio = (): number => {
    if (isHealthy) {
      return healthyThresholdRatio;
    } else if (isAtRisk && !isInLiquidation) {
      return atRiskThresholdRatio;
    } else {
      return liquidatedThresholdRatio;
    }
  };

  const colorBarsCount = getColorBarsCount(
    numOfColorBarPerStatus,
    minCollateralRatio,
    resultingColRatio,
    getRatio(),
    isHealthy
  );

  let displayedColorBars = -1;

  if (resultingColRatio.isLessThanOrEqualTo(0)) {
    displayedColorBars = -1;
  } else if (isHealthy && colorBarsCount > 0) {
    displayedColorBars = colorBarsCount + numOfColorBarPerStatus * 2;
  } else if (isHealthy && colorBarsCount === -1) {
    displayedColorBars = numOfColorBars; // display full color bar
  } else if (isAtRisk && !isInLiquidation) {
    displayedColorBars = colorBarsCount + numOfColorBarPerStatus;
  } else {
    displayedColorBars = colorBarsCount;
  }

  return {
    displayedColorBars,
    resultingColRatio,
  };
}

const getColorBarsCount = (
  numOfColorBarPerStatus: number,
  minCollateralRatio: BigNumber,
  resultingCollateralRatio: BigNumber,
  thresholdRatio: number,
  isHealthy: boolean
): number => {
  let colorBarsCount = -1;
  let index = 1;
  while (colorBarsCount === -1 && index <= numOfColorBarPerStatus) {
    const colorBarMaxAmount = minCollateralRatio.plus(
      minCollateralRatio.multipliedBy(
        new BigNumber(thresholdRatio)
          .minus(1)
          .dividedBy(isHealthy ? 1 : numOfColorBarPerStatus)
          .times(index) // divide threshold to number of bars
      )
    );

    if (resultingCollateralRatio.isLessThanOrEqualTo(colorBarMaxAmount)) {
      colorBarsCount = index;
    }

    index += 1;
  }

  return colorBarsCount;
};

export function getVaultStatusColor(
  status: string | undefined,
  isLight: boolean,
  isText: boolean = false
): string {
  if (status === VaultStatus.NearLiquidation) {
    return isText ? "text-red-v2" : getColor("red-v2");
  } else if (status === VaultStatus.AtRisk) {
    return isText ? "text-orange-v2" : getColor("orange-v2");
  } else if (status === VaultStatus.Healthy || status === VaultStatus.Ready) {
    return isText ? "text-green-v2" : getColor("green-v2");
  }
  return isText
    ? isLight
      ? "text-mono-light-v2-500"
      : "text-mono-dark-v2-500"
    : getColor(isLight ? "mono-light-v2-300" : "mono-dark-v2-300");
}

export function getVaultStatusText(status: string | undefined): string {
  switch (status) {
    case VaultStatus.Ready:
      return "Ready";
    case VaultStatus.Halted:
      return "Halted";
    default:
      return "Empty";
  }
}

export function getProgress(
  collateralizationRatio: string,
  minCollateralizationRatio: string
): number {
  const atRiskThresholdMultiplier = 1.5;
  const minColRatio = new BigNumber(minCollateralizationRatio);
  const maxRatio = getMaxRatio(
    minColRatio.multipliedBy(atRiskThresholdMultiplier)
  );

  const currentValue = new BigNumber(collateralizationRatio)
    .minus(minColRatio)
    .dividedBy(new BigNumber(maxRatio).minus(minColRatio));

  if (currentValue.gt(1)) {
    return 1;
  } else if (currentValue.lt(0.01)) {
    // for display so that the UI still shows a bit of color
    return 0.01;
  } else {
    return BigNumber.min(currentValue, 1).toNumber();
  }
}

function getMaxRatio(atRiskThreshold: BigNumber): number {
  const healthyScaleRatio = 0.75;
  return atRiskThreshold
    .dividedBy(new BigNumber(1).minus(healthyScaleRatio))
    .toNumber();
}
