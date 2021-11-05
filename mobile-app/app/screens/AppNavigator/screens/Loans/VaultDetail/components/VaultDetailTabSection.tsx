import { Tabs } from '@components/Tabs'
import { ThemedView } from '@components/themed'
import React, { useState } from 'react'
import { ActiveLoans } from './ActiveLoans'
import { EmptyActiveLoans } from './EmptyActiveLoans'

enum TabKey {
  ActiveLoans = 'ACTIVE_LOANS',
  Details = 'DETAILS',
  Collaterals = 'COLLATERALS',
  Auctions = 'AUCTIONS'
}

interface VaultDetailTabSectionProps {
  emptyActiveLoans?: boolean // TODO: remove hard-coded props
}

export function VaultDetailTabSection (props: VaultDetailTabSectionProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<string>(TabKey.ActiveLoans)
  const onPress = (tabId: string): void => {
    setActiveTab(tabId)
  }
  const vaultChildTabs = [
    {
      id: TabKey.ActiveLoans,
      label: 'Active loan',
      disabled: false,
      handleOnPress: onPress
    },
    {
      id: TabKey.Details,
      label: 'Details',
      disabled: false,
      handleOnPress: onPress
    },
    {
      id: TabKey.Collaterals,
      label: 'Collaterals',
      disabled: false,
      handleOnPress: onPress
    },
    {
      id: TabKey.Auctions,
      label: 'Auctions',
      disabled: true,
      handleOnPress: onPress
    }
  ]

  return (
    <>
      <Tabs tabSections={vaultChildTabs} activeTabKey={activeTab} testID='vault_detail_tabs' />
      {activeTab === TabKey.ActiveLoans && props.emptyActiveLoans === true &&
        (
          <ThemedView>
            <EmptyActiveLoans />
          </ThemedView>
        )}
      {activeTab === TabKey.ActiveLoans && props.emptyActiveLoans === false &&
        (
          <ThemedView>
            <ActiveLoans />
          </ThemedView>
        )}

    </>
  )
}
