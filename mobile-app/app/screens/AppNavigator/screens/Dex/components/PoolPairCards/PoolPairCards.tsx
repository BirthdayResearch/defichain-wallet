import BigNumber from 'bignumber.js'
import { View } from '@components'
import {
  ThemedFlatListV2,
  ThemedTextV2,
  ThemedViewV2
} from '@components/themed'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useTokenBestPath } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenBestPath'
import React, { useEffect, useRef, useState } from 'react'
import { NavigationProp, useNavigation, useScrollToTop } from '@react-navigation/native'
import { WalletToken } from '@store/wallet'
import { useDebounce } from '@hooks/useDebounce'
import { useFavouritePoolpairs } from '../../hook/FavouritePoolpairs'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { TotalValueLocked } from '../TotalValueLocked'
import { DexScrollable } from '../DexScrollable'
import { EmptyCryptoIcon } from '@screens/AppNavigator/screens/Portfolio/assets/EmptyCryptoIcon'
import { EmptyTokensScreen } from '@screens/AppNavigator/screens/Portfolio/components/EmptyTokensScreen'
import { PoolPairIconV2 } from '@screens/AppNavigator/screens/Dex/components/PoolPairCards/PoolPairIconV2'
import { DexActionButton, DexAddRemoveLiquidityButton } from '@screens/AppNavigator/screens/Dex/components/DexActionButton'
import { FavoriteButton } from '@screens/AppNavigator/screens/Dex/components/FavoriteButton'
import { PriceRatesSection } from '@screens/AppNavigator/screens/Dex/components/PoolPairCards/PriceRatesSection'
import { APRSection } from '@screens/AppNavigator/screens/Dex/components/PoolPairCards/APRSection'
import { PoolSharesSection } from '@screens/AppNavigator/screens/Dex/components/PoolPairCards/PoolSharesSection'
import { useTokenPrice } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice'
import { DexParamList } from '@screens/AppNavigator/screens/Dex/DexNavigator'
import { Platform } from 'react-native'
import { HeaderNetworkStatus } from '@components/HeaderNetworkStatus'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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
  activeButtonGroup: ButtonGroupTabKey
  setIsScrolled: (isScrolled: boolean) => void
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
  topLiquidityPairs,
  newPoolsPairs,
  activeButtonGroup,
  setIsScrolled
}: PoolPairCardProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const goToNetworkSelect = (): void => {
    navigation.navigate('NetworkSelectionScreen')
  }
  const insets = useSafeAreaInsets()

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

  const onSectionScroll = (offSetY: number): void => {
    const isScrolled = offSetY > 420 // set when scrolled down to available pool pairs
    if (isScrolled) {
      navigation.setOptions({
        header: () => (
          <ThemedViewV2
            light={tailwind('bg-mono-light-v2-00 border-mono-light-v2-100')}
            dark={tailwind('bg-mono-dark-v2-00 border-mono-dark-v2-100')}
            style={[tailwind('p-5 flex flex-row items-center justify-between rounded-b-xl-v2 border-b'), { shadowOpacity: 0, height: ((Platform.OS !== 'android' ? 88 : 76) + insets.top) }]}
          >
            <ThemedTextV2
              style={tailwind('text-left text-xl font-semibold-v2')}
            >
              {translate('screens/DexScreen', 'Decentralized Exchange')}
            </ThemedTextV2>
            <HeaderNetworkStatus
              onPress={goToNetworkSelect}
              containerStyle={tailwind({ 'pt-px': Platform.OS === 'android' })}
            />
          </ThemedViewV2>
        )
      })
    } else {
      navigation.setOptions({
        header: undefined
      })
    }

    setIsScrolled(isScrolled)
  }

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
      type={type}
      isFavouritePoolpair={isFavouritePoolpair}
      setFavouritePoolpair={setFavouritePoolpair}
      onAdd={onAdd}
      onRemove={onRemove}
      onSwap={onSwap}
    />
  )

  return (
    <ThemedFlatListV2
      onScroll={(e) => onSectionScroll(e.nativeEvent.contentOffset.y)}
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
      ListEmptyComponent={
        <>
          {showSearchInput === false && activeButtonGroup === ButtonGroupTabKey.FavouritePairs && (
            <EmptyTokensScreen
              icon={EmptyCryptoIcon}
              containerStyle={tailwind('pt-14')}
              title={translate('screens/DexScreen', 'No favorites added')}
              subTitle={translate('screens/DexScreen', 'Tap the star icon to add your favorite pools here')}
            />
          )}
        </>
      }
      ListHeaderComponent={
        <>
          {(type === 'available' && showSearchInput === false && activeButtonGroup === ButtonGroupTabKey.AllPairs)
            ? (
              <>
                <TotalValueLocked tvl={tvl ?? 0} />
                <TopLiquiditySection onPress={onSwap} pairs={topLiquidityPairs} />
                <NewPoolsSection onPress={onAdd} pairs={newPoolsPairs} />
                <View>
                  <ThemedTextV2
                    dark={tailwind('text-mono-dark-v2-500')}
                    light={tailwind('text-mono-light-v2-500')}
                    style={tailwind('font-normal-v2 text-xs uppercase pl-10 mb-2')}
                  >
                    {translate('screens/DexScreen', 'Available pairs')}
                  </ThemedTextV2>
                </View>
              </>)
            : <></>}
        </>
        }
    />
  )
}
interface PoolCardProps {
  item: DexItem<WalletToken | PoolPairData>
  onAdd: (data: PoolPairData, info: WalletToken) => void
  onRemove: (data: PoolPairData, info: WalletToken) => void
  onSwap: (data: PoolPairData, info: WalletToken) => void
  type: 'your' | 'available'
  index: number
  isFavouritePoolpair: (id: string) => boolean
  setFavouritePoolpair: (id: string) => void
}

const PoolCard = ({
  item,
  isFavouritePoolpair,
  setFavouritePoolpair,
  type,
  onSwap,
  onAdd,
  onRemove
}: PoolCardProps): JSX.Element => {
  const { calculatePriceRates } = useTokenBestPath()
  const { getTokenPrice } = useTokenPrice()
  const { poolpairs: pairs } = useSelector((state: RootState) => state.wallet)
  const blockCount = useSelector((state: RootState) => state.block.count)
  const { data: yourPair } = item
  const isFavoritePair = isFavouritePoolpair(yourPair.id)
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

  if (mappedPair === undefined) {
    return <></>
  }
  return (
    <ThemedViewV2
      style={tailwind('px-5 py-4 mb-2 rounded-lg-v2 mx-5')}
      dark={tailwind('bg-mono-dark-v2-00')}
      light={tailwind('bg-mono-light-v2-00')}
      testID={type === 'your' ? 'pool_pair_row_your' : 'pool_pair_row'}
    >
      {type === 'available'
? (
  <AvailablePool
    symbolA={symbolA}
    symbolB={symbolB}
    pair={mappedPair}
    onSwap={() => onSwap(mappedPair, (yourPair as WalletToken))}
    aToBPrice={priceRates.aToBPrice}
    bToAPrice={priceRates.bToAPrice}
    isFavouritePair={isFavoritePair}
    setFavouritePoolpair={setFavouritePoolpair}
  />
      )
: (
  <YourPoolPair
    symbolA={symbolA}
    symbolB={symbolB}
    walletToken={(yourPair as WalletToken)}
    poolPair={mappedPair}
    onAdd={() => onAdd(mappedPair, yourPair as WalletToken)}
    onRemove={() => onRemove(mappedPair, yourPair as WalletToken)}
    walletTokenAmount={new BigNumber((yourPair as WalletToken).amount)}
    walletTokenPrice={getTokenPrice(
        yourPair.symbol,
        new BigNumber((yourPair as WalletToken).amount),
        true
        )}
  />
        )}
    </ThemedViewV2>
  )
}

interface AvailablePoolProps {
  symbolA: string
  symbolB: string
  onSwap: () => void
  pair: PoolPairData
  aToBPrice: BigNumber
  bToAPrice: BigNumber
  isFavouritePair: boolean
  setFavouritePoolpair: (id: string) => void
}

function AvailablePool (props: AvailablePoolProps): JSX.Element {
  return (
    <>
      <View style={tailwind('flex flex-row justify-between items-center w-full')}>
        <View style={tailwind('flex flex-row items-center')}>
          <PoolPairIconV2
            symbolA={props.symbolA}
            symbolB={props.symbolB}
            customSize={36}
            iconBStyle={tailwind('-ml-4 mr-2')}
          />
          <ThemedTextV2
            style={tailwind('font-semibold-v2 text-base mr-2')}
          >
            {`${props.symbolA}-${props.symbolB}`}
          </ThemedTextV2>
          <FavoriteButton
            pairId={props.pair.id}
            isFavouritePair={props.isFavouritePair}
            setFavouritePoolpair={props.setFavouritePoolpair}
          />
        </View>
        <DexActionButton
          label={translate('screens/DexScreen', 'Swap')}
          onPress={props.onSwap}
          testID={`composite_swap_button_${props.pair.id}`}
          style={tailwind('py-2 px-3')}
        />
      </View>
      <View style={tailwind('flex flex-row justify-between mt-3')}>
        <PriceRatesSection
          {...getSortedPriceRates({
            mappedPair: props.pair,
            aToBPrice: props.aToBPrice,
            bToAPrice: props.bToAPrice
          })}
        />
        {props.pair?.apr?.total !== undefined && props.pair?.apr?.total !== null && (
          <APRSection
            label={`${translate('screens/DexScreen', 'APR')}`}
            value={{
              text: new BigNumber(
                isNaN(props.pair.apr.total) ? 0 : props.pair.apr.total
              )
                .times(100)
                .toFixed(2),
              decimalScale: 2,
              testID: `apr_${props.symbolA}-${props.symbolB}`,
              suffix: '%'
            }}
          />
        )}
      </View>
    </>
  )
}

interface YourPoolPairProps {
  onAdd: () => void
  onRemove: () => void
  symbolA: string
  symbolB: string
  poolPair: PoolPairData
  walletToken: WalletToken
  walletTokenPrice: BigNumber
  walletTokenAmount: BigNumber
}
function YourPoolPair (props: YourPoolPairProps): JSX.Element {
  return (
    <>
      <View style={tailwind('flex flex-row justify-between items-center w-full')}>
        <View style={tailwind('flex flex-row items-center')}>
          <PoolPairIconV2
            symbolA={props.symbolA}
            symbolB={props.symbolB}
            customSize={36}
            iconBStyle={tailwind('-ml-4 mr-2')}
          />
          <ThemedTextV2
            style={tailwind('font-semibold-v2 text-base')}
          >
            {`${props.symbolA}-${props.symbolB}`}
          </ThemedTextV2>
        </View>
        <DexAddRemoveLiquidityButton
          onAdd={props.onAdd}
          onRemove={props.onRemove}
        />
      </View>
      <View style={tailwind('flex flex-row justify-between mt-3')}>
        <PoolSharesSection
          walletTokenPrice={props.walletTokenPrice}
          walletTokenAmount={props.walletTokenAmount}
          tokenID={props.walletToken.id}
        />
        {props.poolPair?.apr?.total !== undefined && props.poolPair?.apr?.total !== null && (
          <APRSection
            label={`${translate('screens/DexScreen', 'APR')}`}
            value={{
              text: new BigNumber(
                isNaN(props.poolPair.apr.total) ? 0 : props.poolPair.apr.total
              )
                .times(100)
                .toFixed(2),
              decimalScale: 2,
              testID: `apr_${props.symbolA}-${props.symbolB}`,
              suffix: '%'
            }}
          />
        )}
      </View>
    </>
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
