import BigNumber from 'bignumber.js'

export function useVaultShare (collateralAmount: BigNumber, factor: BigNumber, price: BigNumber, totalCollateralValue: BigNumber): BigNumber {
  return new BigNumber(collateralAmount ?? 0).multipliedBy(price ?? 0).multipliedBy(factor ?? 0).dividedBy(totalCollateralValue ?? 1).times(100)
}
