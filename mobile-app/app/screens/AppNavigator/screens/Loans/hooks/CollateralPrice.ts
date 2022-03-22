import BigNumber from 'bignumber.js'
import { CollateralItem } from '@screens/AppNavigator/screens/Loans/screens/EditCollateralScreen'
import { LoanVaultActive, CollateralToken, LoanVaultTokenAmount } from '@defichain/whale-api-client/dist/api/loan'
import { TokenData } from '@defichain/whale-api-client/dist/api/tokens'
import { getActivePrice } from '../../Auctions/helpers/ActivePrice'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'

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
  collateralValue: BigNumber,
  collateralTokenSymbol?: string,
  updatedCollateralAmount?: BigNumber
): {requiredVaultShareTokens: string[], isValidCollateralRatio: boolean} {
  const collateralTokens = useSelector((state: RootState) => state.loans.collateralTokens)
  const { isFeatureAvailable } = useFeatureFlagContext()
  const requiredVaultShareTokens = ['DFI', 'DUSD']
  if (!isFeatureAvailable('usdt_vault_share')) {
    return {
      requiredVaultShareTokens,
      isValidCollateralRatio: true
    }
  }
  const requiredTokensShareValue = collateralAmounts
    .reduce((share, collateral) => {
      if (requiredVaultShareTokens.includes(collateral.symbol)) {
        const collateralItem = collateralTokens.find((col) => col.token.id === collateral.id)
        const amount = collateral.symbol === collateralTokenSymbol ? updatedCollateralAmount : collateral.amount
        const price = (collateralItem !== undefined) ? getCollateralPrice(new BigNumber(amount ?? 0), collateralItem, new BigNumber(collateralValue)) : null
        return share.plus(price?.vaultShare ?? 0)
      }
      return share
    }, new BigNumber(0)) ?? new BigNumber(0)
  return {
    requiredVaultShareTokens,
    isValidCollateralRatio: requiredTokensShareValue?.gte(50)
  }
}
