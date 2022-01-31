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
  }): { conversionRate: BigNumber} => {
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

  return {
    conversionRate
  }
}
