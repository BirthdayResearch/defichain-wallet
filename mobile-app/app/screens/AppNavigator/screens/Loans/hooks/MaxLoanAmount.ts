import BigNumber from 'bignumber.js'

interface useMaxLoanAmountProps {
  totalCollateralValue: BigNumber
  existingLoanValue: BigNumber
  minColRatio: BigNumber
  loanActivePrice: BigNumber
  interestPerBlock: BigNumber
}

export function useMaxLoanAmount ({
  totalCollateralValue,
  existingLoanValue,
  minColRatio,
  loanActivePrice,
  interestPerBlock
}: useMaxLoanAmountProps): BigNumber {
  return totalCollateralValue.dividedBy(minColRatio.dividedBy(100)).minus(existingLoanValue).dividedBy(
    loanActivePrice).dividedBy(interestPerBlock.plus(1))
}
