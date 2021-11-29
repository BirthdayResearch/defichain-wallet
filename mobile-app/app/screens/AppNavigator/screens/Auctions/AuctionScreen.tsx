import React, { useEffect, useState } from 'react'
import { tailwind } from '@tailwind'
import { ThemedView } from '@components/themed'
import { Tabs } from '@components/Tabs'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { fetchAuctions } from '@store/auctions'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { BrowseAuctions } from './components/BrowseAuctions'
import { ManageBids } from './components/ManageBids'

enum TabKey {
  BrowseAuctions = 'BROWSE_AUCTIONS',
  ManageBids = 'MANAGE_BIDS'
}

export function AuctionsScreen (): JSX.Element {
  const blockCount = useSelector((state: RootState) => state.block.count)
  const [activeTab, setActiveTab] = useState<string>(TabKey.BrowseAuctions)
  const dispatch = useDispatch()
  const client = useWhaleApiClient()

  const onPress = (tabId: string): void => {
    setActiveTab(tabId)
  }

  useEffect(() => {
    dispatch(fetchAuctions({ client }))
  }, [blockCount])

  const tabsList = [{
    id: TabKey.BrowseAuctions,
    label: 'Browse auctions',
    disabled: false,
    handleOnPress: onPress
  }, {
    id: TabKey.ManageBids,
    label: 'Manage bids',
    disabled: false,
    handleOnPress: onPress
  }]

  return (
    <ThemedView
      testID='auctions_screen'
      style={tailwind('flex-1')}
    >
      {/* TODO  Unable tabs when manage bids screen is ready */}
      {false && (
        <>
          <Tabs tabSections={tabsList} testID='auctions_tabs' activeTabKey={activeTab} />
          {activeTab === TabKey.BrowseAuctions && (<BrowseAuctions />)}
          {activeTab === TabKey.ManageBids && <ManageBids />}
        </>
      )}
      <BrowseAuctions />
    </ThemedView>
  )
}
