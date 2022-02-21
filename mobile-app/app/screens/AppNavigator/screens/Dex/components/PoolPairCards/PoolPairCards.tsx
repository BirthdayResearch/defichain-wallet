import BigNumber from 'bignumber.js'
import { View } from '@components'
import {
  ThemedFlatList,
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
import { useTokenPrice } from '@screens/AppNavigator/screens/Balances/hooks/TokenPrice'
import { PriceRatesSection } from './PriceRatesSection'
import Collapsible from 'react-native-collapsible'
import { useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { WalletToken } from '@store/wallet'
import { useDebounce } from '@hooks/useDebounce'
import { useFavouritePoolpairs } from '../../hook/FavouritePoolpairs'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'

interface DexItem<T> {
  type: 'your' | 'available'
  data: T
}

interface PoolPairCardProps {
  availablePairs: Array<DexItem<PoolPairData>>
  yourPairs: Array<DexItem<WalletToken>>
  onAdd: (data: PoolPairData) => void
  onRemove: (data: PoolPairData) => void
  type: 'your' | 'available'
  setIsSearching: (isSearching: boolean) => void
  searchString: string
}

export function PoolPairCards ({
  availablePairs,
  onAdd,
  onRemove,
  type,
  searchString,
  setIsSearching,
  yourPairs
}: PoolPairCardProps): JSX.Element {
  const { isFavouritePoolpair, setFavouritePoolpair } = useFavouritePoolpairs()
  const sortedPairs = sortPoolpairsByFavourite(
    availablePairs,
    isFavouritePoolpair
  )
  const { calculatePriceRates } = useTokenPrice()
  const [expandedCardIds, setExpandedCardIds] = useState<string[]>([])

  const [filteredYourPairs, setFilteredYourPairs] =
    useState<Array<DexItem<WalletToken>>>(yourPairs)
  const debouncedSearchTerm = useDebounce(searchString, 2000)

  useEffect(() => {
    setIsSearching(false)
    setFilteredYourPairs(
      yourPairs.filter((pair) =>
        pair.data.displaySymbol
          .toLowerCase()
          .includes(debouncedSearchTerm.trim().toLowerCase())
      )
    )
  }, [yourPairs, debouncedSearchTerm])

  const renderItem = ({
    item,
    index
  }: {
    item: DexItem<WalletToken | PoolPairData>
    index: number
  }): JSX.Element => {
    const { data: yourPair } = item
    const poolPairData = availablePairs.find(
      (pr) => pr.data.symbol === (yourPair as AddressToken).symbol
    )
    const mappedPair = poolPairData?.data

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
    const priceRates = calculatePriceRates(
      mappedPair?.tokenA.symbol ?? '',
      ((poolPairData?.data) != null) ? [poolPairData?.data] : [],
      new BigNumber('1')
    )
    const isExpanded = expandedCardIds.some((id) => id === yourPair.id)

    const onCollapseToggle = (): void =>
      setExpandedCardIds(
        isExpanded
          ? expandedCardIds.filter((id) => id !== yourPair.id)
          : [...expandedCardIds, yourPair.id]
      )

    const isFavouritePair = isFavouritePoolpair(yourPair.id)

    if (mappedPair === undefined) {
      return <></>
    }

    return (
      <ThemedView
        dark={tailwind('bg-gray-800 border-gray-700')}
        light={tailwind('bg-white border-gray-200')}
        style={tailwind('p-4 mb-2 border rounded')}
        testID='pool_pair_row'
      >
        <View
          style={tailwind('flex flex-row justify-between')}
          testID={`pool_pair_row_${index}_${symbol}`}
        >
          <PoolPairTextSection
            symbolA={symbolA}
            symbolB={symbolB}
            pairId={yourPair.id}
            isFavouritePair={isFavouritePair}
            setFavouritePoolpair={setFavouritePoolpair}
          />
          {mappedPair?.apr?.total !== undefined && (
            <APRSection
              label={translate('screens/DexScreen', 'APR:')}
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
        {/* TODO(PIERRE): Check how to optimize a lot of reloads happening here */}
        <PriceRatesSection
          tokenA={{
            symbol: mappedPair.tokenA.symbol,
            displaySymbol: mappedPair.tokenA.displaySymbol,
            aToBPrice: priceRates.aToBPrice
          }}
          tokenB={{
            symbol: mappedPair.tokenB.symbol,
            displaySymbol: mappedPair.tokenB.displaySymbol,
            bToAPrice: priceRates.bToAPrice
          }}
        />
        <View style={tailwind('flex flex-row justify-between items-center')}>
          <ActionSection
            onAdd={() => onAdd(mappedPair)}
            onRemove={() => onRemove(mappedPair)}
            symbol={symbol}
            type={type}
            pair={mappedPair}
          />
          <TouchableOpacity
            onPress={onCollapseToggle}
            style={tailwind('flex flex-row')}
          >
            <ThemedText
              style={tailwind('text-sm font-medium leading-4')}
              light={tailwind('text-primary-500')}
              dark={tailwind('text-darkprimary-500')}
            >
              Details
            </ThemedText>
            <ThemedIcon
              light={tailwind('text-primary-500')}
              dark={tailwind('text-darkprimary-500')}
              iconType='MaterialIcons'
              name={!isExpanded ? 'expand-less' : 'expand-more'}
              size={20}
            />
          </TouchableOpacity>
        </View>
        <Collapsible collapsed={!isExpanded}>
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
            pairAmount={(yourPair as WalletToken).amount}
            testID={type}
          />
        </Collapsible>
      </ThemedView>
    )
  }
  return (
    <ThemedFlatList
      contentContainerStyle={tailwind('p-4 pb-2')}
      data={type === 'your' ? filteredYourPairs : sortedPairs}
      numColumns={1}
      keyExtractor={(_item, index) => index.toString()}
      testID='available_liquidity_tab'
      renderItem={renderItem}
    />
  )
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
