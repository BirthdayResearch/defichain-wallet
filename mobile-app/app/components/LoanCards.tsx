import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedScrollView } from './themed'
import { tailwind } from '@tailwind'

interface LoanCardsProps {
  cards: CardOptions[]
}

interface CardOptions {
  label: string
  activePrice: BigNumber
  isVerified: boolean
  interestRate: BigNumber
}

export function LoanCards (props: LoanCardsProps): JSX.Element {
  return (
    <ThemedScrollView
      contentContainerStyle={tailwind('p-4')}
    />
  )
}
