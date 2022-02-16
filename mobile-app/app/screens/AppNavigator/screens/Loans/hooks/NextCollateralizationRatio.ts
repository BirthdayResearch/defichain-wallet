import { LoanVaultTokenAmount } from '@defichain/whale-api-client/dist/api/loan'
import BigNumber from 'bignumber.js'
import { getActivePrice } from '../../Auctions/helpers/ActivePrice'

export function useNextCollateralizationRatio (collateralAmounts: LoanVaultTokenAmount[], loanAmounts: LoanVaultTokenAmount[]): BigNumber {
  const collaterals = collateralAmounts?.map(collateral => {
    return new BigNumber(collateral.amount).multipliedBy(getActivePrice(collateral.symbol, collateral.activePrice, 'NEXT'))
  })
  const loans = loanAmounts?.map(loan => {
    return new BigNumber(loan.amount).multipliedBy(getActivePrice(loan.symbol, loan.activePrice, 'NEXT'))
  })

  if (collaterals === undefined || loans === undefined || collaterals?.length === 0 || loans?.length === 0) {
    return new BigNumber(-1)
  }

  return collaterals?.reduce((prev, next) => prev.plus(next)).dividedBy(
    loans?.reduce((prev, next) => prev.plus(next))
  ).multipliedBy(100)
}
