import { StyleProp, ViewStyle } from 'react-native'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import BigNumber from 'bignumber.js'
import { useEffect, useState, useLayoutEffect, useCallback } from 'react'
import * as React from 'react'
import NumberFormat from 'react-number-format'
import { useSelector, useDispatch, batch } from 'react-redux'
import { View } from '@components'
import { IconButton } from '@components/IconButton'
import { getNativeIcon } from '@components/icons/assets'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { ThemedFlatList, ThemedIcon, ThemedScrollView, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from './DexNavigator'
import { DisplayDexGuidelinesPersistence } from '@api'
import { DexGuidelines } from './DexGuidelines'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { Tabs } from '@components/Tabs'
import { fetchPoolPairs, fetchTokens, tokensSelector, WalletToken } from '@store/wallet'
import { RootState } from '@store'
import { HeaderSearchIcon } from '@components/HeaderSearchIcon'
import { HeaderSearchInput } from '@components/HeaderSearchInput'
import { EmptyActivePoolpair } from './components/EmptyActivePoolPair'
import { debounce } from 'lodash'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useFavouritePoolpairs } from './hook/FavouritePoolpairs'
import { useDebounce } from '@hooks/useDebounce'

enum TabKey {
  YourPoolPair = 'YOUR_POOL_PAIRS',
  AvailablePoolPair = 'AVAILABLE_POOL_PAIRS'
}

export function DexScreen (): JSX.Element {
  const logger = useLogger()
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const dispatch = useDispatch()
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const [activeTab, setActiveTab] = useState<string>(TabKey.AvailablePoolPair)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [displayGuidelines, setDisplayGuidelines] = useState<boolean>(true)
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const blockCount = useSelector((state: RootState) => state.block.count)
  const {
    poolpairs: pairs,
    hasFetchedPoolpairData
  } = useSelector((state: RootState) => state.wallet)
  const yourLPTokens = useSelector(() => {
    const _yourLPTokens: Array<DexItem<WalletToken>> = tokens.filter(({ isLPS }) => isLPS).map(data => ({
      type: 'your',
      data: data
    }))
    return _yourLPTokens
  })
  const onTabChange = (tabKey: TabKey): void => {
    setActiveTab(tabKey)
  }

  const tabsList = [{
    id: TabKey.AvailablePoolPair,
    label: translate('screens/DexScreen', 'Browse pool pairs'),
    disabled: false,
    handleOnPress: () => onTabChange(TabKey.AvailablePoolPair)
  }, {
    id: TabKey.YourPoolPair,
    label: translate('screens/DexScreen', 'Your pool pairs'),
    disabled: false,
    handleOnPress: () => onTabChange(TabKey.YourPoolPair)
  }]

  const {
    tvl
  } = useSelector((state: RootState) => state.block)

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

  // Search
  const [showSearchInput, setShowSearchInput] = useState(false)
  const [searchString, setSearchString] = useState('')
  const [filteredAvailablePairs, setFilteredAvailablePairs] = useState<Array<DexItem<PoolPairData>>>(pairs)
  const [isSearching, setIsSearching] = useState(false)
  const handleFilter = useCallback(
    debounce((searchString: string) => {
      setIsSearching(false)
      setFilteredAvailablePairs(pairs.filter(pair =>
        pair.data.displaySymbol.toLowerCase().includes(searchString.trim().toLowerCase())
      ))
    }, 500)
  , [activeTab, pairs, yourLPTokens])

  useEffect(() => {
    batch(() => {
      dispatch(fetchPoolPairs({ client }))
      dispatch(fetchTokens({ client, address }))
    })
  }, [address, blockCount])

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

  // Hide loader when pool pair API updates
  useEffect(() => {
    handleFilter(searchString)
  }, [pairs])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (): JSX.Element => {
        if (!displayGuidelines) {
          return (
            <HeaderSearchIcon onPress={() => setShowSearchInput(true)} testID='dex_search_icon' />
          )
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
      <TVLSection tvl={tvl ?? 0} />
      <Tabs tabSections={tabsList} testID='dex_tabs' activeTabKey={activeTab} />
      <View style={tailwind('flex-1')}>
        {
          activeTab === TabKey.AvailablePoolPair && (!hasFetchedPoolpairData || isSearching) && (
            <ThemedScrollView contentContainerStyle={tailwind('p-4')}>
              <SkeletonLoader
                row={4}
                screen={SkeletonLoaderScreen.Dex}
              />
            </ThemedScrollView>
          )
        }
        {
          activeTab === TabKey.AvailablePoolPair && hasFetchedPoolpairData && !isSearching && (
            <AvailablePoolPairCards
              availablePairs={filteredAvailablePairs}
              onAdd={onAdd}
            />
          )
        }

        {
          activeTab === TabKey.YourPoolPair && yourLPTokens.length === 0 && (
            <EmptyActivePoolpair />
          )
        }
        {
          activeTab === TabKey.YourPoolPair && yourLPTokens.length > 0 && (
            <YourPoolPairCards
              yourPairs={yourLPTokens}
              availablePairs={pairs}
              onAdd={onAdd}
              onRemove={onRemove}
              setIsSearching={setIsSearching}
              searchString={searchString}
            />
          )
        }
      </View>
    </>
  )
}

function TVLSection (props: {tvl: number}): JSX.Element {
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('flex flex-row px-4 py-3 justify-between text-center')}
    >
      <View style={tailwind('flex flex-col')}>
        <ThemedText
          light={tailwind('text-gray-500')} dark={tailwind('text-gray-400')}
          style={tailwind('text-xs')}
        >{translate('screens/DexScreen', 'Total Value Locked (USD)')}
        </ThemedText>
        <ThemedText>
          <NumberFormat
            displayType='text'
            prefix='$'
            renderText={(val: string) => (
              <ThemedText
                dark={tailwind('text-gray-50')}
                light={tailwind('text-gray-900')}
                style={tailwind('text-lg text-left font-bold')}
                testID='DEX_TVL'
              >
                {val}
              </ThemedText>
            )}
            thousandSeparator
            value={new BigNumber(props.tvl).decimalPlaces(0, BigNumber.ROUND_DOWN).toString()}
          />
        </ThemedText>
      </View>
      <ActionButton
        name='swap-horiz'
        onPress={() => navigation.navigate({
          name: 'CompositeSwap',
          params: {},
          merge: true
        })}
        pair='composite'
        label={translate('screens/DexScreen', 'SWAP')}
        style={tailwind('my-2 p-2')}
        testID='composite_swap'
      />
    </ThemedView>
  )
}
interface DexItem<T> {
  type: 'your' | 'available'
  data: T
}

interface YourPoolPairCardsItems {
  yourPairs: Array<DexItem<WalletToken>>
  availablePairs: Array<DexItem<PoolPairData>>
  onAdd: (data: PoolPairData) => void
  onRemove: (data: PoolPairData) => void
  setIsSearching: (isSearching: boolean) => void
  searchString: string
}

function YourPoolPairCards ({
  yourPairs,
  availablePairs,
  onAdd,
  onRemove,
  setIsSearching,
  searchString
}: YourPoolPairCardsItems): JSX.Element {
  const [filteredYourPairs, setFilteredYourPairs] = useState<Array<DexItem<WalletToken>>>(yourPairs)
  const debouncedSearchTerm = useDebounce(searchString, 2000)

  useEffect(() => {
    setIsSearching(false)
    setFilteredYourPairs(yourPairs.filter(pair =>
      pair.data.displaySymbol.toLowerCase().includes(debouncedSearchTerm.trim().toLowerCase())
    ))
  }, [yourPairs, debouncedSearchTerm])

  return (
    <ThemedFlatList
      contentContainerStyle={tailwind('p-4 pb-2')}
      data={filteredYourPairs}
      numColumns={1}
      keyExtractor={(_item, index) => index.toString()}
      testID='your_liquidity_tab'
      renderItem={({
        item
      }: { item: DexItem<WalletToken> }): JSX.Element => {
        const { data: yourPair } = item
        const poolPairData = availablePairs.find(pr => pr.data.symbol === (yourPair as AddressToken).symbol)
        const mappedPair = poolPairData?.data

        const [symbolA, symbolB] = (mappedPair?.tokenA != null && mappedPair?.tokenB != null)
          ? [mappedPair.tokenA.displaySymbol, mappedPair.tokenB.displaySymbol]
          : yourPair.symbol.split('-')
        const toRemove = new BigNumber(1).times(yourPair.amount).decimalPlaces(8, BigNumber.ROUND_DOWN)
        const ratioToTotal = toRemove.div(mappedPair?.totalLiquidity?.token ?? 1)
        const symbol = `${symbolA}-${symbolB}`

        // assume defid will trim the dust values too
        const tokenATotal = ratioToTotal.times(mappedPair?.tokenA.reserve ?? 0).decimalPlaces(8, BigNumber.ROUND_DOWN)
        const tokenBTotal = ratioToTotal.times(mappedPair?.tokenB.reserve ?? 0).decimalPlaces(8, BigNumber.ROUND_DOWN)

        return (
          <ThemedView
            dark={tailwind('bg-gray-800 border-gray-700')}
            light={tailwind('bg-white border-gray-200')}
            style={tailwind('p-4 mb-2 border rounded')}
            testID='pool_pair_row_your'
          >
            <View style={tailwind('flex-row items-center justify-between')}>
              <View style={tailwind('flex-row items-center')}>
                <PoolPairIcon symbolA={symbolA} symbolB={symbolB} />
                <ThemedText
                  style={tailwind('text-base font-medium')}
                  testID={`your_symbol_${symbol}`}
                >
                  {symbol}
                </ThemedText>
              </View>
            </View>
            <PoolPairInfoDetails
              type='your'
              pair={mappedPair}
              pairAmount={yourPair.amount}
              tokenATotal={tokenATotal.toFixed(8)}
              tokenBTotal={tokenBTotal.toFixed(8)}
              testID='your'
            />
            <YourPoolPairActions
              onAdd={() => onAdd((poolPairData as DexItem<PoolPairData>)?.data)}
              onRemove={() => onRemove((poolPairData as DexItem<PoolPairData>)?.data)}
              symbol={symbol}
            />
          </ThemedView>
        )
      }}
    />
  )
}

function AvailablePoolPairCards ({
  availablePairs,
  onAdd
}: { availablePairs: Array<DexItem<PoolPairData>>, onAdd: (data: PoolPairData) => void }): JSX.Element {
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const { isFavouritePoolpair, setFavouritePoolpair } = useFavouritePoolpairs()
  const sortedPairs = sortPoolpairsByFavourite(availablePairs, isFavouritePoolpair)

  return (
    <ThemedFlatList
      contentContainerStyle={tailwind('p-4 pb-2')}
      data={sortedPairs}
      numColumns={1}
      keyExtractor={(_item, index) => index.toString()}
      testID='available_liquidity_tab'
      renderItem={({
        item, index
      }: { item: DexItem<PoolPairData>, index: number }): JSX.Element => {
        const { data: pair } = item
        const [symbolA, symbolB] = (pair?.tokenA != null && pair?.tokenB != null)
          ? [pair.tokenA.displaySymbol, pair.tokenB.displaySymbol]
          : pair.symbol.split('-')
        const symbol = `${symbolA}-${symbolB}`
        const isFavouritePair = isFavouritePoolpair(pair.id)

        return (
          <ThemedView
            dark={tailwind('bg-gray-800 border-gray-700')}
            light={tailwind('bg-white border-gray-200')}
            style={tailwind('p-4 mb-2 border rounded')}
            testID='pool_pair_row'
          >
            <View style={tailwind('flex-row items-center')} testID={`pool_pair_row_${index}_${symbol}`}>
              <PoolPairIcon symbolA={symbolA} symbolB={symbolB} />
              <ThemedText
                style={tailwind('text-base font-medium')}
                testID={`your_symbol_${symbol}`}
              >
                {symbol}
              </ThemedText>
            </View>

            <PoolPairInfoDetails
              type='available' pair={pair} tokenATotal={pair?.tokenA.reserve}
              tokenBTotal={pair?.tokenB.reserve} testID='available'
            />

            <View style={tailwind('flex-row mt-4 justify-between')}>
              <View style={tailwind('flex flex-row flex-wrap flex-1')}>
                <ActionButton
                  name='add'
                  onPress={() => onAdd(pair)}
                  pair={symbol}
                  label={translate('screens/DexScreen', 'ADD LIQUIDITY')}
                  style={tailwind('p-2 mr-2 mt-2')}
                  testID={`pool_pair_add_${symbol}`}
                />
                <ActionButton
                  name='swap-horiz'
                  onPress={() => navigation.navigate({
                    name: 'CompositeSwap',
                    params: { pair },
                    merge: true
                  })}
                  pair={symbol}
                  label={translate('screens/DexScreen', 'SWAP')}
                  disabled={!pair.tradeEnabled || !pair.status}
                  style={tailwind('p-2 mr-2 mt-2')}
                  testID={`pool_pair_swap-horiz_${symbol}`}
                />
              </View>
              <View style={tailwind('flex justify-end')}>
                <ThemedTouchableOpacity
                  light={tailwind('border-gray-300 bg-white')}
                  dark={tailwind('border-gray-400 bg-gray-900')}
                  onPress={() => setFavouritePoolpair(pair.id)}
                  style={tailwind('p-1.5 border rounded flex-row items-center')}
                  testID={`favorite_${symbol}`}
                >
                  <ThemedIcon
                    iconType='MaterialIcons'
                    name={isFavouritePair ? 'star' : 'star-outline'}
                    onPress={() => setFavouritePoolpair(pair.id)}
                    size={20}
                    light={tailwind(isFavouritePair ? 'text-warning-500' : 'text-gray-600')}
                    dark={tailwind(isFavouritePair ? 'text-darkwarning-500' : 'text-gray-300')}
                    style={tailwind('')}
                  />
                </ThemedTouchableOpacity>
              </View>
            </View>
          </ThemedView>
        )
      }}
    />
  )
}

function PoolPairInfoDetails (props: { type: 'available' | 'your', pairAmount?: string, pair: PoolPairData | undefined, tokenATotal: string, tokenBTotal: string, testID: string }): JSX.Element {
  const {
    type,
    pair,
    pairAmount,
    tokenATotal,
    tokenBTotal
  } = props
  const pairSymbol = (pair?.tokenA.displaySymbol !== undefined && pair?.tokenB.displaySymbol !== undefined) ? `${pair?.tokenA?.displaySymbol}-${pair?.tokenB?.displaySymbol}` : ''
  const decimalScale = type === 'available' ? 2 : 8

  return (
    <View style={tailwind('mt-1 -mb-1 flex flex-row flex-wrap')}>
      {
        pair !== undefined && (
          <>
            {
              type === 'your' && pairAmount !== undefined && (
                <PoolPairInfoLine
                  label={translate('screens/DexScreen', 'Pooled {{symbol}}', { symbol: pairSymbol })}
                  value={{
                    text: pairAmount,
                    decimalScale: 8,
                    testID: `your_${pairSymbol}`
                  }}
                />
              )
            }
            <PoolPairInfoLine
              label={translate('screens/DexScreen', `${type === 'available' ? 'Pooled' : 'Your pooled'} {{symbol}}`, { symbol: pair?.tokenA?.displaySymbol })}
              value={{
                text: tokenATotal,
                decimalScale: decimalScale,
                testID: `${props.testID}_${pair?.tokenA?.displaySymbol}`
              }}
            />
            <PoolPairInfoLine
              label={translate('screens/DexScreen', `${type === 'available' ? 'Pooled' : 'Your pooled'} {{symbol}}`, { symbol: pair?.tokenB?.displaySymbol })}
              value={{
                text: tokenBTotal,
                decimalScale: decimalScale,
                testID: `${props.testID}_${pair?.tokenB?.displaySymbol}`
              }}
            />
            {
              pair.totalLiquidity.usd !== undefined && (
                <PoolPairInfoLine
                  label={translate('screens/DexScreen', 'Total liquidity (USD)')}
                  value={{
                    text: pair.totalLiquidity.usd,
                    decimalScale: 2,
                    testID: `totalLiquidity_${pairSymbol}`
                  }}
                />)
            }
            {
              pair.apr?.total !== undefined &&
                <PoolPairInfoLine
                  label={translate('screens/DexScreen', 'APR')}
                  value={{
                  text: new BigNumber(isNaN(pair.apr.total) ? 0 : pair.apr.total).times(100).toFixed(2),
                  decimalScale: 2,
                  testID: `apr_${pairSymbol}`,
                  suffix: '%'
                }}
                />
            }
          </>
        )
      }
    </View>
  )
}

interface PoolPairInfoLineProps {
  label: string
  value: {
    decimalScale: number
    suffix?: string
    testID: string
    text: string
  }
}

function PoolPairInfoLine (props: PoolPairInfoLineProps): JSX.Element {
  return (
    <View style={[tailwind('flex-col justify-between mt-3'), { width: '50%' }]}>
      <ThemedText
        dark={tailwind('text-gray-400')}
        light={tailwind('text-gray-500')}
        style={tailwind('text-xs font-normal')}
      >
        {props.label}
      </ThemedText>
      <NumberFormat
        decimalScale={props.value.decimalScale}
        displayType='text'
        renderText={value => (
          <ThemedText
            style={tailwind('text-sm')}
            testID={props.value.testID}
          >
            {value}
          </ThemedText>
        )}
        thousandSeparator
        suffix={props.value.suffix}
        value={props.value.text}
      />
    </View>
  )
}

function YourPoolPairActions (props: { onAdd: () => void, onRemove: () => void, symbol: string }): JSX.Element {
  const {
    onAdd,
    onRemove,
    symbol
  } = props
  return (
    <View style={tailwind('flex-row mt-3 flex-wrap -mr-2')}>
      <ActionButton
        name='add'
        onPress={onAdd}
        pair={symbol}
        label={translate('screens/DexScreen', 'ADD MORE')}
        style={tailwind('p-2 mr-2 mt-2')}
        testID={`pool_pair_add_${symbol}`}
      />

      <ActionButton
        name='remove'
        onPress={onRemove}
        pair={symbol}
        label={translate('screens/DexScreen', 'REMOVE')}
        style={tailwind('p-2 mr-2 mt-2')}
        testID={`pool_pair_remove_${symbol}`}
      />
    </View>
  )
}

function ActionButton (props: { name: React.ComponentProps<typeof MaterialIcons>['name'], pair: string, onPress: () => void, label: string, style?: StyleProp<ViewStyle>, disabled?: boolean, testID: string }): JSX.Element {
  return (
    <IconButton
      iconName={props.name}
      iconSize={16}
      iconType='MaterialIcons'
      onPress={props.onPress}
      style={props.style}
      testID={props.testID}
      iconLabel={props.label}
      disabled={props.disabled}
    />
  )
}

function PoolPairIcon (props: { symbolA: string, symbolB: string }): JSX.Element {
  const IconA = getNativeIcon(props.symbolA)
  const IconB = getNativeIcon(props.symbolB)

  return (
    <>
      <IconA
        height={24}
        width={24}
        style={tailwind('relative z-10 -mt-3')}
      />

      <IconB
        height={24}
        width={24}
        style={tailwind('-ml-3 mt-3 mr-3')}
      />
    </>
  )
}

function sortPoolpairsByFavourite (pairs: Array<DexItem<PoolPairData>>, isFavouritePair: (id: string) => boolean): Array<DexItem<PoolPairData>> {
  return pairs.slice().sort((firstPair, secondPair) => {
    if (isFavouritePair(firstPair.data.id)) {
      return -1
    }
    if (isFavouritePair(secondPair.data.id)) {
      return 1
    }
    return 0
  })
}
