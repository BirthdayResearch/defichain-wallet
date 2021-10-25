import { LoanCardOptions, LoanCards } from '@components/LoanCards'
import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedView } from '@components/themed'
import { Tabs } from '@components/Tabs'

export function LoansScreen (): JSX.Element {
  const tabsList = [
    {
      label: 'Browse loans',
      isActive: true,
      disabled: false,
      handleOnPress: () => {}
    },
    {
      label: 'Your vaults',
      isActive: false,
      disabled: true,
      handleOnPress: () => {}
    }
  ]
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
    <ThemedView testID='loans_screen'>
      <Tabs tabSections={tabsList} testID='loans_tabs' />
      <LoanCards loans={loans} testID='loans_cards' />
    </ThemedView>
  )
}
