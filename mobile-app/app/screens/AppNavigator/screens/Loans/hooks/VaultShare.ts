import BigNumber from 'bignumber.js'

export function useVaultShare (collateralAmount: BigNumber, factor: BigNumber, price: BigNumber, totalCollateralValue: BigNumber): BigNumber {
  const vaultShare = new BigNumber(collateralAmount).multipliedBy(price).multipliedBy(factor).dividedBy(totalCollateralValue)
  return BigNumber.max(BigNumber.min(1, vaultShare), 0).times(100)
}
