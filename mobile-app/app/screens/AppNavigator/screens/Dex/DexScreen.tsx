import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import {
  NavigationProp,
  useNavigation
} from '@react-navigation/native'
import { useEffect, useState, useCallback } from 'react'
import * as React from 'react'
import BigNumber from 'bignumber.js'
import { useSelector } from 'react-redux'
import { View } from '@components'
import {
  SkeletonLoader,
  SkeletonLoaderScreen
} from '@components/SkeletonLoader'
import { ThemedIcon, ThemedScrollViewV2, ThemedTextV2, ThemedTouchableOpacityV2, ThemedViewV2 } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from './DexNavigator'
import { tokensSelector, WalletToken } from '@store/wallet'
import { RootState } from '@store'
import { EmptyActivePoolpair } from './components/EmptyActivePoolPair'
import { debounce } from 'lodash'
import { ButtonGroupTabKey, PoolPairCards } from './components/PoolPairCards/PoolPairCards'
import { ButtonGroupV2 } from './components/ButtonGroupV2'
import { HeaderSearchInputV2 } from '@components/HeaderSearchInputV2'
import { useFavouritePoolpairs } from './hook/FavouritePoolpairs'
import { ScrollView } from 'react-native'
import { AssetsFilterItem } from '../Portfolio/components/AssetsFilterRow'

enum TabKey {
  YourPoolPair = 'YOUR_POOL_PAIRS',
  AvailablePoolPair = 'AVAILABLE_POOL_PAIRS'
}

interface DexItem<T> {
  type: 'your' | 'available'
  data: T
}

export function DexScreen (): JSX.Element {
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const [activeTab, setActiveTab] = useState<string>(TabKey.AvailablePoolPair)
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const [expandedCardIds, setExpandedCardIds] = useState<string[]>([])

  const onButtonGroupChange = (buttonGroupTabKey: ButtonGroupTabKey): void => {
    setExpandedCardIds([])
    setActiveButtonGroup(buttonGroupTabKey)
    handleButtonFilter(buttonGroupTabKey)
  }

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
      label: translate('screens/DexScreen', 'Available pairs'),
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

  const onAdd = (data: PoolPairData, info: WalletToken): void => {
    navigation.navigate({
      name: 'AddLiquidity',
      params: { pair: data, pairInfo: info },
      merge: true
    })
  }

  const onRemove = (data: PoolPairData, info: WalletToken): void => {
    navigation.navigate({
      name: 'RemoveLiquidity',
      params: { pair: data, pairInfo: info },
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showSearchInput, setShowSearchInput] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchString, setSearchString] = useState('')
  const [filteredAvailablePairs, setFilteredAvailablePairs] =
    useState<Array<DexItem<PoolPairData>>>(pairs)
  const [isSearching, setIsSearching] = useState(false)
  const handleFilter = useCallback(
    debounce((searchString: string) => {
      setIsSearching(false)
      if (searchString !== undefined && searchString.trim().length > 0) {
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
      } else {
        setFilteredAvailablePairs([])
      }
    }, 500),
    [activeTab, pairs]
  )

  useEffect(() => {
    if (showSearchInput) {
      navigation.setOptions({
        header: (): JSX.Element => (
          <ThemedViewV2>
            <ThemedViewV2
              light={tailwind('bg-mono-light-v2-00 border-mono-light-v2-100')}
              dark={tailwind('bg-mono-dark-v2-00 border-mono-dark-v2-100')}
              style={tailwind('pb-5 rounded-b-2xl border-b')}
            >
              <HeaderSearchInputV2
                searchString={searchString}
                onClearInput={() => setSearchString('')}
                onChangeInput={(text: string) => {
                  setSearchString(text)
                }}
                onCancelPress={() => {
                  setSearchString('')
                  setShowSearchInput(false)
                }}
                placeholder='Search pool pair'
                testID='dex_search_input'
              />
            </ThemedViewV2>
          </ThemedViewV2>
        )
      })
    } else {
      navigation.setOptions({
        header: undefined
      })
      handleButtonFilter(activeButtonGroup)
    }
  }, [showSearchInput, searchString])

  const [activeButtonGroup, setActiveButtonGroup] = useState<ButtonGroupTabKey>(ButtonGroupTabKey.AllPairs)
  const { isFavouritePoolpair } = useFavouritePoolpairs()

  const handleButtonFilter = useCallback((buttonGroupTabKey: ButtonGroupTabKey) => {
    const filteredPairs = pairs.filter((pair) => {
      const tokenADisplaySymbol = pair.data.tokenA.displaySymbol
      const tokenBDisplaySymbol = pair.data.tokenB.displaySymbol

      switch (buttonGroupTabKey) {
        case ButtonGroupTabKey.DFIPairs:
          return tokenADisplaySymbol.includes('DFI') || tokenBDisplaySymbol.includes('DFI')

        case ButtonGroupTabKey.DUSDPairs:
          return tokenADisplaySymbol.includes('DUSD') || tokenBDisplaySymbol.includes('DUSD')

        case ButtonGroupTabKey.FavouritePairs:
          return isFavouritePoolpair(pair.data.id)

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
    [pairs]
  )

  useEffect(() => {
    if (showSearchInput) {
      setIsSearching(true)
      handleFilter(searchString)
    }
  }, [searchString, hasFetchedPoolpairData])

  // Update local state - filter available pair when pairs update
  useEffect(() => {
    if (!showSearchInput) {
      handleButtonFilter(activeButtonGroup)
      return
    }

    if (searchString !== undefined && searchString.trim().length > 0) {
      handleFilter(searchString)
    }
  }, [pairs])

  const onSearchBtnPress = (): void => {
    setShowSearchInput(true)
    setFilteredAvailablePairs([])
  }

  // Top Liquidity pairs
  const [topLiquidityPairs, setTopLiquidityPairs] = useState<Array<DexItem<PoolPairData>>>(pairs)
  useEffect(() => {
    const sorted = pairs
      .map(item => item)
      .sort((firstPair, secondPair) =>
      new BigNumber(secondPair.data.totalLiquidity.usd ?? 0).minus(firstPair.data.totalLiquidity.usd ?? 0).toNumber() ??
      new BigNumber(secondPair.data.id).minus(firstPair.data.id).toNumber()
      )
      .slice(0, 5)
    setTopLiquidityPairs(sorted)
  }, [pairs])

  // New pool pairs
  const [newPoolsPairs, setNewPoolsPairs] = useState<Array<DexItem<PoolPairData>>>(pairs)
  useEffect(() => {
    const sorted = pairs
      .map(item => item)
      .slice(-5)
    setNewPoolsPairs(sorted)
  }, [pairs])

  return (
    <ThemedViewV2
      light={tailwind('bg-mono-light-v2-100')}
      dark={tailwind('bg-mono-dark-v2-100')}
      style={tailwind('flex-1')}
    >
      {showSearchInput
      ? (
        <View style={tailwind('px-10 mt-8 mb-2')}>
          <ThemedTextV2
            light={tailwind('text-mono-light-v2-700')}
            dark={tailwind('text-mono-dark-v2-700')}
            style={tailwind('font-normal-v2 text-xs')}
            testID='search_title'
          >
            {searchString?.trim().length > 0
            ? translate('screens/DexScreen', 'Search results for “{{input}}”', { input: searchString?.trim() })
            : translate('screens/DexScreen', 'Search for pool pair with token name')}
          </ThemedTextV2>
        </View>)
      : (
        <>
          <ThemedViewV2
            light={tailwind('bg-mono-light-v2-00 border-mono-light-v2-100')}
            dark={tailwind('bg-mono-dark-v2-00 border-mono-dark-v2-100')}
            style={tailwind('flex flex-col items-center pt-4 rounded-b-2xl border-b')}
          >
            <View style={tailwind('w-full px-5')}>
              <ButtonGroupV2
                buttons={tabsList}
                activeButtonGroupItem={activeTab}
                testID='dex_tabs'
                lightThemeStyle={tailwind('bg-transparent')}
                darkThemeStyle={tailwind('bg-transparent')}
              />
            </View>
          </ThemedViewV2>
          {activeTab === TabKey.AvailablePoolPair &&
            <DexFilterPillGroup
              onSearchBtnPress={onSearchBtnPress}
              onButtonGroupChange={onButtonGroupChange}
              activeButtonGroup={activeButtonGroup}
            />}
        </>
      )}
      <View style={tailwind('flex-1')}>
        {activeTab === TabKey.AvailablePoolPair &&
          (!hasFetchedPoolpairData || isSearching) && (
            <ThemedScrollViewV2 contentContainerStyle={tailwind('p-4')}>
              <SkeletonLoader row={4} screen={SkeletonLoaderScreen.Dex} />
            </ThemedScrollViewV2>
          )}
        {activeTab === TabKey.AvailablePoolPair &&
          hasFetchedPoolpairData &&
          !isSearching && (
            <PoolPairCards
              expandedCardIds={expandedCardIds}
              setExpandedCardIds={setExpandedCardIds}
              availablePairs={filteredAvailablePairs}
              yourPairs={yourLPTokens}
              onAdd={onAdd}
              onRemove={onRemove}
              onSwap={onSwap}
              type='available'
              setIsSearching={setIsSearching}
              searchString={searchString}
              showSearchInput={showSearchInput}
              topLiquidityPairs={topLiquidityPairs}
              newPoolsPairs={newPoolsPairs}
            />
          )}

        {activeTab === TabKey.YourPoolPair && yourLPTokens.length === 0 && (
          <EmptyActivePoolpair />
        )}
        {activeTab === TabKey.YourPoolPair && yourLPTokens.length > 0 && (
          <PoolPairCards
            expandedCardIds={expandedCardIds}
            setExpandedCardIds={setExpandedCardIds}
            availablePairs={filteredAvailablePairs}
            yourPairs={yourLPTokens}
            onAdd={onAdd}
            onRemove={onRemove}
            onSwap={onSwap}
            type='your'
            setIsSearching={setIsSearching}
            searchString={searchString}
            showSearchInput={showSearchInput}
            topLiquidityPairs={topLiquidityPairs}
            newPoolsPairs={newPoolsPairs}
          />
        )}
      </View>
    </ThemedViewV2>
  )
}

const DexFilterPillGroup = React.memo((props: {
  onSearchBtnPress: () => void
  onButtonGroupChange: (buttonGroupTabKey: ButtonGroupTabKey) => void
  activeButtonGroup: ButtonGroupTabKey
}) => {
  const buttonGroup = [
    {
      id: ButtonGroupTabKey.AllPairs,
      label: translate('screens/DexScreen', 'All pairs'),
      handleOnPress: () => props.onButtonGroupChange(ButtonGroupTabKey.AllPairs)
    },
    {
      id: ButtonGroupTabKey.DFIPairs,
      label: translate('screens/DexScreen', 'DFI pairs'),
      handleOnPress: () => props.onButtonGroupChange(ButtonGroupTabKey.DFIPairs)
    },
    {
      id: ButtonGroupTabKey.DUSDPairs,
      label: translate('screens/DexScreen', 'DUSD pairs'),
      handleOnPress: () => props.onButtonGroupChange(ButtonGroupTabKey.DUSDPairs)
    },
    {
      id: ButtonGroupTabKey.FavouritePairs,
      label: translate('screens/DexScreen', 'Favourites'),
      handleOnPress: () => props.onButtonGroupChange(ButtonGroupTabKey.FavouritePairs)
    }
  ]
  return (
    <View style={tailwind('my-4')}>
      <ThemedViewV2 testID='dex_button_group'>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tailwind('flex justify-between items-center flex-row px-5')}
        >
          <ThemedTouchableOpacityV2
            onPress={props.onSearchBtnPress}
            style={tailwind('text-center pr-4')}
            testID='dex_search_icon'
          >
            <ThemedIcon
              iconType='Feather'
              name='search'
              size={24}
              light={tailwind('text-mono-light-v2-700')}
              dark={tailwind('text-mono-dark-v2-700')}
            />
          </ThemedTouchableOpacityV2>
          {buttonGroup.map((button, index) => (
            <AssetsFilterItem
              key={button.id}
              label={button.label}
              onPress={button.handleOnPress}
              isActive={props.activeButtonGroup === button.id}
              testID={`dex_button_group_${button.id}`}
              additionalStyles={!(buttonGroup.length === index) ? tailwind('mr-3') : undefined}
            />
          )
        )}
        </ScrollView>
      </ThemedViewV2>
    </View>
  )
})
