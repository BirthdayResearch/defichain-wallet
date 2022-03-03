import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedView } from '@components/themed'
import { Tabs } from '@components/Tabs'
import { Vaults } from './components/Vaults'
import { EmptyVault } from './components/EmptyVault'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { batch, useDispatch, useSelector } from 'react-redux'
import { RootState } from '@store'
import { fetchLoanSchemes, fetchLoanTokens, fetchVaults, loanTokensSelector } from '@store/loans'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { LoanCards } from './components/LoanCards'
import { StackScreenProps } from '@react-navigation/stack'
import { LoanParamList } from './LoansNavigator'
import { HeaderSearchIcon } from '@components/HeaderSearchIcon'
import { HeaderSearchInput } from '@components/HeaderSearchInput'
import { debounce } from 'lodash'
import { LoanToken } from '@defichain/whale-api-client/dist/api/loan'
import { useIsFocused } from '@react-navigation/native'

enum TabKey {
  BrowseLoans = 'BROWSE_LOANS',
  YourVaults = 'YOUR_VAULTS'
}

type Props = StackScreenProps<LoanParamList, 'LoansScreen'>

export function LoansScreen ({ navigation }: Props): JSX.Element {
  const { address } = useWalletContext()
  const isFocused = useIsFocused()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const {
    vaults,
    hasFetchedVaultsData,
    hasFetchedLoansData
  } = useSelector((state: RootState) => state.loans)
  const loans = useSelector((state: RootState) => loanTokensSelector(state.loans))
  const [activeTab, setActiveTab] = useState<string>(TabKey.YourVaults)
  const dispatch = useDispatch()
  const client = useWhaleApiClient()
  const onPress = (tabId: string): void => {
    if (tabId === TabKey.YourVaults) {
      setShowSearchInput(false)
    } else if (searchString !== '') {
      setShowSearchInput(true)
    } else {
      // no-op: maintain search input state if no query
    }
    setActiveTab(tabId)
  }
  const tabsList = [{
    id: TabKey.YourVaults,
    label: 'Your vaults',
    disabled: false,
    handleOnPress: onPress
  }, {
    id: TabKey.BrowseLoans,
    label: 'Browse loan tokens',
    disabled: false,
    handleOnPress: onPress
  }]

  // Search
  const [filteredLoans, setFilteredLoans] = useState<LoanToken[]>(loans)
  const [showSeachInput, setShowSearchInput] = useState(false)
  const [searchString, setSearchString] = useState('')
  const handleFilter = useCallback(
    debounce((searchString: string) => {
      setFilteredLoans(loans.filter(loan =>
        loan.token.displaySymbol.toLowerCase().includes(searchString.trim().toLowerCase())
      ))
    }, 500)
    , [loans, hasFetchedLoansData])

  useEffect(() => {
    if (loans.length === 0) {
      return
    }
    handleFilter(searchString)
  }, [searchString])

  useEffect(() => {
    setFilteredLoans(loans)
  }, [hasFetchedLoansData])

  useEffect(() => {
    if (isFocused) {
      batch(() => {
        dispatch(fetchVaults({ address, client }))
        dispatch(fetchLoanTokens({ client }))
      })
    }
  }, [blockCount, address, isFocused])

  useEffect(() => {
    dispatch(fetchLoanSchemes({ client }))
  }, [])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (): JSX.Element => {
        if (activeTab === TabKey.BrowseLoans && vaults.length !== 0) {
          return (
            <HeaderSearchIcon testID='header_loans_search' onPress={() => setShowSearchInput(true)} />
          )
        } else {
          return (
            <TouchableOpacity
              // eslint-disable-next-line
              onPress={() => navigation.navigate({
                name: 'CreateVaultScreen',
                params: {},
                merge: true
              })}
              testID='create_vault_header_button'
            >
              <ThemedIcon
                size={28}
                style={tailwind('mr-2')} light={tailwind('text-primary-500')}
                dark={tailwind('text-primary-500')} iconType='MaterialCommunityIcons' name='plus'
              />
            </TouchableOpacity>
          )
        }
      }
    })
  }, [navigation, activeTab, vaults])

  useEffect(() => {
    if (showSeachInput) {
      navigation.setOptions({
        header: (): JSX.Element => (
          <HeaderSearchInput
            searchString={searchString}
            onClearInput={() => setSearchString('')}
            onChangeInput={(text: string) => setSearchString(text)}
            onCancelPress={() => {
              setSearchString('')
              setShowSearchInput(false)
            }}
            placeholder='Search for loans'
            testID='loans_search_input'
          />
        )
      })
    } else {
      navigation.setOptions({
        header: undefined
      })
    }
  }, [showSeachInput, searchString])

  if (!hasFetchedVaultsData) {
    return (
      <View style={tailwind('mt-1')}>
        <SkeletonLoader
          row={3}
          screen={SkeletonLoaderScreen.Vault}
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
      (<LoanCards testID='loans_cards' loans={filteredLoans} />)}
    </ThemedView>
  )
}
