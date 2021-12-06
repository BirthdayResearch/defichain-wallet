import BigNumber from 'bignumber.js'
import { useVaultShare } from '@screens/AppNavigator/screens/Loans/hooks/VaultShare'
import { CollateralItem } from '@screens/AppNavigator/screens/Loans/screens/EditCollateralScreen'

interface CollateralPrice {
  activePrice: BigNumber
  collateralPrice: BigNumber
  vaultShare: BigNumber
  collateralFactor: BigNumber
}

export function useCollateralPrice (amount: BigNumber, collateralItem: CollateralItem, totalCollateralValue: BigNumber): CollateralPrice {
  const activePrice = new BigNumber(collateralItem.activePrice?.active?.amount ?? 0)
  const collateralPrice = new BigNumber(activePrice).multipliedBy(amount)
  const collateralFactor = new BigNumber(collateralItem?.factor ?? 0)
  const vaultShare = useVaultShare(new BigNumber(amount), collateralFactor, new BigNumber(activePrice), new BigNumber(totalCollateralValue.isZero() ? collateralPrice : totalCollateralValue))
  return {
    activePrice,
    collateralPrice,
    vaultShare,
    collateralFactor
  }
}

export function useResultingCollateralRatio (collateralValue: BigNumber, existingLoanValue: BigNumber, newLoanAmount: BigNumber, activePrice: BigNumber, interestPerBlock: BigNumber): BigNumber {
  return new BigNumber(collateralValue).dividedBy(
    new BigNumber(existingLoanValue).plus(newLoanAmount.multipliedBy(interestPerBlock.plus(1)).multipliedBy(
      activePrice))).multipliedBy(100)
}
