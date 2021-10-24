import React, { useState } from 'react'
import { tailwind } from '@tailwind'
import BigNumber from 'bignumber.js'
import { ThemedView } from '@components/themed'
import { Tabs } from '@components/Tabs'
import { LoanCardOptions, LoanCards } from '@components/LoanCards'
import { Vaults } from '../components/Vaults'

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
  const [activeTab, setActiveTab] = useState(1)
  const onPress = (tabId: number): void => {
    setActiveTab(tabId)
  }
  const tabSections = [{
    id: 1,
    label: 'Browse loans',
    isActive: true,
    disabled: false,
    handleOnPress: onPress
  }, {
    id: 2,
    label: 'Your vaults',
    isActive: false,
    disabled: false,
    handleOnPress: onPress
  }]

  return (
    <ThemedView style={tailwind('h-full')}>
      <Tabs tabSections={tabSections} activeTabId={activeTab} />
      {activeTab === 2 ? <Vaults /> : <LoanCards loans={loans} />}
    </ThemedView>
  )
}
