import BigNumber from 'bignumber.js'
import { View } from '@components'
import {
  ThemedFlatListV2,
  ThemedIcon,
  ThemedText,
  ThemedView
} from '@components/themed'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ActionSection } from './ActionSection'
import { PoolPairTextSection } from './PoolPairTextSection'
import { InfoSection } from './InfoSection'
import { APRSection } from './APRSection'
import { useTokenPrice } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice'
import { useTokenBestPath } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenBestPath'
import { PriceRatesSection } from './PriceRatesSection'
import React, { useEffect, useRef, useState } from 'react'
import { useScrollToTop } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native'
import { WalletToken } from '@store/wallet'
import { useDebounce } from '@hooks/useDebounce'
import { useFavouritePoolpairs } from '../../hook/FavouritePoolpairs'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import NumberFormat from 'react-number-format'
import { ActiveUSDValue } from '@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValue'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { TotalValueLocked } from '../TotalValueLocked'
import { DexScrollable } from '../DexScrollable'

interface DexItem<T> {
  type: 'your' | 'available'
  data: T
}

export enum ButtonGroupTabKey {
  AllPairs = 'ALL_PAIRS',
  DFIPairs = 'DFI_PAIRS',
  DUSDPairs = 'DUSD_PAIRS',
  FavouritePairs= 'FAVOURITE_PAIRS'
}

interface PoolPairCardProps {
  availablePairs: Array<DexItem<PoolPairData>>
  yourPairs: Array<DexItem<WalletToken>>
  onAdd: (data: PoolPairData, info: WalletToken) => void
  onRemove: (data: PoolPairData, info: WalletToken) => void
  onSwap: (data: PoolPairData) => void
  type: 'your' | 'available'
  setIsSearching: (isSearching: boolean) => void
  searchString: string
  showSearchInput?: boolean
  expandedCardIds: string[]
  setExpandedCardIds: (ids: string[]) => void
  topLiquidityPairs: Array<DexItem<PoolPairData>>
  newPoolsPairs: Array<DexItem<PoolPairData>>
}

export function PoolPairCards ({
  availablePairs,
  onAdd,
  onRemove,
  onSwap,
  type,
  searchString,
  setIsSearching,
  yourPairs,
  showSearchInput,
  expandedCardIds,
  setExpandedCardIds,
  topLiquidityPairs,
  newPoolsPairs
}: PoolPairCardProps): JSX.Element {
  const { isFavouritePoolpair, setFavouritePoolpair } = useFavouritePoolpairs()
  const sortedPairs = sortPoolpairsByFavourite(
    availablePairs,
    isFavouritePoolpair
  )
  const { tvl } = useSelector((state: RootState) => state.block)
  const [filteredYourPairs, setFilteredYourPairs] =
    useState<Array<DexItem<WalletToken>>>(yourPairs)
  const debouncedSearchTerm = useDebounce(searchString, 500)
  const ref = useRef(null)
  useScrollToTop(ref)

  const pairSortingFn = (pairA: DexItem<WalletToken>, pairB: DexItem<WalletToken>): number => (
    availablePairs.findIndex(x => x.data.id === pairA.data.id) -
    availablePairs.findIndex(x => x.data.id === pairB.data.id)
  )

  useEffect(() => {
    setIsSearching(false)
    if (showSearchInput === false) {
      setFilteredYourPairs(yourPairs.sort(pairSortingFn))
      return
    }

    if (debouncedSearchTerm !== undefined && debouncedSearchTerm.trim().length > 0) {
      setFilteredYourPairs(
        yourPairs.filter((pair) =>
          pair.data.displaySymbol
            .toLowerCase()
            .includes(debouncedSearchTerm.trim().toLowerCase())
        ).sort(pairSortingFn)
      )
    } else {
      setFilteredYourPairs([])
    }
  }, [yourPairs, debouncedSearchTerm, showSearchInput])

  const renderItem = ({
    item,
    index
  }: {
    item: DexItem<WalletToken | PoolPairData>
    index: number
  }): JSX.Element => (
    <PoolCard
      index={index}
      key={`${item.data.id}_${index}`}
      item={item}
      expandedCardIds={expandedCardIds}
      type={type}
      isFavouritePoolpair={isFavouritePoolpair}
      setFavouritePoolpair={setFavouritePoolpair}
      onAdd={onAdd}
      onRemove={onRemove}
      onSwap={onSwap}
      setExpandedCardIds={setExpandedCardIds}
    />
  )

  return (
    <ThemedFlatListV2
      light={tailwind('bg-mono-light-v2-100')}
      dark={tailwind('bg-mono-dark-v2-100')}
      contentContainerStyle={tailwind('pb-4', { 'pt-8': type === 'your' })}
      ref={ref}
      data={type === 'your' ? filteredYourPairs : sortedPairs}
      numColumns={1}
      windowSize={2}
      initialNumToRender={5}
      keyExtractor={(item) => item.data.id}
      testID={
        type === 'your' ? 'your_liquidity_tab' : 'available_liquidity_tab'
      }
      renderItem={renderItem}
      ListHeaderComponent={
        <>
          {(type === 'available' && showSearchInput === false)
            ? (
              <>
                <TotalValueLocked tvl={tvl ?? 0} />
                <TopLiquiditySection onPress={onSwap} pairs={topLiquidityPairs} />
                <NewPoolsSection onPress={onAdd} pairs={newPoolsPairs} />
              </>)
            : <></>}
        </>
        }
    />
  )
}
interface PoolCardProps {
  item: DexItem<WalletToken | PoolPairData>
  expandedCardIds: string[]
  setExpandedCardIds: (ids: string[]) => void
  isFavouritePoolpair: (id: string) => boolean
  setFavouritePoolpair: (id: string) => void
  onAdd: (data: PoolPairData, info: WalletToken) => void
  onRemove: (data: PoolPairData, info: WalletToken) => void
  onSwap: (data: PoolPairData) => void
  type: 'your' | 'available'
  index: number
}

const PoolCard = ({
  index,
  item,
  expandedCardIds,
  isFavouritePoolpair,
  setFavouritePoolpair,
  type,
  onAdd,
  onRemove,
  onSwap,
  setExpandedCardIds
}: PoolCardProps): JSX.Element => {
  const { getTokenPrice } = useTokenPrice()
  const { calculatePriceRates } = useTokenBestPath()
  const { poolpairs: pairs } = useSelector((state: RootState) => state.wallet)
  const blockCount = useSelector((state: RootState) => state.block.count)
  const { data: yourPair } = item
  const isFavouritePair = isFavouritePoolpair(yourPair.id)
  const [priceRates, setPriceRates] = useState({
    aToBPrice: new BigNumber(''),
    bToAPrice: new BigNumber(''),
    estimated: new BigNumber('')
  })

  const poolPairData = pairs.find(
    (pr) => pr.data.symbol === (yourPair as AddressToken).symbol
  )
  const mappedPair = poolPairData?.data

  useEffect(() => {
    void getPriceRates()
  }, [mappedPair, blockCount])

  const getPriceRates = async (): Promise<void> => {
    if (mappedPair !== undefined) {
      const priceRates = await calculatePriceRates(
        mappedPair.tokenA.id,
        mappedPair.tokenB.id,
        new BigNumber('1')
      )
      setPriceRates(priceRates)
    }
  }

  const [symbolA, symbolB] =
    mappedPair?.tokenA != null && mappedPair?.tokenB != null
      ? [mappedPair.tokenA.displaySymbol, mappedPair.tokenB.displaySymbol]
      : yourPair.symbol.split('-')
  const toRemove = new BigNumber(1)
    .times((yourPair as WalletToken).amount)
    .decimalPlaces(8, BigNumber.ROUND_DOWN)
  const ratioToTotal = toRemove.div(mappedPair?.totalLiquidity?.token ?? 1)
  const symbol = `${symbolA}-${symbolB}`

  // assume defid will trim the dust values too
  const tokenATotal = ratioToTotal
    .times(mappedPair?.tokenA.reserve ?? 0)
    .decimalPlaces(8, BigNumber.ROUND_DOWN)
  const tokenBTotal = ratioToTotal
    .times(mappedPair?.tokenB.reserve ?? 0)
    .decimalPlaces(8, BigNumber.ROUND_DOWN)
  const isExpanded = expandedCardIds.some((id) => id === yourPair.id)

  const onCollapseToggle = (): void => {
    if (isExpanded) {
      setExpandedCardIds(
        expandedCardIds.filter((id) => id !== yourPair.id))
    } else {
      setExpandedCardIds([...expandedCardIds, yourPair.id])
    }
  }

  if (mappedPair === undefined) {
    return <></>
  }
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-gray-700')}
      light={tailwind('bg-white border-gray-200')}
      style={tailwind('p-4 mb-2 border rounded mx-5')}
      testID={type === 'your' ? 'pool_pair_row_your' : 'pool_pair_row'}
    >
      <View
        style={tailwind('flex flex-row justify-between w-full')}
        testID={`pool_pair_row_${index}_${symbol}`}
      >
        <View style={tailwind('max-w-4/5 flex-shrink')}>
          <View style={tailwind('flex-row items-center')}>
            <PoolPairTextSection
              symbolA={symbolA}
              symbolB={symbolB}
            />
            {type === 'available' && (
              <TouchableOpacity
                onPress={() => setFavouritePoolpair(yourPair.id)}
                style={tailwind('p-1.5')}
                testID={`favorite_${symbolA}-${symbolB}`}
              >
                <ThemedIcon
                  iconType='MaterialIcons'
                  name={isFavouritePair ? 'star' : 'star-outline'}
                  size={20}
                  light={tailwind(
                    isFavouritePair ? 'text-warning-500' : 'text-gray-600'
                  )}
                  dark={tailwind(
                    isFavouritePair ? 'text-darkwarning-500' : 'text-gray-300'
                  )}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View>
          {mappedPair?.apr?.total !== undefined && mappedPair?.apr?.total !== null && (
            <APRSection
              label={`${translate('screens/DexScreen', 'APR')}: `}
              value={{
                text: new BigNumber(
                  isNaN(mappedPair.apr.total) ? 0 : mappedPair.apr.total
                )
                  .times(100)
                  .toFixed(2),
                decimalScale: 2,
                testID: `apr_${symbol}`,
                suffix: '%'
              }}
            />
          )}
        </View>
      </View>
      {type === 'available'
        ? (
          <PriceRatesSection
            {...getSortedPriceRates({
              mappedPair,
              aToBPrice: priceRates.aToBPrice,
              bToAPrice: priceRates.bToAPrice
            })}
          />
        )
        : (
          <View style={tailwind('flex flex-col mt-2')}>
            <ThemedText
              dark={tailwind('text-gray-400')}
              light={tailwind('text-gray-500')}
              style={tailwind('text-xs font-normal leading-3 mt-1')}
            >
              {translate('screens/DexScreen', 'Your share in pool')}
            </ThemedText>
            <NumberFormat
              decimalScale={8}
              displayType='text'
              renderText={(textValue) => (
                <ThemedText
                  testID={`share_in_pool_${symbol}`}
                  style={tailwind('text-sm leading-4 font-semibold mb-1 mt-2')}
                >
                  {textValue}
                </ThemedText>
              )}
              thousandSeparator
              value={(yourPair as WalletToken).amount}
            />
            <ActiveUSDValue
              price={getTokenPrice(
                yourPair.symbol,
                new BigNumber((yourPair as WalletToken).amount),
                true
              )}
              testId={`share_in_pool_${symbol}_USD`}
            />
          </View>
        )}
      <View
        style={tailwind('flex flex-row justify-between items-center mt-4 -mb-2 flex-wrap')}
      >
        <View style={tailwind('mb-2')}>
          <ActionSection
            onAdd={() => onAdd(mappedPair, yourPair as WalletToken)}
            onRemove={() => onRemove(mappedPair, yourPair as WalletToken)}
            onSwap={() => onSwap(mappedPair)}
            symbol={symbol}
            type={type}
            pair={mappedPair}
          />
        </View>
        <TouchableOpacity
          onPress={onCollapseToggle}
          style={tailwind('flex flex-row pb-2 pt-1.5')}
          testID={`details_${symbol}`}
        >
          <ThemedIcon
            light={tailwind('text-primary-500')}
            dark={tailwind('text-darkprimary-500')}
            iconType='MaterialIcons'
            name={!isExpanded ? 'expand-more' : 'expand-less'}
            size={32}
          />
        </TouchableOpacity>
      </View>
      {
        isExpanded &&
          <View>
            <ThemedView
              style={tailwind('border-b h-px mt-4')}
              light={tailwind('border-gray-100')}
              dark={tailwind('border-gray-700')}
            />
            <InfoSection
              type={type}
              pair={mappedPair}
              tokenATotal={
              type === 'your'
                ? tokenATotal.toFixed(8)
                : mappedPair?.tokenA.reserve
            }
              tokenBTotal={
              type === 'your'
                ? tokenBTotal.toFixed(8)
                : mappedPair?.tokenB.reserve
            }
              testID={type}
            />
          </View>
      }
    </ThemedView>
  )
}

function getSortedPriceRates ({
  mappedPair,
  aToBPrice,
  bToAPrice
}: {
  mappedPair: PoolPairData
  aToBPrice: BigNumber
  bToAPrice: BigNumber
}): {
  tokenA: {
    symbol: string
    displaySymbol: string
    priceRate: BigNumber
  }
  tokenB: {
    symbol: string
    displaySymbol: string
    priceRate: BigNumber
  }
} {
  const tokenA = {
    symbol: mappedPair.tokenA.symbol,
    displaySymbol: mappedPair.tokenA.displaySymbol,
    priceRate: aToBPrice
  }
  const tokenB = {
    symbol: mappedPair.tokenB.symbol,
    displaySymbol: mappedPair.tokenB.displaySymbol,
    priceRate: bToAPrice
  }

  return {
    tokenA,
    tokenB
  }
}

function sortPoolpairsByFavourite (
  pairs: Array<DexItem<PoolPairData>>,
  isFavouritePair: (id: string) => boolean
): Array<DexItem<PoolPairData>> {
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

function TopLiquiditySection ({ pairs, onPress }: {pairs: Array<DexItem<PoolPairData>>, onPress: (data: PoolPairData) => void}): JSX.Element {
  return (
    <DexScrollable
      testID='dex_top_liquidity'
      sectionHeading='TOP LIQUIDITY'
      sectionStyle={tailwind('my-6')}
    >
      {pairs.map((pairItem, index) => (
        <DexScrollable.Card
          key={`${pairItem.data.id}_${index}`}
          poolpair={pairItem.data}
          style={tailwind('mr-2')}
          onPress={() => onPress(pairItem.data)}
          label={translate('screens/DexScreen', 'Swap')}
          testID={`composite_swap_${pairItem.data.id}`}
        />
      ))}
    </DexScrollable>
  )
}

function NewPoolsSection ({ pairs, onPress }: {pairs: Array<DexItem<PoolPairData | WalletToken>>, onPress: (data: PoolPairData, info: WalletToken) => void}): JSX.Element {
  return (
    <DexScrollable
      testID='dex_new_pools'
      sectionHeading='NEW POOLS'
      sectionStyle={tailwind('mb-6')}
    >
      {pairs.map((pairItem, index) => (
        <DexScrollable.Card
          key={`${pairItem.data.id}_${index}`}
          poolpair={pairItem.data as PoolPairData}
          style={tailwind('mr-2')}
          onPress={() => onPress(pairItem.data as PoolPairData, pairItem.data as WalletToken)}
          label={translate('screens/DexScreen', 'Add to LP')}
          testID={`add_liquidity_${pairItem.data.id}`}
        />
      ))}
    </DexScrollable>
  )
}
