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
     // Loan token
     const penaltyOfOutstandingBalance = props.selectedPaymentToken.tokenSymbol === 'DFI'
     ? props.outstandingBalance.div(0.99).minus(props.outstandingBalance)
: new BigNumber(0)
     const penaltyOfAmountToPay = props.selectedPaymentToken.tokenSymbol === 'DFI'
     ? props.amountToPay.div(0.99).minus(props.amountToPay)
: new BigNumber(0)
     const minimumPenalty = BigNumber.min(penaltyOfOutstandingBalance, penaltyOfAmountToPay)
     const amountToPayInLoanToken = props.amountToPay.plus(minimumPenalty)

     // Payment token
     const penaltyOfOutstandingBalanceInPaymentToken = props.selectedPaymentToken.tokenSymbol === 'DFI'
     ? (props.selectedPaymentTokenBalance.div(0.99).minus(props.selectedPaymentTokenBalance)).multipliedBy(conversionRate)
: new BigNumber(0)
     const penaltyOfAmountToPayInPaymentToken = props.selectedPaymentToken.tokenSymbol === 'DFI'
     ? (props.selectedPaymentTokenBalance.div(0.99).minus(props.selectedPaymentTokenBalance)).multipliedBy(conversionRate)
: new BigNumber(0)
     const mininumPenaltyInPaymentToken = BigNumber.min(penaltyOfAmountToPayInPaymentToken, penaltyOfOutstandingBalanceInPaymentToken)
     const amountToPayInPaymentToken = props.amountToPay.plus(mininumPenaltyInPaymentToken)

    //  Resulting Balance
     const resultingBalanceInLoanToken = props.loanTokenBalance.minus(amountToPayInLoanToken)
     const resultingBalanceInPaymentToken = props.selectedPaymentTokenBalance.minus(amountToPayInPaymentToken)
     const resultingBalance = BigNumber.max(props.selectedPaymentToken.tokenSymbol === 'DFI'
     ? resultingBalanceInPaymentToken
: resultingBalanceInLoanToken, 0)

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
