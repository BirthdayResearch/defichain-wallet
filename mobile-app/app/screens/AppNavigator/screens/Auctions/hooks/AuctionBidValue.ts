import { LoanVaultLiquidationBatch } from '@defichain/whale-api-client/dist/api/loan'
import BigNumber from 'bignumber.js'
import { getActivePrice } from '@screens/AppNavigator/screens/Auctions/helpers/ActivePrice'

interface AuctionBid {
  minStartingBidInToken: string
  totalLoanAmountInUSD: string
  minStartingBidInUSD: string
  minNextBidInToken: string
  minNextBidInUSD: string
  totalCollateralsValueInUSD: string
}

export function useAuctionBidValue (batch: LoanVaultLiquidationBatch, liquidationPenalty: number, schemeInterestRate: string): AuctionBid {
  const { loan, highestBid } = batch
  const LOAN_LIQUIDITY_PENALTY = new BigNumber(1).plus(new BigNumber(liquidationPenalty).div(100))
  const totalLoanAmountInToken = new BigNumber(loan.amount)
  const totalLoanAmountInUSD = totalLoanAmountInToken.times(getActivePrice(loan.symbol, loan.activePrice)).toFixed(2)
  const minStartingBidInToken = totalLoanAmountInToken.times(LOAN_LIQUIDITY_PENALTY)
  const minStartingBidInUSD = loan.activePrice?.active != null ? minStartingBidInToken.times(loan.activePrice.active.amount).toFixed(2) : ''
  const minNextBidInToken = highestBid?.amount?.amount != null ? new BigNumber(highestBid.amount.amount).times(1.01) : minStartingBidInToken
  const minNextBidInUSD = loan.activePrice?.active != null ? minNextBidInToken.times(loan.activePrice.active.amount).toFixed(2) : ''
  const totalCollateralsValueInUSD = batch.collaterals.reduce((total, eachItem) => {
    return total.plus(new BigNumber(eachItem.amount).multipliedBy(getActivePrice(eachItem.symbol, eachItem.activePrice)))
  }, new BigNumber(0)).toFixed(2)

  return {
    minNextBidInUSD,
    totalLoanAmountInUSD,
    minStartingBidInUSD,
    minStartingBidInToken: minStartingBidInToken.toFixed(8),
    minNextBidInToken: minNextBidInToken.toFixed(8),
    totalCollateralsValueInUSD
  }
}
