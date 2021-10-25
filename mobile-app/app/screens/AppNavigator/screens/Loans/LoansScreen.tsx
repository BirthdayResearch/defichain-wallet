import { LoanCardOptions, LoanCards } from '@components/LoanCards'
import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedView } from '@components/themed'

export function LoansScreen (): JSX.Element {
  const loans: LoanCardOptions[] = [
    {
      loanName: 'BTC',
      priceType: 'ACTIVE',
      price: new BigNumber('123.4567'),
      isVerified: true,
      interestRate: new BigNumber('1.2345'),
      onPress: () => {}
    },
    {
      loanName: 'BTC',
      priceType: 'NEXT',
      price: new BigNumber('123.4567'),
      isVerified: false,
      interestRate: new BigNumber('1.2345'),
      onPress: () => {}
    },
    {
      loanName: 'BTC',
      priceType: 'ACTIVE',
      price: new BigNumber('123.4567'),
      isVerified: true,
      interestRate: new BigNumber('1.2345'),
      onPress: () => {}
    }
  ]
  return (
    <ThemedView>
      <LoanCards loans={loans} />
    </ThemedView>
  )
}
