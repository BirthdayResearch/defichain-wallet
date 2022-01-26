import { LoanVaultLiquidationBatch } from '@defichain/whale-api-client/dist/api/loan'
import BigNumber from 'bignumber.js'
import { getActivePrice } from '@screens/AppNavigator/screens/Auctions/helpers/ActivePrice'
import { getUSDPrecisedPrice } from '@screens/AppNavigator/screens/Auctions/helpers/usd-precision'
import { useTokenPrice } from '../../Balances/hooks/TokenPrice'

interface AuctionBid {
  minStartingBidInToken: string
  totalLoanAmountInUSD: string
  minStartingBidInUSD: string
  minNextBidInToken: string
  minNextBidInUSD: string
  totalCollateralsValueInUSD: string
  hasFirstBid: boolean
}

export function useAuctionBidValue (batch: LoanVaultLiquidationBatch, liquidationPenalty: number): AuctionBid {
  const { loan, highestBid } = batch
  const { getTokenPrice } = useTokenPrice()
  const LOAN_LIQUIDITY_PENALTY = new BigNumber(1).plus(new BigNumber(liquidationPenalty).div(100))
  const totalLoanAmountInToken = new BigNumber(loan.amount)
  const totalLoanAmountInUSD = getUSDPrecisedPrice(totalLoanAmountInToken.times(getActivePrice(loan.symbol, loan.activePrice)))
  const minStartingBidInToken = totalLoanAmountInToken.times(LOAN_LIQUIDITY_PENALTY)
  const minStartingBidInUSD = loan.activePrice?.active != null ? getUSDPrecisedPrice(minStartingBidInToken.times(loan.activePrice.active.amount)) : ''
  const minNextBidInToken = highestBid?.amount?.amount != null ? new BigNumber(highestBid.amount.amount).times(1.01) : minStartingBidInToken
  const minNextBidInUSD = getUSDPrecisedPrice(getTokenPrice(batch.loan.symbol, minNextBidInToken))
  const totalCollateralsValueInUSD = getUSDPrecisedPrice(batch.collaterals.reduce((total, eachItem) => {
    return total.plus(new BigNumber(eachItem.amount).multipliedBy(getActivePrice(eachItem.symbol, eachItem.activePrice)))
  }, new BigNumber(0)))
  const hasFirstBid = highestBid?.amount?.amount !== undefined

  return {
    minNextBidInUSD,
    totalLoanAmountInUSD,
    minStartingBidInUSD,
    minStartingBidInToken: minStartingBidInToken.toFixed(8),
    minNextBidInToken: minNextBidInToken.toFixed(8),
    totalCollateralsValueInUSD,
    hasFirstBid
  }
}
