import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import {
  NavigationProp,
  useIsFocused,
  useNavigation
} from '@react-navigation/native'
import { useEffect, useState, useLayoutEffect, useCallback } from 'react'
import * as React from 'react'
import BigNumber from 'bignumber.js'
import { useSelector, useDispatch } from 'react-redux'
import { View } from '@components'
import {
  SkeletonLoader,
  SkeletonLoaderScreen
} from '@components/SkeletonLoader'
import { ThemedScrollView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from './DexNavigator'
import { DisplayDexGuidelinesPersistence } from '@api'
import { DexGuidelines } from './DexGuidelines'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { Tabs } from '@components/Tabs'
import { fetchTokens, tokensSelector, WalletToken } from '@store/wallet'
import { RootState } from '@store'
import { HeaderSearchIcon } from '@components/HeaderSearchIcon'
import { HeaderSearchInput } from '@components/HeaderSearchInput'
import { EmptyActivePoolpair } from './components/EmptyActivePoolPair'
import { debounce } from 'lodash'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { ButtonGroupTabKey, PoolPairCards } from './components/PoolPairCards/PoolPairCards'
import { SwapButton } from './components/SwapButton'

enum TabKey {
  YourPoolPair = 'YOUR_POOL_PAIRS',
  AvailablePoolPair = 'AVAILABLE_POOL_PAIRS'
}

interface DexItem<T> {
  type: 'your' | 'available'
  data: T
}

export function DexScreen (): JSX.Element {
  const logger = useLogger()
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const dispatch = useDispatch()
  const isFocused = useIsFocused()
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const [activeTab, setActiveTab] = useState<string>(TabKey.AvailablePoolPair)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [displayGuidelines, setDisplayGuidelines] = useState<boolean>(true)
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const blockCount = useSelector((state: RootState) => state.block.count)
  const {
    poolpairs: pairs,
    hasFetchedPoolpairData
  } = useSelector(
    (state: RootState) => state.wallet
  )
  const yourLPTokens = useSelector(() => {
    const _yourLPTokens: Array<DexItem<WalletToken>> = tokens
      .filter(({ isLPS }) => isLPS)
      .map((data) => ({
        type: 'your',
        data: data
      }))
    return _yourLPTokens
  })
  const onTabChange = (tabKey: TabKey): void => {
    setActiveTab(tabKey)
  }

  const tabsList = [
    {
      id: TabKey.AvailablePoolPair,
      label: translate('screens/DexScreen', 'Browse pool pairs'),
      disabled: false,
      handleOnPress: () => onTabChange(TabKey.AvailablePoolPair)
    },
    {
      id: TabKey.YourPoolPair,
      label: translate('screens/DexScreen', 'Your pool pairs'),
      disabled: false,
      handleOnPress: () => onTabChange(TabKey.YourPoolPair)
    }
  ]

  const onAdd = (data: PoolPairData): void => {
    navigation.navigate({
      name: 'AddLiquidity',
      params: { pair: data },
      merge: true
    })
  }

  const onRemove = (data: PoolPairData): void => {
    navigation.navigate({
      name: 'RemoveLiquidity',
      params: { pair: data },
      merge: true
    })
  }

  const onSwap = (data: PoolPairData): void => {
    navigation.navigate({
      name: 'CompositeSwap',
      params: { pair: data },
      merge: true
    })
  }

  // Search
  const [showSearchInput, setShowSearchInput] = useState(false)
  const [searchString, setSearchString] = useState('')
  const [filteredAvailablePairs, setFilteredAvailablePairs] =
    useState<Array<DexItem<PoolPairData>>>(pairs)
  const [isSearching, setIsSearching] = useState(false)
  const handleFilter = useCallback(
    debounce((searchString: string) => {
      setIsSearching(false)
      setFilteredAvailablePairs(
        pairs.filter((pair) =>
          pair.data.displaySymbol
            .toLowerCase()
            .includes(searchString.trim().toLowerCase())
        ).sort((firstPair, secondPair) =>
          new BigNumber(secondPair.data.totalLiquidity.usd ?? 0).minus(firstPair.data.totalLiquidity.usd ?? 0).toNumber() ??
          new BigNumber(secondPair.data.id).minus(firstPair.data.id).toNumber()
        )
      )
    }, 500),
    [activeTab, pairs, yourLPTokens]
  )
  const [activeButtonGroup, setActiveButtonGroup] = useState<ButtonGroupTabKey>(ButtonGroupTabKey.AllPairs)
  const handleButtonFilter = useCallback((buttonGroupTabKey: ButtonGroupTabKey) => {
    const filteredPairs = pairs.filter((pair) => {
      const tokenADisplaySymbol = pair.data.tokenA.displaySymbol
      const tokenBDisplaySymbol = pair.data.tokenB.displaySymbol

      switch (buttonGroupTabKey) {
        case ButtonGroupTabKey.DFIPairs:
          return tokenADisplaySymbol.includes('DFI') || tokenBDisplaySymbol.includes('DFI')

        case ButtonGroupTabKey.DUSDPairs:
          return tokenADisplaySymbol.includes('DUSD') || tokenBDisplaySymbol.includes('DUSD')

        default:
          return true
      }
    }).sort((firstPair, secondPair) =>
      new BigNumber(secondPair.data.totalLiquidity.usd ?? 0).minus(firstPair.data.totalLiquidity.usd ?? 0).toNumber() ??
      new BigNumber(secondPair.data.id).minus(firstPair.data.id).toNumber()
    )
    setFilteredAvailablePairs(
      filteredPairs
    )
  },
    [pairs, yourLPTokens]
  )

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchTokens({
        client,
        address
      }))
    }
  }, [address, blockCount, isFocused])

  useEffect(() => {
    DisplayDexGuidelinesPersistence.get()
      .then((shouldDisplayGuidelines: boolean) => {
        setDisplayGuidelines(shouldDisplayGuidelines)
      })
      .catch(logger.error)
      .finally(() => setIsLoaded(true))
  }, [])

  useEffect(() => {
    setIsSearching(true)
    handleFilter(searchString)
  }, [searchString, hasFetchedPoolpairData])

  // Update local state - filter available pair when pairs update
  useEffect(() => {
    if (searchString !== undefined && searchString.trim().length > 0) {
      handleFilter(searchString)
    }
    // else {
    //   handleButtonFilter(activeButtonGroup)
    // }
  }, [pairs])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: (): JSX.Element => {
        if (!displayGuidelines) {
          return (
            <HeaderSearchIcon
              onPress={() => setShowSearchInput(true)}
              testID='dex_search_icon'
              style={tailwind('pl-4')}
            />
          )
        }
        return <></>
      },
      headerRight: (): JSX.Element => {
        if (!displayGuidelines) {
          return <SwapButton />
        }
        return <></>
      }
    })
  }, [navigation, displayGuidelines])

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
            placeholder='Search for pool pairs'
            testID='dex_search_input'
          />
        )
      })
    } else {
      navigation.setOptions({
        header: undefined
      })
    }
  }, [showSearchInput, searchString])

  const onGuidelinesClose = async (): Promise<void> => {
    await DisplayDexGuidelinesPersistence.set(false)
    setDisplayGuidelines(false)
  }

  if (!isLoaded) {
    return <></>
  }

  if (displayGuidelines) {
    return <DexGuidelines onClose={onGuidelinesClose} />
  }

  return (
    <>
      <Tabs tabSections={tabsList} testID='dex_tabs' activeTabKey={activeTab} />
      <View style={tailwind('flex-1')}>
        {activeTab === TabKey.AvailablePoolPair &&
          (!hasFetchedPoolpairData || isSearching) && (
            <ThemedScrollView contentContainerStyle={tailwind('p-4')}>
              <SkeletonLoader row={4} screen={SkeletonLoaderScreen.Dex} />
            </ThemedScrollView>
          )}
        {activeTab === TabKey.AvailablePoolPair &&
          hasFetchedPoolpairData &&
          !isSearching && (
            <PoolPairCards
              availablePairs={filteredAvailablePairs}
              yourPairs={yourLPTokens}
              onAdd={onAdd}
              onRemove={onRemove}
              onSwap={onSwap}
              type='available'
              setIsSearching={setIsSearching}
              searchString={searchString}
              buttonGroupOptions={{
                activeButtonGroup: activeButtonGroup,
                setActiveButtonGroup: setActiveButtonGroup,
                onButtonGroupPress: handleButtonFilter
              }}
              showSearchInput={showSearchInput}
            />
          )}

        {activeTab === TabKey.YourPoolPair && yourLPTokens.length === 0 && (
          <EmptyActivePoolpair />
        )}
        {activeTab === TabKey.YourPoolPair && yourLPTokens.length > 0 && (
          <PoolPairCards
            availablePairs={filteredAvailablePairs}
            yourPairs={yourLPTokens}
            onAdd={onAdd}
            onRemove={onRemove}
            onSwap={onSwap}
            type='your'
            setIsSearching={setIsSearching}
            searchString={searchString}
          />
        )}
      </View>
    </>
  )
}
