import BigNumber from 'bignumber.js'
import { useVaultShare } from '@screens/AppNavigator/screens/Loans/hooks/VaultShare'
import { CollateralItem } from '@screens/AppNavigator/screens/Loans/screens/EditCollateralScreen'
import { LoanVaultActive, CollateralToken } from '@defichain/whale-api-client/dist/api/loan'
import { TokenData } from '@defichain/whale-api-client/dist/api/tokens'
import { getActivePrice } from '../../Auctions/helpers/ActivePrice'

interface CollateralPrice {
  activePrice: BigNumber
  collateralPrice: BigNumber
  vaultShare: BigNumber
  collateralFactor: BigNumber
}

interface TotalCollateralValueProps {
  vault: LoanVaultActive
  token: TokenData
  isAdd: boolean
  collateralInputValue: string | number
  activePriceAmount: BigNumber
}

export function useCollateralPrice (amount: BigNumber, collateralItem: CollateralItem | CollateralToken, totalCollateralValue: BigNumber): CollateralPrice {
  const activePrice = new BigNumber(getActivePrice(collateralItem.token.symbol, collateralItem.activePrice))
  const collateralPrice = activePrice.multipliedBy(amount)
  const collateralFactor = new BigNumber(collateralItem?.factor ?? 0)
  const vaultShare = useVaultShare(amount, collateralFactor, activePrice, new BigNumber(totalCollateralValue.isZero() ? collateralPrice : totalCollateralValue))
  return {
    activePrice,
    collateralPrice,
    vaultShare,
    collateralFactor
  }
}

export function useTotalCollateralValue ({ vault, token, isAdd, collateralInputValue, activePriceAmount }: TotalCollateralValueProps): { totalCollateralValueInUSD: BigNumber} {
  let totalCollateralValueInUSD =
    vault?.collateralAmounts.reduce((total, collateral) => {
      let newColValue = new BigNumber(collateral.amount)
      if (collateral.symbol === token.symbol && isAdd) {
        newColValue = new BigNumber(collateral.amount).plus(collateralInputValue)
      } else if (collateral.symbol === token.symbol && !isAdd) {
        newColValue = new BigNumber(collateral.amount).minus(collateralInputValue)
      }

      return total.plus(new BigNumber(newColValue).multipliedBy(getActivePrice(collateral.symbol, collateral.activePrice)))
    }, new BigNumber(0))

  if (!vault?.collateralAmounts.some(collateralAmount => collateralAmount.id === token.id)) {
    totalCollateralValueInUSD = totalCollateralValueInUSD.plus(new BigNumber(collateralInputValue).multipliedBy(activePriceAmount))
  }

  return { totalCollateralValueInUSD }
}

export function useResultingCollateralRatio (collateralValue: BigNumber, existingLoanValue: BigNumber, newLoanAmount: BigNumber, activePrice: BigNumber, interestPerBlock: BigNumber): BigNumber {
  return new BigNumber(collateralValue).dividedBy(
    new BigNumber(existingLoanValue).plus(newLoanAmount.multipliedBy(interestPerBlock.plus(1)).multipliedBy(
      activePrice))).multipliedBy(100)
}
