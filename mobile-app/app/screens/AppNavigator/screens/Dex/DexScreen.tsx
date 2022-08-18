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
import { ThemedScrollViewV2, ThemedViewV2 } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from './DexNavigator'
import { DisplayDexGuidelinesPersistence } from '@api'
import { DexGuidelines } from './DexGuidelines'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { tokensSelector, WalletToken } from '@store/wallet'
import { RootState } from '@store'
import { EmptyActivePoolpair } from './components/EmptyActivePoolPair'
import { debounce } from 'lodash'
import { ButtonGroupTabKey, PoolPairCards } from './components/PoolPairCards/PoolPairCards'
import { ButtonGroupV2 } from './components/ButtonGroupV2'

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
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const [activeTab, setActiveTab] = useState<string>(TabKey.AvailablePoolPair)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [displayGuidelines, setDisplayGuidelines] = useState<boolean>(true)
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
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
    [pairs]
  )

  useEffect(() => {
    DisplayDexGuidelinesPersistence.get()
      .then((shouldDisplayGuidelines: boolean) => {
        setDisplayGuidelines(shouldDisplayGuidelines)
      })
      .catch(logger.error)
      .finally(() => setIsLoaded(true))
  }, [])

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
            showSearchInput={showSearchInput}
          />
        )}
      </View>
    </>
  )
}
