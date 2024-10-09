import BigNumber from "bignumber.js";

export interface CollateralizationRatioProps {
  colRatio: BigNumber;
  minColRatio: BigNumber;
  totalLoanAmount: BigNumber;
  totalCollateralValue?: BigNumber;
}

export interface CollateralizationRatioStats {
  atRiskThreshold: BigNumber;
  liquidatedThreshold: BigNumber;
  isInLiquidation: boolean;
  isAtRisk: boolean;
  isHealthy: boolean;
  isReady: boolean;
}

export enum VaultStatus {
  Empty = "EMPTY",
  Ready = "READY",
  Healthy = "HEALTHY",
  AtRisk = "AT RISK",
  Halted = "HALTED",
  NearLiquidation = "NEAR LIQUIDATION",
  Liquidated = "IN LIQUIDATION",
  Unknown = "UNKNOWN",
}

export interface VaultHealthItem {
  vaultStats: CollateralizationRatioStats;
  status: VaultStatus;
}
