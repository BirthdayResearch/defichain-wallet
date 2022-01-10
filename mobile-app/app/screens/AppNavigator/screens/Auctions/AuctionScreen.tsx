import { useEffect, useLayoutEffect, useState } from 'react'
import { tailwind } from '@tailwind'
import { ThemedView } from '@components/themed'
import { Tabs } from '@components/Tabs'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { fetchAuctions } from '@store/auctions'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { StackScreenProps } from '@react-navigation/stack'
import { HeaderSearchInput } from '@components/HeaderSearchInput'
import { BrowseAuctions } from './components/BrowseAuctions'
import { ManageBids } from './components/ManageBids'
import { AuctionsParamList } from './AuctionNavigator'
import { HeaderSearchIcon } from '@components/HeaderSearchIcon'

enum TabKey {
  BrowseAuctions,
  ManageBids
}

type Props = StackScreenProps<AuctionsParamList, 'AuctionScreen'>

export function AuctionsScreen ({ navigation }: Props): JSX.Element {
  const blockCount = useSelector((state: RootState) => state.block.count)
  const [activeTab, setActiveTab] = useState<number>(TabKey.BrowseAuctions)
  const dispatch = useDispatch()
  const client = useWhaleApiClient()
  const { auctions } = useSelector((state: RootState) => state.auctions)

  // Search
  const [showSearchInput, setShowSearchInput] = useState(false)
  const [searchString, setSearchString] = useState('')

  const onPress = (tabId: number): void => {
    if (tabId === TabKey.ManageBids) {
      setShowSearchInput(false)
    } else if (searchString !== '') {
      setShowSearchInput(true)
    } else {
      // no-op: maintain search input state if no query
    }

    setActiveTab(tabId)
  }

  useEffect(() => {
    dispatch(fetchAuctions({ client }))
  }, [blockCount])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (): JSX.Element => {
        if (activeTab === TabKey.BrowseAuctions && auctions.length !== 0) {
          return (
            <HeaderSearchIcon onPress={() => setShowSearchInput(true)} />
          )
        }

        return <></>
      }
    })
  }, [navigation, activeTab, auctions])

  useEffect(() => {
    if (showSearchInput) {
      navigation.setOptions({
        header: (): JSX.Element => (
          <HeaderSearchInput
            searchString={searchString}
            onClearInput={() => setSearchString('')}
            onChangeInput={(text: string) => {
              setSearchString(text)
            }}
            onCancelPress={() => {
              setSearchString('')
              setShowSearchInput(false)
            }}
            placeholder='Search for loan token'
          />
        )
      })
    } else {
      navigation.setOptions({
        header: undefined
      })
    }
  }, [showSearchInput, searchString])

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
      <Tabs tabSections={tabsList} testID='auctions_tabs' activeTabKey={activeTab} />
      {activeTab === TabKey.BrowseAuctions && (<BrowseAuctions searchString={searchString} />)}
      {activeTab === TabKey.ManageBids && <ManageBids />}
    </ThemedView>
  )
}
