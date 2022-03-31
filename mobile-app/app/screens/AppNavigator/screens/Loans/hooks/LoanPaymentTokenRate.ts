import { useSelector } from 'react-redux'
import BigNumber from 'bignumber.js'
import { RootState } from '@store'
import { loanPaymentTokenActivePrices } from '@store/loans'
import { getActivePrice } from '../../Auctions/helpers/ActivePrice'
import { tokensSelector, WalletToken } from '@store/wallet'

export interface PaymentTokenProps {
  tokenId: string
  tokenSymbol: string
  tokenDisplaySymbol: string
  tokenBalance: BigNumber
}

interface GetAmountProps {
  paymentTokenAmounts: Array<{
    amountToPayInLoanToken: BigNumber
    amountToPayInPaymentToken: BigNumber
    cappedAmount: BigNumber
    outstandingBalanceInPaymentToken: BigNumber
    paymentToken: PaymentTokenProps
  }>
}

export const useLoanPaymentTokenRate = (props: {
  loanTokenAmountActivePriceInUSD: BigNumber
  loanToken: {
    id: string
    displaySymbol: string
    symbol: string
  }
  outstandingBalance: BigNumber
  amountToPay: BigNumber
  loanTokenBalance: BigNumber
}): {
  getPaymentTokens: () => GetAmountProps
  getPaymentPenalty: (paymentTokenSymbol: string) => BigNumber
} => {
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const paymentTokenActivePrices = useSelector((state: RootState) => loanPaymentTokenActivePrices(state.loans)) // DFI
  const paymentTokens = _getPaymentTokens({
    ...props.loanToken
  }, props.loanTokenBalance, tokens)

  const getPaymentPenalty = (paymentTokenSymbol: string): BigNumber => {
    const paymentTokenActivePriceInUSD = getActivePrice(paymentTokenSymbol ?? '', paymentTokenActivePrices[`${paymentTokenSymbol}-USD`] ?? undefined)

    const hasPenalty = paymentTokenSymbol === 'DFI' || (paymentTokenSymbol === 'DUSD' && props.loanToken.symbol !== 'DUSD')
    if (!hasPenalty) {
      return new BigNumber(0)
    }

    const conversionRate = paymentTokenSymbol === props.loanToken.symbol || paymentTokenSymbol === 'DUSD'
      ? new BigNumber(1)
      : new BigNumber(props.loanTokenAmountActivePriceInUSD).div(paymentTokenActivePriceInUSD)
    const penaltyOfOutstandingBalance = props.outstandingBalance.div(0.99).minus(props.outstandingBalance)
    const penaltyOfAmountToPay = props.amountToPay.div(0.99).minus(props.amountToPay)

    if (paymentTokenSymbol === props.loanToken.symbol) {
      const cappedPenalty = BigNumber.max(BigNumber.min(penaltyOfOutstandingBalance, penaltyOfAmountToPay), 0)
      return cappedPenalty
    }

    const penaltyOfOutstandingBalanceInPaymentToken = penaltyOfOutstandingBalance.multipliedBy(conversionRate)
    const penaltyOfAmountToPayInPaymentToken = penaltyOfAmountToPay.multipliedBy(conversionRate)
    const cappedPenaltyInPaymentToken = BigNumber.max(BigNumber.min(penaltyOfAmountToPayInPaymentToken, penaltyOfOutstandingBalanceInPaymentToken), 0)

    return cappedPenaltyInPaymentToken
  }

  const getPaymentTokens = (): GetAmountProps => {
    const paymentTokenAmounts = paymentTokens.map(paymentToken => {
      const paymentTokenActivePriceInUSD = getActivePrice(paymentToken.tokenSymbol ?? '', paymentTokenActivePrices[`${paymentToken.tokenSymbol}-USD`] ?? undefined)
      const paymentTokenConversionRate = paymentToken.tokenSymbol === props.loanToken.symbol || paymentToken.tokenSymbol === 'DUSD'
        ? new BigNumber(1)
        : new BigNumber(props.loanTokenAmountActivePriceInUSD).div(paymentTokenActivePriceInUSD)

      const loanTokenConversionRate = paymentToken.tokenSymbol === props.loanToken.symbol || paymentToken.tokenSymbol === 'DUSD'
        ? new BigNumber(1)
        : new BigNumber(paymentTokenActivePriceInUSD).div(props.loanTokenAmountActivePriceInUSD)
      const amountToPayInLoanToken = props.amountToPay.multipliedBy(loanTokenConversionRate)// .plus(cappedPenalty)
      const outstandingBalanceInLoanToken = props.outstandingBalance.multipliedBy(loanTokenConversionRate) // .plus(cappedPenalty)
      const cappedAmountInLoanToken = BigNumber.min(props.loanTokenBalance, outstandingBalanceInLoanToken)

      // Payment Token
      const amountToPayInPaymentToken = props.amountToPay// .plus(cappedPenaltyInPaymentToken)
      const outstandingBalanceInPaymentToken = props.outstandingBalance.multipliedBy(paymentTokenConversionRate)// .plus(cappedPenaltyInPaymentToken)
      const cappedAmountInPaymentToken = BigNumber.min(paymentToken.tokenBalance, outstandingBalanceInPaymentToken)

      return {
        amountToPayInLoanToken,
        amountToPayInPaymentToken,
        cappedAmount: props.loanToken.symbol !== paymentToken.tokenSymbol ? cappedAmountInPaymentToken : cappedAmountInLoanToken,
        outstandingBalanceInPaymentToken,
        paymentToken
      }
    })

    return {
      paymentTokenAmounts
    }
  }

  return {
    getPaymentTokens,
    getPaymentPenalty
  }
}

const _getPaymentTokens = (loanToken: { id: string, symbol: string, displaySymbol: string }, tokenBalance: BigNumber, tokens: WalletToken[]): PaymentTokenProps[] => {
  const paymentTokens = [{
    tokenId: loanToken.id,
    tokenSymbol: loanToken.symbol,
    tokenDisplaySymbol: loanToken.displaySymbol,
    tokenBalance: tokenBalance
  }]

  /*
    Feature: Allow DFI payments on DUSD loans
  */
  if (loanToken.displaySymbol === 'DUSD') {
    return [...paymentTokens, {
      tokenId: '0_unified',
      tokenSymbol: 'DFI',
      tokenDisplaySymbol: 'DFI',
      tokenBalance: getTokenAmount('0_unified', tokens)
    }]
  }

  /*
    Feature: Allow DUSD payment on all loans (hardfork)
  */
  return [...paymentTokens, {
    tokenId: '15',
    tokenSymbol: 'DUSD',
    tokenDisplaySymbol: 'DUSD',
    tokenBalance: getTokenAmount('15', tokens)
  }]
}

const getTokenAmount = (tokenId: string, tokens: WalletToken[]): BigNumber => {
  const id = tokenId === '0' ? '0_unified' : tokenId
  return new BigNumber(tokens.find((t) => t.id === id)?.amount ?? 0)
}
