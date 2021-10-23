import * as React from 'react'
import { tailwind } from '@tailwind'
import BigNumber from 'bignumber.js'
import { ThemedView } from '@components/themed'
import { LoanCardOptions, LoanCards } from '@components/LoanCards'

// TODO(pierregee): Remove hardcoded loans once the API is ready
const loans: LoanCardOptions[] = [
  {
  loanName: 'dGOOGL',
  priceType: 'ACTIVE',
  price: new BigNumber('2600.00'),
  isVerified: true,
  interestRate: new BigNumber('2.00'),
  onPress: () => {}
  },
  {
    loanName: 'dTSLA',
    priceType: 'NEXT',
    price: new BigNumber('2500.00'),
    isVerified: false,
    interestRate: new BigNumber('50.00'),
    onPress: () => {}
  }
  ]

export function LoansScreen (): JSX.Element {
  return (
    <ThemedView style={tailwind('h-full')}>
      <LoanCards loans={loans} />
    </ThemedView>
  )
}
