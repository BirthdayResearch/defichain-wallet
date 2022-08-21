import BigNumber from 'bignumber.js'
import { View } from '@components'
import {
   ThemedTextV2,
  ThemedViewV2
} from '@components/themed'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useTokenBestPath } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenBestPath'
import React, { useEffect, useRef, useState } from 'react'
import { useScrollToTop } from '@react-navigation/native'
import { WalletToken } from '@store/wallet'
import { useDebounce } from '@hooks/useDebounce'
import { useFavouritePoolpairs } from '../../hook/FavouritePoolpairs'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { ThemedFlatListV2 } from '@components/themed/ThemedFlatListV2'
import { PoolPairTextSectionV2 } from '@screens/AppNavigator/screens/Dex/components/PoolPairCards/PoolPairTextSectionV2'
import {
  DexActionButton,
  DexAddRemoveLiquidityButton
} from '@screens/AppNavigator/screens/Dex/components/DexActionButton'
import { FavoriteButton } from '@screens/AppNavigator/screens/Dex/components/FavoriteButton'
import { PriceRatesSectionV2 } from '@screens/AppNavigator/screens/Dex/components/PoolPairCards/PriceRatesSectionV2'
import { APRSectionV2 } from '@screens/AppNavigator/screens/Dex/components/PoolPairCards/AprSectionV2'
import { PoolSharesSection } from '@screens/AppNavigator/screens/Dex/components/PoolPairCards/PoolSharesSection'
import { useTokenPrice } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice'

interface DexItem<T> {
  type: 'your' | 'available'
  data: T
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
}

export function PoolPairCardsV2 ({
  availablePairs,
  onAdd,
  onRemove,
  onSwap,
  type,
  searchString,
  setIsSearching,
  yourPairs,
  showSearchInput
}: PoolPairCardProps): JSX.Element {
  const { isFavouritePoolpair, setFavouritePoolpair } = useFavouritePoolpairs()
  const sortedPairs = sortPoolpairsByFavourite(
    availablePairs,
    isFavouritePoolpair
  )

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
      type={type}
      onAdd={onAdd}
      onRemove={onRemove}
      onSwap={onSwap}
      isFavouritePoolpair={isFavouritePoolpair}
      setFavouritePoolpair={setFavouritePoolpair}
    />)
  return (
    <ThemedFlatListV2
      contentContainerStyle={tailwind('p-4 pb-2')}
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
      ListHeaderComponent={type === 'available'
? (
  <View>
    <ThemedTextV2
      dark={tailwind('text-mono-dark-v2-500')}
      light={tailwind('text-mono-light-v2-500')}
      style={tailwind('font-normal-v2 text-xs uppercase pl-5 mb-2')}
    >
      {translate('screens/DexScreen', 'Available pairs')}
    </ThemedTextV2>
  </View>
      )
: <></>}
    />
  )
}

interface PoolCardProps {
  item: DexItem<WalletToken | PoolPairData>
  onAdd: (data: PoolPairData, info: WalletToken) => void
  onRemove: (data: PoolPairData, info: WalletToken) => void
  onSwap: (data: PoolPairData) => void
  type: 'your' | 'available'
  index: number
  isFavouritePoolpair: (id: string) => boolean
  setFavouritePoolpair: (id: string) => void
}

const PoolCard = ({
  item,
  type,
  onSwap,
  onAdd,
  onRemove,
  isFavouritePoolpair,
  setFavouritePoolpair
}: PoolCardProps): JSX.Element => {
  const { getTokenPrice } = useTokenPrice()
  const { calculatePriceRates } = useTokenBestPath()
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
      style={tailwind('px-5 py-4 mb-2 rounded-lg-v2')}
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
    onSwap={() => onSwap(mappedPair)}
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
          <PoolPairTextSectionV2
            symbolA={props.symbolA}
            symbolB={props.symbolB}
            iconSize={36}
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
          testID={`available_poolpair_${props.pair.id}`}
          style={tailwind('py-2 px-3')}
        />
      </View>
      <View style={tailwind('flex flex-row justify-between mt-3')}>
        <PriceRatesSectionV2
          {...getSortedPriceRates({
            mappedPair: props.pair,
            aToBPrice: props.aToBPrice,
            bToAPrice: props.bToAPrice
          })}
        />
        {props.pair?.apr?.total !== undefined && props.pair?.apr?.total !== null && (
          <APRSectionV2
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
           <PoolPairTextSectionV2
             symbolA={props.symbolA}
             symbolB={props.symbolB}
             iconSize={36}
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
           <APRSectionV2
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
