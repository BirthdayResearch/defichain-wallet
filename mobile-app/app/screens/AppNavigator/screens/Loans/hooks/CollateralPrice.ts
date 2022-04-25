import BigNumber from 'bignumber.js'
import { CollateralItem } from '@screens/AppNavigator/screens/Loans/screens/EditCollateralScreen'
import { LoanVaultActive, CollateralToken, LoanVaultTokenAmount } from '@defichain/whale-api-client/dist/api/loan'
import { TokenData } from '@defichain/whale-api-client/dist/api/tokens'
import { getActivePrice } from '../../Auctions/helpers/ActivePrice'
import { useSelector } from 'react-redux'
import { RootState } from '@store'

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

export function getCollateralPrice (amount: BigNumber, collateralItem: CollateralItem | CollateralToken, totalCollateralValue: BigNumber): CollateralPrice {
  const activePrice = new BigNumber(getActivePrice(collateralItem.token.symbol, collateralItem.activePrice))
  const collateralPrice = activePrice.multipliedBy(amount)
  const collateralFactor = new BigNumber(collateralItem?.factor ?? 0)
  const vaultShare = getVaultShare(amount, collateralFactor, activePrice, new BigNumber(totalCollateralValue.isZero() ? collateralPrice : totalCollateralValue))
  return {
    activePrice,
    collateralPrice,
    vaultShare,
    collateralFactor
  }
}

export function getVaultShare (collateralAmount: BigNumber, factor: BigNumber, price: BigNumber, totalCollateralValue: BigNumber): BigNumber {
  const vaultShare = new BigNumber(collateralAmount).multipliedBy(price).multipliedBy(factor).dividedBy(totalCollateralValue)
  return BigNumber.max(BigNumber.min(1, vaultShare), 0).times(100)
}

export function useValidCollateralRatio (
  collateralAmounts: LoanVaultTokenAmount[],
  totalCollateralVaultValue: BigNumber,
  loanValue: BigNumber,
  collateralTokenId?: string,
  updatedCollateralAmount?: BigNumber
): {requiredVaultShareTokens: string[], minRequiredTokensShare: number, requiredTokensShare: BigNumber, hasLoan: boolean} {
  const minRequiredTokensShare = 50
  const requiredVaultShareTokens = ['DUSD', 'DFI']
  const collateralTokens = useSelector((state: RootState) => state.loans.collateralTokens)
  const requiredTokensShare = requiredVaultShareTokens.reduce((share, tokenSymbol) => {
    const collateralItem = collateralTokens.find((col) => col.token.symbol === tokenSymbol)
    if (collateralItem !== undefined) {
      const collateralToken = collateralAmounts.find((t) => t.symbol === tokenSymbol) ?? {
        ...collateralItem?.token,
        amount: '0'
      }
      const amount = collateralToken.id === collateralTokenId ? updatedCollateralAmount ?? 0 : collateralToken.amount
      const price = (collateralItem !== undefined) ? getCollateralPrice(new BigNumber(amount ?? 0), collateralItem, new BigNumber(totalCollateralVaultValue)) : { vaultShare: new BigNumber(0) }
      if (!price?.vaultShare?.isNaN()) {
        return share.plus(price?.vaultShare ?? 0)
      }
    }
    return share
  }, new BigNumber(0))
  return {
    requiredTokensShare,
    minRequiredTokensShare,
    requiredVaultShareTokens,
    hasLoan: new BigNumber(loanValue).gt(0)
  }
}
