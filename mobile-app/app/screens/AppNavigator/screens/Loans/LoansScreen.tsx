import React, { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { tailwind } from '@tailwind'
import { ThemedView } from '@components/themed'
import { LoanCardOptions, LoanCards } from '@components/LoanCards'
import { Tabs } from '@components/Tabs'
import { Vaults } from './components/Vaults'
import { EmptyVault } from './components/EmptyVault'
import { StackScreenProps } from '@react-navigation/stack'
import { LoanParamList } from './LoansNavigator'

enum TabKey {
  BrowseLoans = 'BROWSE_LOANS',
  YourVaults = 'YOUR_VAULTS'
}

type Props = StackScreenProps<LoanParamList, 'LoansScreen'>

export function LoansScreen ({ route }: Props): JSX.Element {
  const [activeTab, setActiveTab] = useState<string>(TabKey.BrowseLoans)
  const [displayEmptyVault, setDisplayEmptyVault] = useState<boolean | undefined>(true) // TODO: remove temporary display flag
  const onPress = (tabId: string): void => {
    setActiveTab(tabId)
  }

  const tabsList = [{
    id: TabKey.BrowseLoans,
    label: 'Browse loans',
    disabled: false,
    handleOnPress: onPress
  }, {
    id: TabKey.YourVaults,
    label: 'Your vaults',
    disabled: false,
    handleOnPress: onPress
  }]

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

  // TODO: remove custom handling of empty vault display
  useEffect(() => {
    if (route.params?.displayEmptyVault === undefined) {
      setDisplayEmptyVault(true)
    } else {
      setDisplayEmptyVault(route.params.displayEmptyVault)
    }
  }, [route.params?.displayEmptyVault])

  if (displayEmptyVault === true) {
    return (
      <EmptyVault
        handleRefresh={() => {}}
        isLoading={false}
      />
    )
  }
  return (
    <ThemedView
      testID='loans_screen'
      style={tailwind('flex-1')}
    >
      <Tabs tabSections={tabsList} testID='loans_tabs' activeTabKey={activeTab} />
      {activeTab === TabKey.YourVaults ? <Vaults /> : <LoanCards testID='loans_cards' loans={loans} />}
    </ThemedView>
  )
}
