import { useSelector } from 'react-redux'
import BigNumber from 'bignumber.js'
import { LoanToken } from '@defichain/whale-api-client/dist/api/loan'
import { RootState } from '@store'
import { loanPaymentTokenActivePrice } from '@store/loans'
import { getActivePrice } from '../../Auctions/helpers/ActivePrice'
import { PaymentTokenProps } from '../screens/PaybackLoanScreen'
interface GetAmountProps {
  paymentTokenAmounts: Array<{
    resultingBalance: BigNumber
    amountToPayInPaymentToken: BigNumber
    amountToPayInLoanToken: BigNumber
    paymentToken: PaymentTokenProps
  }>
}

export const useLoanPaymentTokenRate = (props: {
  loanTokenAmountActivePriceInUSD: BigNumber
  paymentTokens: PaymentTokenProps[]
  loanToken: LoanToken | undefined
  outstandingBalance: BigNumber
  amountToPay: BigNumber
  loanTokenBalance: BigNumber
}): {
  getAmounts: () => GetAmountProps
} => {
  const paymentTokenActivePrice = useSelector((state: RootState) => loanPaymentTokenActivePrice(state.loans)) // DFI
  const getAmounts = (): GetAmountProps => {
    const paymentTokenAmounts = props.paymentTokens.map(paymentToken => {
      const paymentTokenActivePriceInUSD = getActivePrice(paymentToken.tokenSymbol ?? '', paymentTokenActivePrice) // DUSD, dTU10
      const conversionRate = paymentToken.tokenSymbol === props.loanToken?.token.symbol
        ? new BigNumber(1)
        : new BigNumber(props.loanTokenAmountActivePriceInUSD).div(paymentTokenActivePriceInUSD)
      const hasPenalty = paymentToken.tokenSymbol === 'DFI'
      // Loan token
      const penaltyOfOutstandingBalance = hasPenalty
        ? props.outstandingBalance.div(0.99).minus(props.outstandingBalance)
        : new BigNumber(0)
      const penaltyOfAmountToPay = hasPenalty
        ? props.amountToPay.div(0.99).minus(props.amountToPay)
        : new BigNumber(0)
      const minimumPenalty = BigNumber.max(BigNumber.min(penaltyOfOutstandingBalance, penaltyOfAmountToPay), 0)
      const amountToPayInLoanToken = props.amountToPay.plus(minimumPenalty)
      const outstandingBalanceInLoanToken = props.outstandingBalance.plus(minimumPenalty)

      // Payment token
      const penaltyOfOutstandingBalanceInPaymentToken = hasPenalty
        ? penaltyOfOutstandingBalance.multipliedBy(conversionRate)
        : new BigNumber(0)
      const penaltyOfAmountToPayInPaymentToken = hasPenalty
        ? penaltyOfAmountToPay.multipliedBy(conversionRate)
        : new BigNumber(0)
      const mininumPenaltyInPaymentToken = BigNumber.max(BigNumber.min(penaltyOfAmountToPayInPaymentToken, penaltyOfOutstandingBalanceInPaymentToken), 0)
      const amountToPayInPaymentToken = props.amountToPay.multipliedBy(conversionRate).plus(mininumPenaltyInPaymentToken)
      const outstandingBalanceInPaymentToken = props.outstandingBalance.multipliedBy(conversionRate).plus(mininumPenaltyInPaymentToken)

      // Resulting Balance
      const resultingBalanceInLoanToken = props.loanTokenBalance.minus(BigNumber.min(amountToPayInLoanToken, outstandingBalanceInLoanToken))
      const resultingBalanceInPaymentToken = paymentToken.tokenBalance.minus(BigNumber.min(amountToPayInPaymentToken, outstandingBalanceInPaymentToken))
      const resultingBalance = hasPenalty ? resultingBalanceInPaymentToken : resultingBalanceInLoanToken

      return {
        amountToPayInLoanToken,
        amountToPayInPaymentToken,
        paymentToken,
        resultingBalance
      }
    })

    return {
      paymentTokenAmounts
    }
  }

  return {
    getAmounts
  }
}
