import { LoanVaultState } from "@defichain/whale-api-client/dist/api/loan";
import BigNumber from "bignumber.js";

import { VaultHealthItem, VaultStatus } from "../store/types/VaultStatus";
import { useCollateralRatioStats } from "./useCollateralizationRatio";

export function useVaultStatus(
  status: LoanVaultState | undefined,
  collateralRatio: BigNumber,
  minColRatio: BigNumber,
  totalLoanAmount: BigNumber,
  totalCollateralValue: BigNumber,
): VaultHealthItem {
  const colRatio = collateralRatio.gte(0) ? collateralRatio : new BigNumber(0);
  const stats = useCollateralRatioStats({
    colRatio,
    minColRatio,
    totalLoanAmount,
    totalCollateralValue,
  });
  let vaultStatus: VaultStatus;
  if (status === LoanVaultState.FROZEN) {
    vaultStatus = VaultStatus.Halted;
  } else if (status === LoanVaultState.UNKNOWN) {
    vaultStatus = VaultStatus.Unknown;
  } else if (status === LoanVaultState.IN_LIQUIDATION) {
    vaultStatus = VaultStatus.Liquidated;
  } else if (stats.isInLiquidation) {
    vaultStatus = VaultStatus.NearLiquidation;
  } else if (stats.isAtRisk) {
    vaultStatus = VaultStatus.AtRisk;
  } else if (stats.isHealthy) {
    vaultStatus = VaultStatus.Healthy;
  } else if (stats.isReady) {
    vaultStatus = VaultStatus.Ready;
  } else {
    vaultStatus = VaultStatus.Empty;
  }
  return {
    status: vaultStatus,
    vaultStats: stats,
  };
}
