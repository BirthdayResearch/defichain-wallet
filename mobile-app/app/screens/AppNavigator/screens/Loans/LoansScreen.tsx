import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { tailwind } from '@tailwind'
import { ThemedView } from '@components/themed'
import { Tabs } from '@components/Tabs'
import { Vaults } from './components/Vaults'
import { EmptyVault } from './components/EmptyVault'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { fetchLoanSchemes, fetchLoanTokens, fetchVaults } from '@store/loans'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { LoanCards } from './components/LoanCards'

enum TabKey {
  BrowseLoans = 'BROWSE_LOANS',
  YourVaults = 'YOUR_VAULTS'
}

export type LoadingState = 'empty_vault' | 'loading' | 'success'

export function LoansScreen (): JSX.Element {
  const { address } = useWalletContext()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const {
    vaults,
    loanTokens: loans,
    hasFetchedVaultsData,
    hasFetchedLoansData
  } = useSelector((state: RootState) => state.loans)
  const [activeTab, setActiveTab] = useState<string>(TabKey.BrowseLoans)
  const dispatch = useDispatch()
  const client = useWhaleApiClient()
  const onPress = (tabId: string): void => {
    setActiveTab(tabId)
  }

  useEffect(() => {
    dispatch(fetchVaults({
      address,
      client
    }))
    dispatch(fetchLoanTokens({ client }))
  }, [blockCount])

  useEffect(() => {
    dispatch(fetchLoanSchemes({ client }))
  }, [])

  const tabsList = [{
    id: TabKey.BrowseLoans,
    label: 'Browse loan tokens',
    disabled: false,
    handleOnPress: onPress
  }, {
    id: TabKey.YourVaults,
    label: 'Your vaults',
    disabled: false,
    handleOnPress: onPress
  }]

  if (!hasFetchedVaultsData) {
    return (
      <View style={tailwind('mt-1')}>
        <SkeletonLoader
          row={6}
          screen={SkeletonLoaderScreen.Loan}
        />
      </View>
)
  } else if (vaults?.length === 0) {
    return (
      <EmptyVault
        handleRefresh={() => {
        }}
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
      {activeTab === TabKey.BrowseLoans && !hasFetchedLoansData &&
      (
        <View style={tailwind('mt-1')}>
          <SkeletonLoader
            row={6}
            screen={SkeletonLoaderScreen.Loan}
          />
        </View>
      )}
      {activeTab === TabKey.BrowseLoans && hasFetchedLoansData &&
      (<LoanCards testID='loans_cards' loans={loans} />)}
    </ThemedView>
  )
}
