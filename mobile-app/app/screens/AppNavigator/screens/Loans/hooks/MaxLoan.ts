import { LoanVaultTokenAmount } from '@defichain/whale-api-client/dist/api/loan'
import BigNumber from 'bignumber.js'
import { getActivePrice } from '../../Auctions/helpers/ActivePrice'

interface useMaxLoanProps {
  totalCollateralValue: BigNumber
  collateralAmounts: LoanVaultTokenAmount[]
  existingLoanValue: BigNumber
  minColRatio: BigNumber
  loanActivePrice?: BigNumber
  interestPerBlock?: BigNumber
}

/**
 * To calculate max loan based on two conditions:
 * 1. Max loan amount <= Total col value / min col ratio
 * 2. Max loan amount <= 2 * (DFI col value + DUSD col value) / min col ratio
 *
 * The lower value from one of these two conditions will be used as the max loan amount.
 *
 * Return max loan amount if `loanActivePrice` is passed, max loan value otherwise.
 */
export function useMaxLoan ({
  totalCollateralValue,
  collateralAmounts,
  existingLoanValue,
  minColRatio,
  loanActivePrice = new BigNumber(1),
  interestPerBlock = new BigNumber(0)
}: useMaxLoanProps): BigNumber {
  // 1st condition
  const maxLoanBoundedByColRatio = totalCollateralValue.dividedBy(minColRatio.dividedBy(100)).minus(existingLoanValue).dividedBy(
    loanActivePrice).dividedBy(interestPerBlock.plus(1))

  // 2nd condition
  const getSpecialCollateralValue = (): BigNumber => {
    const dfiCollateral = collateralAmounts.find(colAmount => colAmount.displaySymbol === 'DFI')
    const dfiCollateralValue = new BigNumber(dfiCollateral?.amount ?? 0).multipliedBy(getActivePrice('DFI', dfiCollateral?.activePrice))
    const dusdCollateral = collateralAmounts.find(colAmount => colAmount.displaySymbol === 'DUSD')
    const dusdCollateralValue = new BigNumber(dusdCollateral?.amount ?? 0).multipliedBy(getActivePrice('DUSD'))
    return dfiCollateralValue.plus(dusdCollateralValue)
  }

  const maxLoanBoundedByColCondition = getSpecialCollateralValue().multipliedBy(2).dividedBy(minColRatio.dividedBy(100)).minus(existingLoanValue).dividedBy(loanActivePrice)
  return maxLoanBoundedByColRatio.isLessThanOrEqualTo(maxLoanBoundedByColCondition) ? maxLoanBoundedByColRatio : maxLoanBoundedByColCondition
}
