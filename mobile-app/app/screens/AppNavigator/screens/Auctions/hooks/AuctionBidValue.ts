import { LoanVaultLiquidationBatch } from '@defichain/whale-api-client/dist/api/loan'
import BigNumber from 'bignumber.js'

interface AuctionBid {
  minStartingBidInToken: string
  totalLoanAmountInUSD: string
  minStartingBidInUSD: string
  minNextBidInToken: string
  minNextBidInUSD: string
}

export function useAuctionBidValue (batch: LoanVaultLiquidationBatch, liquidationPenalty: number, schemeInterestRate: string): AuctionBid {
  const { loan, highestBid } = batch
  const LOAN_LIQUIDITY_PENALTY = new BigNumber(1).plus(new BigNumber(liquidationPenalty).div(100))
  const totalLoanAmountInToken = new BigNumber(loan.amount)
  const totalLoanAmountInUSD = totalLoanAmountInToken.times(loan.activePrice?.active?.amount ?? 0).toFixed(2)
  const minStartingBidInToken = totalLoanAmountInToken.times(LOAN_LIQUIDITY_PENALTY)
  const minStartingBidInUSD = loan.activePrice?.active != null ? minStartingBidInToken.times(loan.activePrice.active.amount).toFixed(2) : ''
  const minNextBidInToken = highestBid?.amount?.amount != null ? new BigNumber(highestBid.amount.amount).times(1.01) : minStartingBidInToken
  const minNextBidInUSD = loan.activePrice?.active != null ? minNextBidInToken.times(loan.activePrice.active.amount).toFixed(2) : ''
  return {
    minNextBidInUSD,
    totalLoanAmountInUSD,
    minStartingBidInUSD,
    minStartingBidInToken: minStartingBidInToken.toFixed(8),
    minNextBidInToken: minNextBidInToken.toFixed(8)
  }
}
