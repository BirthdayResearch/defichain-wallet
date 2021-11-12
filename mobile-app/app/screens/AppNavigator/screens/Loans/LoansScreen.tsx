import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import BigNumber from 'bignumber.js'
import { tailwind } from '@tailwind'
import { ThemedView } from '@components/themed'
import { Tabs } from '@components/Tabs'
import { Vaults } from './components/Vaults'
import { EmptyVault } from './components/EmptyVault'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { fetchVaults } from '@store/loans'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { LoanCardOptions, LoanCards } from './components/LoanCards'

enum TabKey {
  BrowseLoans = 'BROWSE_LOANS',
  YourVaults = 'YOUR_VAULTS'
}

export type LoadingState = 'empty_vault' | 'loading' | 'success'

export function LoansScreen (): JSX.Element {
  const { address } = useWalletContext()
  const vaults = useSelector((state: RootState) => state.loans.vaults)
  const [activeTab, setActiveTab] = useState<string>(TabKey.BrowseLoans)
  const dispatch = useDispatch()
  const client = useWhaleApiClient()
  const onPress = (tabId: string): void => {
    setActiveTab(tabId)
  }

  useEffect(() => {
    dispatch(fetchVaults({ address, client }))
  }, [])

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
      onPress: () => {},
      testID: 'loan_0'
    },
    {
      loanName: 'BTC',
      priceType: 'NEXT',
      price: new BigNumber('123.4567'),
      isVerified: false,
      interestRate: new BigNumber('1.2345'),
      onPress: () => {},
      testID: 'loan_1'
    },
    {
      loanName: 'BTC',
      priceType: 'ACTIVE',
      price: new BigNumber('123.4567'),
      isVerified: true,
      interestRate: new BigNumber('1.2345'),
      onPress: () => {},
      testID: 'loan_2'
    },
    {
      loanName: 'BTC',
      priceType: 'NEXT',
      price: new BigNumber('123.4567'),
      isVerified: false,
      interestRate: new BigNumber('1.2345'),
      onPress: () => {},
      testID: 'loan_3'
    },
    {
      loanName: 'BTC',
      priceType: 'ACTIVE',
      price: new BigNumber('123.4567'),
      isVerified: true,
      interestRate: new BigNumber('1.2345'),
      onPress: () => {},
      testID: 'loan_4'
    },
    {
      loanName: 'BTC',
      priceType: 'NEXT',
      price: new BigNumber('123.4567'),
      isVerified: false,
      interestRate: new BigNumber('1.2345'),
      onPress: () => {},
      testID: 'loan_5'
    },
    {
      loanName: 'BTC',
      priceType: 'ACTIVE',
      price: new BigNumber('123.4567'),
      isVerified: true,
      interestRate: new BigNumber('1.2345'),
      onPress: () => {},
      testID: 'loan_6'
    },
    {
      loanName: 'BTC',
      priceType: 'NEXT',
      price: new BigNumber('123.4567'),
      isVerified: false,
      interestRate: new BigNumber('1.2345'),
      onPress: () => {},
      testID: 'loan_7'
    },
    {
      loanName: 'BTC',
      priceType: 'ACTIVE',
      price: new BigNumber('123.4567'),
      isVerified: true,
      interestRate: new BigNumber('1.2345'),
      onPress: () => {},
      testID: 'loan_8'
    },
    {
      loanName: 'BTC',
      priceType: 'NEXT',
      price: new BigNumber('123.4567'),
      isVerified: false,
      interestRate: new BigNumber('1.2345'),
      onPress: () => {},
      testID: 'loan_9'
    },
    {
      loanName: 'BTC',
      priceType: 'ACTIVE',
      price: new BigNumber('123.4567'),
      isVerified: true,
      interestRate: new BigNumber('1.2345'),
      onPress: () => {},
      testID: 'loan_10'
    }
  ]

  if (vaults?.length === 0) {
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
      {activeTab === TabKey.YourVaults && <Vaults />}
      {activeTab === TabKey.BrowseLoans
        ? (
          <View style={tailwind('mt-1')}>
            <SkeletonLoader
              row={6}
              screen={SkeletonLoaderScreen.Loan}
            />
          </View>
          )
        : (
          <LoanCards
            testID='loans_cards'
            loans={loans}
          />
        )}
    </ThemedView>
  )
}
