import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import BigNumber from 'bignumber.js'
import { LoanToken } from '@defichain/whale-api-client/dist/api/loan'
import { RootState } from '@store'
import { loanPaymentTokenActivePrice } from '@store/loans'
import { getActivePrice } from '../../Auctions/helpers/ActivePrice'
import { PaymentTokenProps } from '../screens/PaybackLoanScreen'

export const useLoanPaymentTokenRate = (props: {
  loanTokenAmountActivePriceInUSD: BigNumber
  selectedPaymentToken: PaymentTokenProps
  loanToken: LoanToken | undefined
  outstandingBalance: BigNumber
  amountToPay: BigNumber
  loanTokenBalance: BigNumber
  selectedPaymentTokenBalance: BigNumber
}): {
  conversionRate: BigNumber
  getAmounts: () => ({
    resultingBalance: BigNumber
    amountToPayInPaymentToken: BigNumber
    amountToPayInLoanToken: BigNumber
  })
} => {
  const paymentTokenActivePrice = useSelector((state: RootState) => loanPaymentTokenActivePrice(state.loans))
  const [conversionRate, setConversionRate] = useState(new BigNumber(1))

  useEffect(() => {
    const selectedPaymentTokenActivePriceInUSD = getActivePrice(props.selectedPaymentToken.tokenSymbol, paymentTokenActivePrice)
    const rate =
      props.selectedPaymentToken.tokenSymbol === props.loanToken?.token.symbol
        ? new BigNumber(1)
        : new BigNumber(props.loanTokenAmountActivePriceInUSD).div(selectedPaymentTokenActivePriceInUSD)
    setConversionRate(rate)
  }, [props.selectedPaymentToken, loanPaymentTokenActivePrice, paymentTokenActivePrice])

  const getAmounts = (): {
    resultingBalance: BigNumber
    amountToPayInPaymentToken: BigNumber
    amountToPayInLoanToken: BigNumber
  } => {
    const isDFI = props.selectedPaymentToken.tokenSymbol === 'DFI'
    // Loan token
    const penaltyOfOutstandingBalance = isDFI
      ? props.outstandingBalance.div(0.99).minus(props.outstandingBalance)
      : new BigNumber(0)
    const penaltyOfAmountToPay = isDFI
      ? props.amountToPay.div(0.99).minus(props.amountToPay)
      : new BigNumber(0)
    const minimumPenalty = BigNumber.max(BigNumber.min(penaltyOfOutstandingBalance, penaltyOfAmountToPay), 0)
    const amountToPayInLoanToken = props.amountToPay.plus(minimumPenalty)
    const outstandingBalanceInLoanToken = props.outstandingBalance.plus(minimumPenalty)

    // Payment token
    const penaltyOfOutstandingBalanceInPaymentToken = isDFI
      ? penaltyOfOutstandingBalance.multipliedBy(conversionRate)
      : new BigNumber(0)
    const penaltyOfAmountToPayInPaymentToken = isDFI
      ? penaltyOfAmountToPay.multipliedBy(conversionRate)
      : new BigNumber(0)
    const mininumPenaltyInPaymentToken = BigNumber.max(BigNumber.min(penaltyOfAmountToPayInPaymentToken, penaltyOfOutstandingBalanceInPaymentToken), 0)
    const amountToPayInPaymentToken = props.amountToPay.multipliedBy(conversionRate).plus(mininumPenaltyInPaymentToken)
    const outstandingBalanceInPaymentToken = props.outstandingBalance.multipliedBy(conversionRate).plus(mininumPenaltyInPaymentToken)

    //  Resulting Balance
    const resultingBalanceInLoanToken = props.loanTokenBalance.minus(BigNumber.min(amountToPayInLoanToken, outstandingBalanceInLoanToken))
    const resultingBalanceInPaymentToken = props.selectedPaymentTokenBalance.minus(BigNumber.min(amountToPayInPaymentToken, outstandingBalanceInPaymentToken))
    const resultingBalance = BigNumber.max(isDFI ? resultingBalanceInPaymentToken : resultingBalanceInLoanToken, 0)

    return {
      resultingBalance,
      amountToPayInPaymentToken,
      amountToPayInLoanToken
    }
  }

  return {
    conversionRate,
    getAmounts
  }
}
