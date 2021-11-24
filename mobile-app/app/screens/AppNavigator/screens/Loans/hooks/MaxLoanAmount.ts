import { BigNumber } from '@defichain/jellyfish-json'

interface useMaxLoanAmountProps {
  totalCollateralValue: BigNumber
  totalLoanValue: BigNumber
  minColRatio: BigNumber
  vaultInterest: BigNumber
  loanInterest: BigNumber
  loanActivePrice: BigNumber
}

export function useMaxLoanAmount ({
  totalCollateralValue,
  totalLoanValue,
  minColRatio,
  vaultInterest,
  loanInterest,
  loanActivePrice
}: useMaxLoanAmountProps): BigNumber {
  const result = totalCollateralValue.dividedBy(minColRatio.dividedBy(100)).minus(totalLoanValue).dividedBy(
    loanActivePrice.multipliedBy(vaultInterest.plus(loanInterest).dividedBy(100).plus(1))
  )
  return result
}
